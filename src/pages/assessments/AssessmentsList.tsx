import { useRef, useState, useCallback, useContext, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaTimes,
  FaDownload,
  FaFileImport,
  FaShare,
  FaEye,
  FaEyeSlash,
  FaBars,
  FaUsers,
  FaCheckCircle,
  FaTrophy,
  FaClock,
} from "react-icons/fa";
import {
  Alert,
  Badge,
  Button,
  Card,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import type {
  AssessmentListItem,
  AssessmentFiltersType,
  AlertInfo,
} from "@/types";
import {
  useGetAssessments,
  useGetObjects,
  useDeleteAssessment,
  useGetAssessment,
} from "@/api";
import { AuthContext } from "@/auth";
import { getUniqueValuesForKey, prettyPrintRanking } from "@/utils";
import { Link } from "react-router-dom";
import { DeleteModal } from "@/components/DeleteModal";
import ROUTES, { buildRoute } from "../../routes";

import { toast } from "react-hot-toast";
import { ShareModal } from "./components/ShareModal";
import { useTranslation } from "react-i18next";
import { PublishModal } from "@/components";
import styles from "@/pages/admin/reports/Reports.module.css";

type Pagination = {
  page: number;
  size: number;
  sortBy: string;
};

/**
 * employ additional props so that the component can be used both for
 * displaying a user's assessment list and also a list of public
 * assessments
 */
interface AssessmentListProps {
  listPublic?: boolean;
}

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

interface ShareModalConfig {
  show: boolean;
  name: string;
  id: string;
}

interface PublishModalConfig {
  show: boolean;
  id: string;
  name: string;
  admin: boolean;
  publish: boolean;
}

function AssessmentsList({ listPublic = false }: AssessmentListProps) {
  const { keycloak, registered, userType } = useContext(AuthContext)!;

  const isIdentified = userType === "Identified";

  // get the extra url parameters when in public list mode from url
  const urlParams = new URLSearchParams(location.search);
  const actorName = urlParams.get("actor-name");
  const actorIdParam = urlParams.get("actor-id");
  const motivationIdParam = urlParams.get("motivation-id");
  const { t } = useTranslation();

  const tooltipPublic = (
    <Tooltip id="tip-public">{t("page_assessment_list.tip_public")}</Tooltip>
  );
  const tooltipPrivate = (
    <Tooltip id="tip-private">{t("page_assessment_list.tip_private")}</Tooltip>
  );

  const [opts, setOpts] = useState<Pagination>({
    page: 1,
    size: 10,
    sortBy: "",
  });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: "Delete Assessment",
      message: "Are you sure you want to delete the following assessment?",
      itemId: "",
      itemName: "",
    },
  );

  // Share Modal
  const [shareModalConfig, setShareModalConfig] = useState<ShareModalConfig>({
    show: false,
    name: "",
    id: "",
  });

  // Publish Modal
  const [publishModalConfig, setPublishModalConfig] =
    useState<PublishModalConfig>({
      show: false,
      name: "",
      id: "",
      admin: false,
      publish: true,
    });

  const [filters, setFilters] = useState<AssessmentFiltersType>({
    subject_name: "",
    subject_type: "",
  });

  // data get list of motivations
  const { isLoading, data, refetch } = useGetAssessments({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    token: keycloak?.token || "",
    isRegistered: registered,
    subject_name: filters.subject_name,
    subject_type: filters.subject_type,
    isPublic: listPublic,
    actorId: actorIdParam || "",
    motivationId: "",
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, filters, refetch]);

  const { data: userObjects } = useGetObjects({
    size: 100,
    page: 1,
    token: keycloak?.token || "",
    assessmentTypeId: motivationIdParam || "",
    actorId: actorIdParam || "",
  });

  const [asmtNumID, setAsmtNumID] = useState<string>("");
  const qAssessment = useGetAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered || false,
    isPublic: listPublic,
  });

  useEffect(() => {
    if (qAssessment.data) {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(qAssessment.data.assessment_doc, null, 2),
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `${qAssessment.data.assessment_doc.id}.json`;

      link.click();
    }
  }, [qAssessment]);

  const mutationDeleteAssessment = useDeleteAssessment(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDeleteAssessment
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: t("page_assessment_list.toast_delete_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_assessment_list.toast_delete_success"),
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_assessment_list.toast_delete_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const handleDeleteOpenModal = (item: AssessmentListItem) => {
    setDeleteModalConfig({
      ...deleteModalConfig,
      show: true,
      itemId: item.id,
      itemName: item.name,
    });
  };

  const handleShareOpenModal = (item: AssessmentListItem) => {
    setShareModalConfig({
      show: true,
      name: item.name,
      id: item.id,
    });
  };

  const renderSubjectNameOptions = useCallback(() => {
    if (userObjects?.content !== undefined) {
      return getUniqueValuesForKey(userObjects?.content, "name").map((v, i) => (
        <option key={`option-subject-name` + i} value={v}>
          {v}
        </option>
      ));
    }
  }, [userObjects]);

  const renderSubjectTypeOptions = useCallback(() => {
    if (userObjects?.content !== undefined) {
      return getUniqueValuesForKey(userObjects?.content, "type").map((v, i) => (
        <option key={`option-subject-type` + i} value={v}>
          {v}
        </option>
      ));
    }
  }, [userObjects]);

  // get the assessment data to create the table
  const assessments: AssessmentListItem[] = data ? data?.content : [];

  return (
    <div className={listPublic ? "container bg-light p-2 mb-5 rounded" : ""}>
      <PublishModal
        show={publishModalConfig.show}
        name={publishModalConfig.name}
        admin={publishModalConfig.admin}
        id={publishModalConfig.id}
        publish={publishModalConfig.publish}
        onHide={() => {
          setPublishModalConfig({
            id: "",
            name: "",
            admin: false,
            show: false,
            publish: true,
          });
        }}
      />
      <ShareModal
        show={shareModalConfig.show}
        name={shareModalConfig.name}
        id={shareModalConfig.id}
        onHide={() => {
          setShareModalConfig({ id: "", name: "", show: false });
        }}
      />
      <DeleteModal
        show={deleteModalConfig.show}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemId={deleteModalConfig.itemId}
        itemName={deleteModalConfig.itemName}
        onHide={() => {
          setDeleteModalConfig({ ...deleteModalConfig, show: false });
        }}
        handleDelete={handleDeleteConfirmed}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            {/* if component is used in public list mode display the actor name */}
            {listPublic && actorName && <span>{actorName} </span>}
            {t("assessments")}
            <p className="lead cat-view-lead">
              {t(
                listPublic
                  ? "page_assessment_list.subtitle_public"
                  : "page_assessment_list.subtitle",
              )}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          {!listPublic && !isIdentified && (
            <>
              <Link
                to={ROUTES.ASSESSMENTS.CREATE}
                className="btn btn-warning  ms-3"
              >
                <FaPlus />{" "}
                <span className="align-middle">{t("buttons.create_new")}</span>
              </Link>
              <Link
                to={ROUTES.ASSESSMENTS.IMPORT}
                className="btn btn-dark  ms-3"
              >
                <FaFileImport />{" "}
                <span className="align-middle">{t("buttons.import")}</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <div className="row cat-view-search-block ">
        <Col>
          <Row>
            <Col md="auto" className="col-lg-5">
              <div className="d-flex align-items-center">
                <OverlayTrigger
                  key="overlay-subject-type"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-subject-type`}>
                      {t("page_assessment_list.tip_filter_subject_type")}
                    </Tooltip>
                  }
                >
                  <span>
                    <FaInfoCircle className="me-2" />
                  </span>
                </OverlayTrigger>

                <Form.Select
                  id="subject-type-select"
                  aria-label={t("page_assessment_list.filter_subject_type")}
                  onChange={(e) => {
                    setFilters({ ...filters, subject_type: e.target.value });
                    refetch();
                  }}
                  value={filters.subject_type}
                >
                  <option value="">
                    {t("page_assessment_list.filter_subject_type_select")}
                  </option>
                  {renderSubjectTypeOptions()}
                </Form.Select>
              </div>
            </Col>
            <Col md="auto" className="col-lg-5">
              <div className="d-flex align-items-center">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-subject-name`}>
                      {t("page_assessment_list.tip_filter_subject_name")}
                    </Tooltip>
                  }
                >
                  <span>
                    <FaInfoCircle className="me-2" />
                  </span>
                </OverlayTrigger>

                <Form.Select
                  id="subject-name-select"
                  aria-label={t("page_assessment_list.filter_subject_name")}
                  onChange={(e) => {
                    setFilters({ ...filters, subject_name: e.target.value });
                    refetch();
                  }}
                  value={filters.subject_name}
                >
                  <option value={""}>
                    {t("page_assessment_list.filter_subject_name_select")}
                  </option>
                  {renderSubjectNameOptions()}
                </Form.Select>
              </div>
            </Col>
            <Col className="d-flex justify-content-end filter-div">
              <Button
                id="clear_filter_button"
                className="btn btn-primary btn centerButton"
                type="submit"
                onClick={() => {
                  setFilters({
                    subject_name: "",
                    subject_type: "",
                  });
                  refetch();
                }}
              >
                {t("buttons.clear")}
              </Button>
            </Col>
          </Row>
        </Col>
      </div>
      <div className="py-2 px-2">
        {assessments.length > 0 ? (
          <Row className="mt-3 align-items-stretch">
            {assessments.map((item) => (
              <Col
                key={item.id}
                lg={3}
                md={6}
                sm={12}
                className="mb-2 d-flex align-items-stretch"
              >
                <Card className="shadow border-1 w-100">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-start mb-1">
                      <div className="flex-grow-1 me-3">
                        <Card.Title className="fw-light fs-5">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-name-${item.id}`}>
                                {t("fields.name")}
                              </Tooltip>
                            }
                          >
                            <span>{item.name}</span>
                          </OverlayTrigger>
                        </Card.Title>
                        <div className="text-muted small mb-1">
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-type-${item.id}`}>
                                {t("fields.type")}
                              </Tooltip>
                            }
                          >
                            <span>{item.type}</span>
                          </OverlayTrigger>
                        </div>
                        <div className="d-flex align-items-center">
                          {item.shared_to_user && (
                            <OverlayTrigger
                              key="shared-with-others"
                              placement="top"
                              overlay={
                                <Tooltip id={`tip-shared-with-others`}>
                                  {t("page_assessment_list.tip_shared_by")}
                                </Tooltip>
                              }
                            >
                              <FaUsers className="text-info me-2" />
                            </OverlayTrigger>
                          )}
                          {item.shared_by_user && (
                            <OverlayTrigger
                              key="shared-from-others"
                              placement="top"
                              overlay={
                                <Tooltip id={`tip-shared-from-others`}>
                                  {t("page_assessment_list.tip_shared_with")}
                                </Tooltip>
                              }
                            >
                              <FaUsers className="text-info" />
                            </OverlayTrigger>
                          )}
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-end">
                        <div className="d-flex gap-2">
                          {item.compliance === null ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip
                                  id={`tooltip-compliance-na-${item.id}`}
                                >
                                  {t("fields.compliance")}
                                </Tooltip>
                              }
                            >
                              <span
                                className={`${styles["status-badge"]} ${styles["status-na"]} d-flex align-items-center gap-2 py-1 px-2`}
                                style={{ fontSize: "0.875rem" }}
                              >
                                <FaExclamationTriangle
                                  style={{ fontSize: "0.875rem" }}
                                />
                                {t("na").toUpperCase()}
                              </span>
                            </OverlayTrigger>
                          ) : item.compliance ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip
                                  id={`tooltip-compliance-pass-${item.id}`}
                                >
                                  {t("fields.compliance")}
                                </Tooltip>
                              }
                            >
                              <span
                                className={`${styles["status-badge"]} ${styles["status-pass"]} d-flex align-items-center gap-2 py-1 px-2`}
                                style={{ fontSize: "0.875rem" }}
                              >
                                <FaCheckCircle
                                  style={{ fontSize: "0.875rem" }}
                                />
                                {t("pass").toUpperCase()}
                              </span>
                            </OverlayTrigger>
                          ) : (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip
                                  id={`tooltip-compliance-fail-${item.id}`}
                                >
                                  {t("fields.compliance")}
                                </Tooltip>
                              }
                            >
                              <span
                                className={`${styles["status-badge"]} ${styles["status-fail"]} d-flex align-items-center gap-2 py-1 px-2`}
                                style={{ fontSize: "0.875rem" }}
                              >
                                <FaTimes style={{ fontSize: "0.875rem" }} />
                                {t("fail").toUpperCase()}
                              </span>
                            </OverlayTrigger>
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="fw-light fs-6 mb-1">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-subject-${item.id}`}>
                              {t("fields.subject")}
                            </Tooltip>
                          }
                        >
                          <span>
                            <FaInfoCircle className="me-2 text-secondary" />
                            {item.subject_name} ({item.subject_type})
                          </span>
                        </OverlayTrigger>
                      </div>
                      <div className="fw-light fs-6 mb-1">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-organisation-${item.id}`}>
                              {t("fields.organisation")}
                            </Tooltip>
                          }
                        >
                          <span>
                            <FaUsers className="me-2 text-secondary" />
                            {item.organisation}
                          </span>
                        </OverlayTrigger>
                      </div>
                      <div className="fw-light fs-6 mb-1">
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            item.published ? tooltipPublic : tooltipPrivate
                          }
                        >
                          <span>
                            {item.published ? (
                              <FaEye className="me-2 text-secondary" />
                            ) : (
                              <FaEyeSlash className="me-2 text-secondary" />
                            )}
                            {item.published ? "Public" : "Private"}
                          </span>
                        </OverlayTrigger>
                      </div>
                    </div>

                    <div className="fw-light fs-6 mb-2 ">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`tooltip-created-${item.id}`}>
                            {t("fields.created_on")}
                          </Tooltip>
                        }
                      >
                        <span>
                          <FaClock className="me-2 text-secondary" />
                          {item.created_on.split(" ")[0]}
                        </span>
                      </OverlayTrigger>
                    </div>

                    <div className="d-flex gap-2 mb-2">
                      <div className="d-flex gap-2">
                        {item.ranking === null ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-ranking-na-${item.id}`}>
                                {t("fields.ranking")}
                              </Tooltip>
                            }
                          >
                            <Badge
                              bg="secondary"
                              className="d-flex align-items-center gap-1"
                            >
                              <FaTrophy />
                              {t("na").toUpperCase()}
                            </Badge>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id={`tooltip-ranking-${item.id}`}>
                                {t("fields.ranking")}
                              </Tooltip>
                            }
                          >
                            <Badge
                              bg="secondary"
                              className="d-flex align-items-center gap-1"
                            >
                              <FaTrophy />
                              {prettyPrintRanking(item.ranking)}
                            </Badge>
                          </OverlayTrigger>
                        )}
                      </div>
                    </div>
                  </Card.Body>

                  <Card.Footer className="bg-transparent border-1">
                    <div className="d-flex justify-content-end gap-2 flex-wrap">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tip-view">
                            {t("page_assessment_list.tip_view")}
                          </Tooltip>
                        }
                      >
                        <Link
                          id={`view-button-${item.id}`}
                          className="btn btn-light btn-sm"
                          to={
                            listPublic
                              ? buildRoute(ROUTES.PUBLIC_ASSESSMENTS.VIEW, {
                                  asmtId: item.id,
                                })
                              : buildRoute(ROUTES.ASSESSMENTS.VIEW, {
                                  asmtId: item.id,
                                })
                          }
                        >
                          <FaBars />
                        </Link>
                      </OverlayTrigger>

                      {!listPublic && (
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="tip-edit">
                              {t("page_assessment_list.tip_edit")}
                            </Tooltip>
                          }
                        >
                          <Link
                            id={`edit-button-${item.id}`}
                            className="btn btn-light btn-sm"
                            to={buildRoute(ROUTES.ASSESSMENTS.EDIT, {
                              asmtId: item.id,
                            })}
                          >
                            <FaEdit />
                          </Link>
                        </OverlayTrigger>
                      )}

                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tip-export">
                            {t("page_assessment_list.tip_export")}
                          </Tooltip>
                        }
                      >
                        <Button
                          id={`download-button-${item.id}`}
                          className="btn btn-light btn-sm"
                          onClick={() => {
                            setAsmtNumID(item["id"]);
                          }}
                        >
                          <FaDownload />
                        </Button>
                      </OverlayTrigger>

                      {!listPublic && (
                        <>
                          {item.published ? (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tip-unpublish">
                                  {t("tip_unpublish_assessment")}
                                </Tooltip>
                              }
                            >
                              <Button
                                id={`unpublish-button-${item.id}`}
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                  setPublishModalConfig({
                                    id: item.id,
                                    name: item.name,
                                    admin: false,
                                    show: true,
                                    publish: false,
                                  });
                                }}
                              >
                                <FaEyeSlash />
                              </Button>
                            </OverlayTrigger>
                          ) : (
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tip-publish">
                                  {t("tip_publish_assessment")}
                                </Tooltip>
                              }
                            >
                              <Button
                                id={`publish-button-${item.id}`}
                                className="btn btn-light btn-sm"
                                onClick={() => {
                                  setPublishModalConfig({
                                    id: item.id,
                                    name: item.name,
                                    admin: false,
                                    show: true,
                                    publish: true,
                                  });
                                }}
                              >
                                <FaEye />
                              </Button>
                            </OverlayTrigger>
                          )}

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tip-share">
                                {t("page_assessment_list.tip_share")}
                              </Tooltip>
                            }
                          >
                            <Button
                              id={`share-button-${item.id}`}
                              className="btn btn-light btn-sm"
                              onClick={() => {
                                handleShareOpenModal(item);
                              }}
                            >
                              <FaShare />
                            </Button>
                          </OverlayTrigger>

                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip id="tip-delete">
                                {t("page_assessment_list.tip_delete")}
                              </Tooltip>
                            }
                          >
                            <Button
                              id={`delete-button-${item.id}`}
                              className="btn btn-light btn-sm text-danger"
                              onClick={() => {
                                handleDeleteOpenModal(item);
                              }}
                            >
                              <FaTimes />
                            </Button>
                          </OverlayTrigger>
                        </>
                      )}
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : null}
        {!isLoading && assessments.length === 0 && (
          <Alert variant="warning" className="text-center mx-auto">
            <h3>
              <FaExclamationTriangle />
            </h3>
            <h5>{t("no_data")}</h5>
          </Alert>
        )}
        <div className="d-flex justify-content-between pb-4">
          <div className="mt-5">
            <Link className="btn btn-secondary" to={ROUTES.ASSESSMENTS.ASSESS}>
              {t("buttons.back")}
            </Link>
          </div>
          <div className="d-flex justify-content-end">
            <div>
              <span className="mx-1">{t("rows_per_page")}</span>
              <select
                name="per-page"
                value={opts.size.toString() || "20"}
                id="per-page"
                onChange={handleChangePageSize}
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
                <option value="20">20</option>
              </select>
            </div>

            {data && data.number_of_page && data.total_pages && (
              <div className="ms-4">
                <span>
                  {(data.number_of_page - 1) * opts.size + 1} -{" "}
                  {(data.number_of_page - 1) * opts.size + data.size_of_page} of{" "}
                  {data.total_elements}
                </span>
                <span
                  onClick={() => {
                    setOpts({ ...opts, page: opts.page - 1 });
                  }}
                  className={`ms-4 btn py-0 btn-light btn-small ${
                    opts.page === 1 ? "disabled text-muted" : null
                  }`}
                >
                  <FaArrowLeft />
                </span>
                <span
                  onClick={() => {
                    setOpts({ ...opts, page: opts.page + 1 });
                  }}
                  className={`btn py-0 btn-light btn-small" ${
                    data?.total_pages > data?.number_of_page
                      ? null
                      : "disabled text-muted"
                  }`}
                >
                  <FaArrowRight />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AssessmentsList;
