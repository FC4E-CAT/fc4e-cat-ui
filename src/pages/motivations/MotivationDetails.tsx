import { AuthContext } from "@/auth";
import { Motivation, MotivationActor } from "@/types";
import { useState, useContext, useEffect } from "react";
import {
  Alert,
  Button,
  Col,
  ListGroup,
  Row,
  OverlayTrigger,
  Tooltip,
  Tab,
  Tabs,
} from "react-bootstrap";

import {
  FaFile,
  FaPlus,
  FaExclamationTriangle,
  FaBars,
  FaAward,
  FaBorderNone,
  FaTags,
  FaInfo,
} from "react-icons/fa";
import schemesImg from "@/assets/thumb_scheme.png";
import authImg from "@/assets/thumb_auth.png";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";
import notavailImg from "@/assets/thumb_notavail.png";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useGetAllActors, useGetMotivation } from "@/api/services/motivations";
import { MotivationActorModal } from "./components/MotivationActorModal";
import { MotivationModal } from "./components/MotivationModal";
import { FaTrashCan } from "react-icons/fa6";

export default function MotivationDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [motivation, setMotivation] = useState<Motivation>();
  const [availableActors, setAvailableActors] = useState<MotivationActor[]>([]);
  const [showAddActor, setShowAddActor] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [tabKey, setTabKey] = useState("assess-types");

  const { data: motivationData } = useGetMotivation({
    id: params.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });
  const tooltipView = (
    <Tooltip id="tip-restore">View Assesment Details</Tooltip>
  );
  const tooltipManagePrinciples = (
    <Tooltip id="tip-restore">Manage Principles</Tooltip>
  );
  const tooltipManageCriteria = (
    <Tooltip id="tip-restore">Manage Criteria</Tooltip>
  );
  const tooltipManageMetrics = (
    <Tooltip id="tip-restore">Manage Metrics</Tooltip>
  );
  const tooltipDeleteActor = (
    <Tooltip id="tip-restore">
      Delete the connection with the motivation
    </Tooltip>
  );
  const {
    data: actorData,
    fetchNextPage: actorFetchNextPage,
    hasNextPage: actorHasNextPage,
  } = useGetAllActors({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all actors in one array
    let tmpAct: MotivationActor[] = [];
    const mtvActors =
      motivation?.actors.map((item) => {
        return item.id;
      }) || [];

    // iterate over backend pages and gather all items in the actors array
    if (actorData?.pages) {
      actorData.pages.map((page) => {
        tmpAct = [...tmpAct, ...page.content];
      });
      if (actorHasNextPage) {
        actorFetchNextPage();
      }
    }
    setAvailableActors(tmpAct.filter((item) => !mtvActors.includes(item.id)));
  }, [actorData, actorHasNextPage, actorFetchNextPage, motivation]);

  useEffect(() => {
    setMotivation(motivationData);
  }, [motivationData]);

  return (
    <div className="pb-4">
      <div className="cat-view-heading-block border-bottom row ">
        <MotivationActorModal
          motivationActors={availableActors}
          id={motivation?.id || ""}
          show={showAddActor}
          onHide={() => {
            setShowAddActor(false);
          }}
        />
        <MotivationModal
          cloneId={null}
          cloneName=""
          motivation={motivation || null}
          show={showUpdate}
          onHide={() => {
            setShowUpdate(false);
          }}
        />
        <Col>
          <h2 className="cat-view-heading text-muted">
            Motivation Details
            {motivation && (
              <p className="lead cat-view-lead">
                {motivation?.mtv} - {motivation?.label}
                <br />
                <span className="text-sm">
                  Motivations are the main Capability of the service for
                  different assessment foci. Motivations provide much of the Why
                  - the reason an assessment is being performed.
                </span>
              </p>
            )}
          </h2>
        </Col>
      </div>

      <Row>
        <Col className="col col-lg-3 border-right  border-dashed">
          <div className="d-flex flex-column align-items-center text-center p-1 py-1">
            <div className="py-3 mt-2">
              <span className="p-2 text-center">
                <FaFile size={"4rem"} className="text-secondary" />
              </span>
            </div>
            <span className="font-weight-bold"> </span>
            <span className="text-black-50">
              {motivation?.mtv} - {motivation?.label}
            </span>

            <span
              id="validated"
              className="badge rounded-pill text-bg-light text-secondary"
            >
              {motivation?.motivation_type.label}
            </span>

            <Link
              id="profile-update-button"
              to="#"
              onClick={() => {
                setShowUpdate(true);
              }}
              className="btn btn-lt border-black mt-4"
            >
              Update Details
            </Link>
          </div>
        </Col>
        <Col className="col-md-auto col-lg-9 border-right">
          <div className="p-3">
            <Row className="py-3 mt-4">
              <small>{motivation?.description}</small>
            </Row>
          </div>
        </Col>
      </Row>
      <Row className="mt-4   pb-4"></Row>
      <Row></Row>
      <div id="motivation-tabs">
        {/* Included actors */}
        <Tabs
          id="motivation-tabs-inside"
          activeKey={tabKey}
          onSelect={(tabKey) => setTabKey(tabKey || "assess-types")}
          fill
        >
          <Tab
            eventKey="assess-types"
            title={
              <span>
                <span className="fs-6 text-primary">
                  <FaInfo />
                </span>{" "}
                Assessment types
              </span>
            }
          >
            <Row>
              <div className="px-5 mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <h5 className="text-muted cat-view-heading ">
                    List of Assessment types of specific actors under:{" "}
                    {motivation?.mtv} - {motivation?.label}
                    <p className="lead cat-view-lead">
                      <span className="text-sm">
                        In order to start the creation of an assessment please
                        start relating actors to this Motivation.{" "}
                      </span>
                    </p>
                  </h5>
                  {availableActors.length > 0 ? (
                    <div>
                      <Button
                        variant="warning"
                        onClick={() => {
                          setShowAddActor(true);
                        }}
                        disabled={availableActors.length == 0}
                      >
                        <FaPlus /> Add Actor
                      </Button>
                    </div>
                  ) : (
                    <span className="text-secondary text-sm">
                      No available actors
                    </span>
                  )}
                </div>
                {motivation?.actors.length === 0 ? (
                  <Alert variant="warning" className="text-center mx-auto">
                    <h3>
                      <FaExclamationTriangle />
                    </h3>
                    <h5>No actors included in this motivation... </h5>
                    <div>
                      <span className="align-baseline">
                        Please use the button above or{" "}
                      </span>
                      <Button
                        variant="link"
                        className="p-0 m-0 align-baseline"
                        onClick={() => {
                          setShowAddActor(true);
                        }}
                      >
                        click here
                      </Button>
                      <span className="align-baseline"> to add new ones</span>
                    </div>
                  </Alert>
                ) : (
                  <ListGroup className="mt-2">
                    {motivation?.actors.map((item) => {
                      return (
                        <ListGroup.Item key={item.id}>
                          <Row>
                            <Col>
                              <div className="flex items-center ng-star-inserted">
                                <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                                  {item.label ===
                                  "PID Service Provider (Role)" ? (
                                    <img
                                      src={serviceImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  ) : item.label === "PID Manager (Role)" ? (
                                    <img
                                      src={manageImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  ) : item.label ===
                                    "PID Scheme (Component)" ? (
                                    <img
                                      src={schemesImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  ) : item.label === "PID Authority (Role)" ? (
                                    <img
                                      src={authImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  ) : item.label === "PID Owner (Role)" ? (
                                    <img
                                      src={ownersImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  ) : (
                                    <img
                                      src={notavailImg}
                                      className="text-center m-1 rounded-full"
                                      width="60%"
                                    />
                                  )}
                                </div>
                                <div>
                                  <div className="flex text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                                    {item.label}
                                  </div>
                                  <div className="text-xs text-gray-600 ng-star-inserted">
                                    {item.act}
                                  </div>
                                </div>
                              </div>
                            </Col>
                            <Col md="auto">
                              <div className="d-flex flex-nowrap">
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipView}
                                >
                                  <Link
                                    className="btn btn-light btn-sm m-1"
                                    to={`/motivations/${params.id}/templates/actors/${item.id}`}
                                  >
                                    <FaBars />
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipManagePrinciples}
                                >
                                  <Link
                                    className="btn btn-light btn-sm m-1"
                                    to={`/motivations/${params.id}/actors/${item.id}`}
                                  >
                                    <FaTags />
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipManageCriteria}
                                >
                                  <Link
                                    className="btn btn-light btn-sm m-1"
                                    to={`/motivations/${params.id}/actors/${item.id}`}
                                  >
                                    <FaAward />
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipManageMetrics}
                                >
                                  <Link
                                    className="btn btn-light btn-sm m-1"
                                    to={`/motivations/${params.id}/actors/${item.id}`}
                                  >
                                    <FaBorderNone />
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipDeleteActor}
                                >
                                  <Link
                                    className="btn btn-light btn-sm m-1"
                                    to={`/motivations/${params.id}/actors/${item.id}`}
                                  >
                                    <FaTrashCan className="text-danger" />
                                  </Link>
                                </OverlayTrigger>
                              </div>
                            </Col>
                          </Row>
                        </ListGroup.Item>
                      );
                    })}
                  </ListGroup>
                )}
              </div>
            </Row>
          </Tab>
          <Tab
            eventKey="principles"
            title={
              <span>
                <span className="fs-6 text-primary">
                  <FaTags />
                </span>{" "}
                Principles
              </span>
            }
          >
            Tab content for Principles
          </Tab>
          <Tab
            eventKey="criteria"
            title={
              <span>
                <span className="fs-6 text-primary">
                  <FaAward />
                </span>{" "}
                Criteria
              </span>
            }
          >
            Tab content for criteria
          </Tab>
          <Tab
            eventKey="Metrics"
            title={
              <span>
                <span className="fs-6 text-primary">
                  <FaBorderNone />
                </span>{" "}
                Metrics
              </span>
            }
          >
            Tab content for Metrics
          </Tab>
        </Tabs>
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
