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
  FaBorderNone,
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
import { MotivationMetrics } from "./components/MotivationMetrics";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
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
          message: t("page_motivations.toast_publish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_publish_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_publish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleMtvUnpublish = (mtvId: string) => {
    const promise = mutationMtvUnpublish
      .mutateAsync(mtvId)
      .catch((err) => {
        alert.current = {
          message: t("page_motivations.toast_unpublish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_unpublish_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_unpublish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  // Delete Modal
  const [deleteActorModalConfig, setDeleteActorModalConfig] =
    useState<DeleteActorModalConfig>({
      show: false,
      title: t("page_motivations.modal_asmt_delete_title"),
      message: t("page_motivations.modal_asmt_delete_message"),
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
            message: t("page_motivations.toast_asmt_delete_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_asmt_delete_sucess"),
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
        loading: t("page_motivations.toast_asmt_delete_progress"),
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
          message: t("page_motivations.toast_asmt_publish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_asmt_publish_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_asmt_publish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  };

  const handleUnpublish = (mtvId: string, actId: string) => {
    const promise = mutationUnpublish
      .mutateAsync({ mtvId, actId })
      .catch((err) => {
        alert.current = {
          message: t("page_motivations.toast_asmt_unpublish_fail"),
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("page_motivations.toast_asmt_unpublish_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_asmt_unpublish_progress"),
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
    <Tooltip id="tip-restore">{t("page_motivations.tip_asmt_view")}</Tooltip>
  );
  const tooltipManageCriteria = (
    <Tooltip id="tip-restore">
      {t("page_motivations.tip_manage_criteria")}
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
    const hash = window.location.hash;
    if (hash === "#assessment-types") {
      setTabKey("assessment-types");
    } else if (hash === "#principles") {
      setTabKey("principles");
    } else if (hash === "#criteria") {
      setTabKey("criteria");
    } else if (hash === "#metrics") {
      setTabKey("metrics");
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
    } else if (tabKey === "metrics") {
      window.location.hash = "#metrics";
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
            {t("page_motivations.details_title")}
            {motivation && (
              <p className="lead cat-view-lead">
                {motivation?.mtv} - {motivation?.label}
                <br />
                <span className="text-sm">{t("page_motivations.mtv1")}</span>
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
                  {t("page_motivations.info_published")}
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
                  {t("buttons.unpublish")}
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
                  {t("page_motivations.info_unpublished")}
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
                  {t("buttons.publish")}
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
                {t("buttons.update_details")}
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
                {t("buttons.update_details")}
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
                {t("page_motivations.asmt_types")}
              </span>
            }
          >
            <Row>
              <div className="px-5 mt-4">
                <div className="d-flex justify-content-between mb-2">
                  <h5 className="text-muted cat-view-heading ">
                    {t("page_motivations.asmt_types_subtitle")}:{" "}
                    {motivation?.mtv} - {motivation?.label}
                    <p className="lead cat-view-lead">
                      <span className="text-sm">
                        {t("page_motivations.asmt_types_info")}{" "}
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
                        <FaPlus /> {t("page_motivations.add_actor")}
                      </Button>
                    </div>
                  ) : (
                    <span className="text-secondary text-sm">
                      {t("page_motivations.no_actors_available")}
                    </span>
                  )}
                </div>
                {motivation?.actors.length === 0 ? (
                  <Alert variant="warning" className="text-center mx-auto">
                    <h3>
                      <FaExclamationTriangle />
                    </h3>
                    <h5>{t("page_motivations.no_actors_included")} </h5>
                    <div>
                      <span className="align-baseline">
                        {t("page_motivations.please_use_the_button")}{" "}
                      </span>
                      <Button
                        disabled={motivation?.published}
                        variant="link"
                        className="p-0 m-0 align-baseline"
                        onClick={() => {
                          setShowAddActor(true);
                        }}
                      >
                        {t("page_motivations.click_here")}
                      </Button>
                      <span className="align-baseline">
                        {" "}
                        {t("page_motivations.add_new_ones")}
                      </span>
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
                                        {t(
                                          "page_motivations.tip_unpublish_asmt",
                                        )}
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
                                        {t("page_motivations.tip_publish_asmt")}
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
                                      {t("page_motivations.tip_delete_asmt")}
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
                {t("principles")}
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
                {t("criteria")}
              </span>
            }
          >
            <MotivationCriteria
              mtvId={params.id || ""}
              published={motivation?.published || false}
            />
          </Tab>

          <Tab
            eventKey="metrics"
            title={
              <span>
                <span className="fs-6 text-primary">
                  <FaBorderNone />
                </span>{" "}
                {t("metrics")}
              </span>
            }
          >
            <MotivationMetrics
              mtvId={params.id || ""}
              published={motivation?.published || false}
            />
          </Tab>
        </Tabs>
      </div>

      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(`/admin/motivations`);
          }}
        >
          {t("buttons.back")}
        </Button>
      </div>
    </div>
  );
}
