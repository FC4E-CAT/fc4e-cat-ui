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
import { AssessmentListItem, AssessmentFiltersType, AlertInfo } from "@/types";
import {
  useGetAssessments,
  useGetObjects,
  useDeleteAssessment,
  useGetAssessment,
} from "@/api";
import { AuthContext } from "@/auth";
import { getUniqueValuesForKey } from "@/utils";
import { Link } from "react-router-dom";
import { DeleteModal } from "@/components/DeleteModal";

import { toast } from "react-hot-toast";
import { ShareModal } from "./components/ShareModal";

const tooltipPublic = (
  <Tooltip id="tip-public">
    This assessment is public. Everyone can see the results.
  </Tooltip>
);
const tooltipPrivate = (
  <Tooltip id="tip-private">
    This assessment is private. Only the owners can see the results.
  </Tooltip>
);

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

function AssessmentsList({ listPublic = false }: AssessmentListProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  // get the extra url parameters when in public list mode from url
  const urlParams = new URLSearchParams(location.search);
  const actorName = urlParams.get("actor-name");
  const actorIdParam = urlParams.get("actor-id");
  const assessmentTypeIdParam = urlParams.get("assessment-type-id");

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
    assessmentTypeId: assessmentTypeIdParam || "",
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, filters, refetch]);

  const { data: userObjects } = useGetObjects({
    size: 100,
    page: 1,
    token: keycloak?.token || "",
    assessmentTypeId: assessmentTypeIdParam || "",
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
            message: "Error during assessment deletion!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Assessment succesfully deleted.",
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: "Deleting...",
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
    <div>
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
            Assessments
            <p className="lead cat-view-lead">Manage your own assessments.</p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          {!listPublic && (
            <>
              <Link to="/assessments/create" className="btn btn-warning  ms-3">
                <FaPlus /> <span className="align-middle">Create New</span>
              </Link>
              <Link to="/assessments/import" className="btn btn-dark  ms-3">
                <FaFileImport /> <span className="align-middle">Import</span>
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
                      Filter by the type of the Subject (such as a web resource
                      identified by the Owner) or a service provided by an
                      Authority, Provider, or Manager, the assessment will be
                      done for.
                    </Tooltip>
                  }
                >
                  <span>
                    <FaInfoCircle className="me-2" />
                  </span>
                </OverlayTrigger>

                <Form.Select
                  aria-label="Filter by subject type"
                  onChange={(e) => {
                    setFilters({ ...filters, subject_type: e.target.value });
                    refetch();
                  }}
                  value={filters.subject_type}
                >
                  <option value="">Select subject type...</option>
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
                      Filter by the name of the Subject the assessment will be
                      done for
                    </Tooltip>
                  }
                >
                  <span>
                    <FaInfoCircle className="me-2" />
                  </span>
                </OverlayTrigger>

                <Form.Select
                  aria-label="Filter by subject name"
                  onChange={(e) => {
                    setFilters({ ...filters, subject_name: e.target.value });
                    refetch();
                  }}
                  value={filters.subject_name}
                >
                  <option value={""}>Select subject name...</option>
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
                Clear
              </Button>
            </Col>
          </Row>
        </Col>
      </div>
      <>
        <div className="mt-2">
          <Table hover>
            <thead>
              <tr className="table-light">
                <th className="col-lg-2">
                  <span>Name</span>
                </th>

                <th>
                  <span>Compliance</span>
                </th>
                <th>
                  <span>Ranking</span>
                </th>
                <th>
                  <span>Access</span>
                </th>
                <th>
                  <span>Subject </span>
                </th>
                <th>
                  <span>Organization</span>
                </th>
                <th className="col-lg-1">
                  <span>Created On</span>
                </th>
                <th className="col-lg-2">
                  <span>Actions</span>
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
                            {item.shared_to_user && (
                              <OverlayTrigger
                                key="shared-with-others"
                                placement="top"
                                overlay={
                                  <Tooltip id={`tip-shared-with-others`}>
                                    This assessment is shared by you with others
                                  </Tooltip>
                                }
                              >
                                <span>
                                  <FaUsers className="ms-2 fs-5 float-end text-info" />
                                </span>
                              </OverlayTrigger>
                            )}
                            {item.shared_by_user && (
                              <OverlayTrigger
                                key="shared-from-others"
                                placement="top"
                                overlay={
                                  <Tooltip id={`tip-shared-from-others`}>
                                    This assessment is shared with you by
                                    someone else
                                  </Tooltip>
                                }
                              >
                                <span>
                                  <FaUsers className="ms-2 fs-5 float-end text-info" />
                                </span>
                              </OverlayTrigger>
                            )}
                          </span>
                          <br />
                          <div>
                            <span className="text-muted text-xs">
                              {item.type}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="align-middle text-center">
                        {item.compliance === null ? (
                          <span className="badge rounded-pill text-bg-light text-warning border border-warning">
                            N/A
                          </span>
                        ) : item.compliance ? (
                          <span className="badge rounded-pill text-bg-light text-success border border-success">
                            PASS
                          </span>
                        ) : (
                          <span className="badge rounded-pill text-bg-light text-danger border border-danger">
                            FAIL
                          </span>
                        )}
                      </td>
                      <td className="align-middle text-center">
                        {item.ranking === null ? (
                          <h6>
                            <span className="badge bg-secondary">N/A</span>
                          </h6>
                        ) : (
                          <h5>
                            <span className="badge bg-info">
                              {item.ranking}
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
                          <p>
                            {" "}
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tip-view">
                                  View Assessment Results
                                </Tooltip>
                              }
                            >
                              <Link
                                id={`view-button-${item.id}`}
                                className="btn btn-light btn-sm m-1"
                                to={`/${listPublic ? "public-" : ""}assessments/${item.id}/view`}
                              >
                                <FaBars />
                              </Link>
                            </OverlayTrigger>
                            {!listPublic && (
                              <OverlayTrigger
                                placement="top"
                                overlay={
                                  <Tooltip id="tip-edit">
                                    Edit Assessment
                                  </Tooltip>
                                }
                              >
                                <Link
                                  id={`edit-button-${item.id}`}
                                  className="btn btn-light btn-sm m-1"
                                  to={`/assessments/${item.id}`}
                                >
                                  <FaEdit />
                                </Link>
                              </OverlayTrigger>
                            )}
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip id="tip-export">
                                  Export & Download Assessment
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
                            {!listPublic && (
                              <>
                                <OverlayTrigger
                                  placement="top"
                                  overlay={
                                    <Tooltip id="tip-share">
                                      Share Assessment
                                    </Tooltip>
                                  }
                                >
                                  <Button
                                    id={`share-button-${item.id}`}
                                    className="btn btn-light btn-sm m-1"
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
                                      Delete Assessment
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
                              </>
                            )}
                          </p>
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
              <h5>No data found...</h5>
            </Alert>
          )}
          <div className="d-flex justify-content-between pb-4">
            <div>
              <Link className="btn btn-secondary" to="/assess">
                Back
              </Link>
            </div>
            <div className="d-flex justify-content-end">
              <div>
                <span className="mx-1">rows per page: </span>
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

export default AssessmentsList;
