import { useRef, useState, useContext, useEffect } from "react";
import {
  FaExclamationTriangle,
  FaArrowRight,
  FaArrowLeft,
  FaTimes,
  FaDownload,
  FaEye,
  FaEyeSlash,
} from "react-icons/fa";
import {
  Alert,
  Button,
  Form,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
  Table,
} from "react-bootstrap";
import { AssessmentListItem, AlertInfo } from "@/types";
import {
  useAdminDeleteAssessment,
  useGetAdminAssessment,
  useGetAdminAssessments,
} from "@/api";
import { AuthContext } from "@/auth";
import { prettyPrintRanking } from "@/utils";
import { Link } from "react-router-dom";
import { DeleteModal } from "@/components/DeleteModal";

import { toast } from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { PublishModal } from "@/components";

type Pagination = {
  page: number;
  size: number;
  sortBy: string;
};

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

interface PublishModalConfig {
  show: boolean;
  id: string;
  name: string;
  admin: boolean;
  publish: boolean;
}

function AdminAssessments() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const { t } = useTranslation();

  const tooltipPublic = (
    <Tooltip id="tip-public">{t("page_assessment_list.tip_public")}</Tooltip>
  );
  const tooltipPrivate = (
    <Tooltip id="tip-private">{t("page_assessment_list.tip_private")}</Tooltip>
  );

  const [searchTerm, setSearchTerm] = useState("");

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

  // Publish Modal
  const [publishModalConfig, setPublishModalConfig] =
    useState<PublishModalConfig>({
      show: false,
      name: "",
      id: "",
      admin: true,
      publish: true,
    });

  const { data, isLoading, refetch } = useGetAdminAssessments({
    token: keycloak?.token || "",
    isRegistered: registered || false,
    page: opts.page,
    size: opts.size,
    search: searchTerm,
  });

  // const { data: userObjects } = useGetObjects({
  //   size: 100,
  //   page: 1,
  //   token: keycloak?.token || "",
  //   assessmentTypeId: motivationIdParam || "",
  //   actorId: actorIdParam || "",
  // });

  const [asmtNumID, setAsmtNumID] = useState<string>("");
  const qAssessment = useGetAdminAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered || false,
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

  const mutationDeleteAssessment = useAdminDeleteAssessment(
    keycloak?.token || "",
  );

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

  // get the assessment data to create the table
  const assessments: AssessmentListItem[] = data ? data.content : [];

  return (
    <div>
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
            admin: true,
            show: false,
            publish: true,
          });
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
            {t("assessments")}
            <p className="lead cat-view-lead">
              {t("page_assessment_list.subtitle_admin")}
            </p>
          </h2>
        </div>
      </div>
      <div className="row cat-view-search-block ">
        <Col>
          <Row>
            <div className="d-flex justify-content-center">
              <Form.Control
                placeholder={t("fields.search")}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  refetch();
                }}
                value={searchTerm}
              />
              <Button
                onClick={() => {
                  setSearchTerm("");
                  refetch();
                }}
                className="ms-4"
              >
                {t("buttons.clear")}
              </Button>
            </div>
          </Row>
        </Col>
      </div>
      <>
        <div className="mt-2">
          <Table hover>
            <thead>
              <tr className="table-light">
                <th className="col-lg-2">
                  <span>{t("fields.name")}</span>
                </th>
                <th>
                  <span>{t("fields.user_id")}</span>
                </th>
                <th>
                  <span>{t("fields.compliance")}</span>
                </th>
                <th>
                  <span>{t("fields.ranking")}</span>
                </th>
                <th>
                  <span>{t("fields.access")}</span>
                </th>
                <th>
                  <span>{t("fields.subject")} </span>
                </th>
                <th>
                  <span>{t("fields.organisation")}</span>
                </th>
                <th className="col-lg-1">
                  <span>{t("fields.created_on")}</span>
                </th>
                <th className="col-lg-2">
                  <span>{t("fields.actions")}</span>
                </th>
              </tr>
            </thead>
            {assessments.length > 0 ? (
              <tbody>
                {assessments.map((item) => {
                  return (
                    <tr key={item.id}>
                      <td className="align-middle">
                        <div>
                          <span className="text-black float-start">
                            {item.name}
                          </span>
                          <br />
                          <div>
                            <span className="text-muted text-xs">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle">
                        <div>
                          <small>{item.user_id}</small>
                        </div>
                      </td>
                      <td className="align-middle text-center">
                        {item.compliance === null ? (
                          <span className="badge rounded-pill text-bg-light text-warning border border-warning">
                            {t("na").toUpperCase()}
                          </span>
                        ) : item.compliance ? (
                          <span className="badge rounded-pill text-bg-light text-success border border-success">
                            {t("pass").toUpperCase()}
                          </span>
                        ) : (
                          <span className="badge rounded-pill text-bg-light text-danger border border-danger">
                            {t("fail").toUpperCase()}
                          </span>
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {item.ranking === null ? (
                          <h6>
                            <span className="badge bg-secondary">
                              {t("na").toUpperCase()}
                            </span>
                          </h6>
                        ) : (
                          <h5>
                            <span className="badge bg-info">
                              {prettyPrintRanking(item.ranking)}
                            </span>
                          </h5>
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {item.published ? (
                          <OverlayTrigger
                            placement="top"
                            overlay={tooltipPublic}
                          >
                            <span>
                              <FaEye className="text-success fs-4" />
                            </span>
                          </OverlayTrigger>
                        ) : (
                          <OverlayTrigger
                            placement="top"
                            overlay={tooltipPrivate}
                          >
                            <span>
                              <FaEyeSlash className="text-secondary fs-4" />
                            </span>
                          </OverlayTrigger>
                        )}
                      </td>
                      <td className="align-middle">
                        {item.subject_name}

                        <span className="mt-2">({item.subject_type})</span>
                        <br />
                      </td>
                      <td className="align-middle ">
                        <span className="text-sm">{item.organisation}</span>
                      </td>
                      <td className="align-middle">
                        <small>{item.created_on.split(" ")[0]}</small>
                      </td>
                      <td>
                        <div className="d-flex flex-nowrap">
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
                              className="btn btn-light btn-sm m-1"
                              onClick={() => {
                                setAsmtNumID(item["id"]);
                              }}
                            >
                              <FaDownload />
                            </Button>
                          </OverlayTrigger>

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
                                className="btn btn-light btn-sm m-1"
                                onClick={() => {
                                  setPublishModalConfig({
                                    id: item.id,
                                    name: item.name,
                                    admin: true,
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
                                className="btn btn-light btn-sm m-1"
                                onClick={() => {
                                  setPublishModalConfig({
                                    id: item.id,
                                    name: item.name,
                                    admin: true,
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
                              <Tooltip id="tip-delete">
                                {t("page_assessment_list.tip_delete")}
                              </Tooltip>
                            }
                          >
                            <Button
                              id={`delete-button-${item.id}`}
                              className="btn btn-light btn-sm m-1 text-danger"
                              onClick={() => {
                                handleDeleteOpenModal(item);
                              }}
                            >
                              <FaTimes />
                            </Button>
                          </OverlayTrigger>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            ) : null}
          </Table>
          {!isLoading && assessments.length === 0 && (
            <Alert variant="warning" className="text-center mx-auto">
              <h3>
                <FaExclamationTriangle />
              </h3>
              <h5>{t("no_data")}</h5>
            </Alert>
          )}
          <div className="d-flex justify-content-between pb-4">
            <div>
              <Link className="btn btn-secondary" to="/assess">
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
                    {(data.number_of_page - 1) * opts.size + data.size_of_page}{" "}
                    of {data.total_elements}
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
      </>
    </div>
  );
}

export default AdminAssessments;
