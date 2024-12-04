import { AuthContext } from "@/auth";
import { AlertInfo, Motivation, MotivationActor } from "@/types";
import { useState, useContext, useEffect, useRef } from "react";
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
  FaTags,
  FaInfo,
  FaEye,
  FaEyeSlash,
  FaTrash,
  FaLock,
  FaUnlock,
} from "react-icons/fa";
import schemesImg from "@/assets/thumb_scheme.png";
import authImg from "@/assets/thumb_auth.png";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";
import notavailImg from "@/assets/thumb_notavail.png";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  useDeleteMotivationActor,
  useGetAllActors,
  useGetMotivation,
  usePublishMotivation,
  usePublishMotivationActor,
  useUnpublishMotivation,
  useUnpublishMotivationActor,
} from "@/api/services/motivations";
import { MotivationActorModal } from "./components/MotivationActorModal";
import { MotivationModal } from "./components/MotivationModal";

import { MotivationPrinciples } from "./components/MotivationPrinciples";
import { MotivationCriteria } from "./components/MotivationCriteria";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";

const actorImages: { [key: string]: string } = {
  "PID Service Provider (Role)": serviceImg,
  "PID Manager (Role)": manageImg,
  "PID Scheme (Component)": schemesImg,
  "PID Authority (Role)": authImg,
  "PID Owner (Role)": ownersImg,
};

function getActorImage(actor: string): string {
  return actorImages[actor] || notavailImg;
}

export default function MotivationDetails() {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [motivation, setMotivation] = useState<Motivation>();
  const [availableActors, setAvailableActors] = useState<MotivationActor[]>([]);
  const [showAddActor, setShowAddActor] = useState(false);
  const [showUpdate, setShowUpdate] = useState(false);
  const [tabKey, setTabKey] = useState("assessment-types");

  const mutationPublish = usePublishMotivationActor(keycloak?.token || "");
  const mutationUnpublish = useUnpublishMotivationActor(keycloak?.token || "");

  interface DeleteActorModalConfig {
    show: boolean;
    title: string;
    message: string;
    itemId: string;
    itemName: string;
    mtvId: string;
  }

  const mutationMtvPublish = usePublishMotivation(keycloak?.token || "");
  const mutationMtvUnpublish = useUnpublishMotivation(keycloak?.token || "");

  const handleMtvPublish = (mtvId: string) => {
    const promise = mutationMtvPublish
      .mutateAsync(mtvId)
      .catch((err) => {
        alert.current = {
          message: "Error during motivation publish",
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Motivation succesfully published!",
        };
      });
    toast.promise(promise, {
      loading: "Publishing...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleMtvUnpublish = (mtvId: string) => {
    const promise = mutationMtvUnpublish
      .mutateAsync(mtvId)
      .catch((err) => {
        alert.current = {
          message: "Error during motivation unpublish",
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Motivation succesfully unpublished!",
        };
      });
    toast.promise(promise, {
      loading: "Unpublishing...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  // Delete Modal
  const [deleteActorModalConfig, setDeleteActorModalConfig] =
    useState<DeleteActorModalConfig>({
      show: false,
      title: "Delete Assessment Type",
      message: "Are you sure you want to delete the following Assessment type?",
      itemId: "",
      itemName: "",
      mtvId: params.id || "",
    });

  const mutationDelete = useDeleteMotivationActor(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteActorModalConfig.itemId && deleteActorModalConfig.mtvId) {
      const promise = mutationDelete
        .mutateAsync({
          mtvId: deleteActorModalConfig.mtvId,
          actId: deleteActorModalConfig.itemId,
        })
        .catch((err) => {
          alert.current = {
            message: "Error during Assessment type deletion!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Assessment type succesfully deleted.",
          };
          setDeleteActorModalConfig({
            ...deleteActorModalConfig,
            show: false,
            itemId: "",
            itemName: "",
            mtvId: params.id || "",
          });
        });
      toast.promise(promise, {
        loading: "Deleting...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const handlePublish = (mtvId: string, actId: string) => {
    const promise = mutationPublish
      .mutateAsync({ mtvId, actId })
      .catch((err) => {
        alert.current = {
          message: "Error during Assessment Type publish",
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Assessment Type succesfully published!",
        };
      });
    toast.promise(promise, {
      loading: "Publishing...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleUnpublish = (mtvId: string, actId: string) => {
    const promise = mutationUnpublish
      .mutateAsync({ mtvId, actId })
      .catch((err) => {
        alert.current = {
          message: "Error during Assessment Type unpublish",
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: "Assessment Type succesfully unpublished!",
        };
      });
    toast.promise(promise, {
      loading: "Unpublishing...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const { data: motivationData } = useGetMotivation({
    id: params.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });
  const tooltipView = (
    <Tooltip id="tip-restore">View Assesment Details</Tooltip>
  );
  const tooltipManageCriteria = (
    <Tooltip id="tip-restore">Manage Criteria</Tooltip>
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
    const hash = window.location.hash;
    if (hash === "#assessment-types") {
      setTabKey("assessment-types");
    } else if (hash === "#principles") {
      setTabKey("principles");
    } else if (hash === "#criteria") {
      setTabKey("criteria");
    }
  }, []);

  // take care of window location hash when tabs change
  useEffect(() => {
    if (tabKey === "assessment-types") {
      window.location.hash = "#assessment-types";
    } else if (tabKey === "principles") {
      window.location.hash = "#principles";
    } else if (tabKey === "criteria") {
      window.location.hash = "#criteria";
    }
  }, [tabKey]);

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
        <DeleteModal
          show={deleteActorModalConfig.show}
          title={deleteActorModalConfig.title}
          message={deleteActorModalConfig.message}
          itemId={deleteActorModalConfig.itemId}
          itemName={deleteActorModalConfig.itemName}
          onHide={() => {
            setDeleteActorModalConfig({
              ...deleteActorModalConfig,
              show: false,
            });
          }}
          handleDelete={handleDeleteConfirmed}
        />
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
      <div className="mt-2">
        {motivation?.published ? (
          <Alert className="p-0" variant="warning">
            <Row>
              <Col className="d-flex align-items-center">
                <small className="p-2">
                  <FaLock className="me-2" />
                  This motivation is currently published so no further changes
                  can be made until it is unpublished...
                </small>
              </Col>
              <Col md="auto">
                <Button
                  size="sm"
                  className="m-2"
                  variant="warning"
                  onClick={() => {
                    if (motivation) {
                      handleMtvUnpublish(motivation.id);
                    }
                  }}
                >
                  <FaEyeSlash className="me-2" />
                  Unpublish
                </Button>
              </Col>
            </Row>
          </Alert>
        ) : (
          <Alert className="p-0" variant="light">
            <Row>
              <Col className="d-flex align-items-center">
                <small className="p-2">
                  <FaUnlock className="me-2" />
                  This motivation is currently unpublished and editable
                </small>
              </Col>
              <Col md="auto">
                <Button
                  size="sm"
                  className="m-2"
                  variant="success"
                  onClick={() => {
                    if (motivation) {
                      handleMtvPublish(motivation.id);
                    }
                  }}
                >
                  <FaEye className="me-2" />
                  Publish
                </Button>
              </Col>
            </Row>
          </Alert>
        )}
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
            {motivation?.published ? (
              <span className="opacity-75 btn btn-lt border-black bg-secondary mt-4">
                Update Details
              </span>
            ) : (
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
            )}
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
          onSelect={(tabKey) => setTabKey(tabKey || "assessment-types")}
          fill
        >
          <Tab
            eventKey="assessment-types"
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
                        disabled={
                          availableActors.length == 0 || motivation?.published
                        }
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
                        disabled={motivation?.published}
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
                        <ListGroup.Item
                          key={item.id}
                          className={"align-middle"}
                        >
                          <Row>
                            <Col
                              className={`${item.published ? "" : "opacity-50"}`}
                            >
                              <div className="flex items-center ng-star-inserted">
                                <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                                  <img
                                    src={getActorImage(item.label)}
                                    className={`text-center m-1 rounded-full ${item.published ? "" : "cat-greyscale"}`}
                                    width="60%"
                                  />
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
                                    to={`/admin/motivations/${params.id}/templates/actors/${item.id}`}
                                  >
                                    <FaBars />
                                  </Link>
                                </OverlayTrigger>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={tooltipManageCriteria}
                                >
                                  {item.published ? (
                                    <span className="btn btn-light btn-sm m-1 disabled">
                                      <FaAward />
                                    </span>
                                  ) : (
                                    <>
                                      <Link
                                        className="btn btn-light btn-sm m-1"
                                        to={`/admin/motivations/${params.id}/actors/${item.id}`}
                                      >
                                        <FaAward />
                                      </Link>
                                    </>
                                  )}
                                </OverlayTrigger>
                                {item.published ? (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tip-unpublish">
                                        Unpublish Assessment Type
                                      </Tooltip>
                                    }
                                  >
                                    <Button
                                      className="btn btn-light btn-sm m-1"
                                      onClick={() => {
                                        handleUnpublish(
                                          params.id || "",
                                          item.id,
                                        );
                                      }}
                                    >
                                      <FaEye />
                                    </Button>
                                  </OverlayTrigger>
                                ) : (
                                  <OverlayTrigger
                                    placement="top"
                                    overlay={
                                      <Tooltip id="tip-publish">
                                        Publish Assessment Type
                                      </Tooltip>
                                    }
                                  >
                                    <Button
                                      className="btn btn-light btn-sm m-1"
                                      onClick={() => {
                                        handlePublish(params.id || "", item.id);
                                      }}
                                    >
                                      <FaEyeSlash />
                                    </Button>
                                  </OverlayTrigger>
                                )}
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tip-delete">
                                      Delete Assessment Type
                                    </Tooltip>
                                  }
                                >
                                  {item.published ? (
                                    <span className="btn btn-light btn-sm m-1 disabled">
                                      <FaTrash />
                                    </span>
                                  ) : (
                                    <Button
                                      className="btn btn-light btn-sm m-1"
                                      onClick={() => {
                                        setDeleteActorModalConfig({
                                          ...deleteActorModalConfig,
                                          show: true,
                                          itemId: item.id,
                                          itemName: `${item.label} - ${item.act}`,
                                        });
                                      }}
                                    >
                                      <FaTrash />
                                    </Button>
                                  )}
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
            <MotivationPrinciples
              mtvId={params.id || ""}
              published={motivation?.published || false}
            />
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
            <MotivationCriteria
              mtvId={params.id || ""}
              published={motivation?.published || false}
            />
          </Tab>
          {/*
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
          */}
        </Tabs>
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(`/admin/motivations`);
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
