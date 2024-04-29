import {
  useRef,
  useMemo,
  useState,
  useCallback,
  useContext,
  useEffect,
} from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components";
import {
  FaCheckCircle,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaFilter,
  FaTimes,
  FaDownload,
  FaFileImport,
} from "react-icons/fa";
import {
  Collapse,
  Button,
  InputGroup,
  Form,
  Container,
  Row,
  Col,
  FloatingLabel,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import { AssessmentListItem, AssessmentFiltersType, AlertInfo } from "@/types";
import {
  useGetAssessments,
  useGetPublicAssessments,
  useGetObjects,
  useDeleteAssessment,
  useGetAssessment,
} from "@/api";
import { AuthContext } from "@/auth";
import { getUniqueValuesForKey } from "@/utils";
import { Link } from "react-router-dom";
import { DeleteModal } from "@/components/DeleteModal";

import { toast } from "react-hot-toast";

/**
 * ComplianceBadge gets a compliance value (null, false, true) and renders
 * a corresponding badge
 */
function ComplianceBadge({
  compliance,
}: {
  compliance: boolean | null | unknown;
}) {
  return compliance === null ? (
    <span className="badge bg-secondary ms-2">UNKNOWN</span>
  ) : compliance ? (
    <span className="badge bg-success ms-2">PASS</span>
  ) : (
    <span className="badge bg-danger ms-2">FAIL</span>
  );
}

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

function AssessmentsList({ listPublic = false }: AssessmentListProps) {
  const { keycloak, registered } = useContext(AuthContext)!;
  // get the extra url parameters when in public list mode from url
  const urlParams = new URLSearchParams(location.search);
  const actorName = urlParams.get("actor-name");
  const actorIdParam = urlParams.get("actor-id");
  const assessmentTypeIdParam = urlParams.get("assessment-type-id");

  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: "Delete Assessment",
      message: "Are you sure you want to delete the following assessment?",
      itemId: "",
      itemName: "",
    },
  );

  const actorId = actorIdParam ? parseInt(actorIdParam, 10) : -1;
  const assessmentTypeId = assessmentTypeIdParam
    ? parseInt(assessmentTypeIdParam, 10)
    : -1;

  const [filtersToggle, setFiltersToggle] = useState(false);
  const formData = useRef<AssessmentFiltersType>({
    subject_name: "",
    subject_type: "",
  });
  const [filters, setFilters] = useState<AssessmentFiltersType>({
    subject_name: "",
    subject_type: "",
  });

  const { data: userObjects } = useGetObjects({
    size: 100,
    page: 1,
    token: keycloak?.token || "",
    assessmentTypeId: assessmentTypeId,
    actorId: actorId,
  });

  const [asmtNumID, setAsmtNumID] = useState<string>("");
  const qAssessment = useGetAssessment({
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

  const formRef = useRef<HTMLFormElement>(null);

  const handleReset = () => {
    if (formRef && formRef.current) {
      formRef.current.reset();
    }
  };

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

  const cols = useMemo<ColumnDef<AssessmentListItem>[]>(() => {
    const handleDeleteOpenModal = (item: AssessmentListItem) => {
      setDeleteModalConfig({
        ...deleteModalConfig,
        show: true,
        itemId: item.id,
        itemName: "test",
      });
    };

    return listPublic
      ? [
          {
            accessorKey: "name",
            header: () => <span>name</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "type",
            header: () => <span>type</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "subject_type",
            header: () => <span>subject type</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "subject_name",
            header: () => <span>subject name</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "organisation",
            header: () => <span>organisation</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "created_on",
            cell: (info) => (
              <span className="cat-date-cell">
                {String(info.getValue()).split(" ")[0]}
              </span>
            ),
            header: () => <span>Created On</span>,
            enableColumnFilter: false,
          },
          {
            id: "action",
            accessorFn: (row) => row,
            enableColumnFilter: false,
            header: () => <span>Actions</span>,
            show: !listPublic,
            cell: (info) => {
              const item: AssessmentListItem =
                info.getValue() as AssessmentListItem;
              return !listPublic ? (
                <>
                  <div className="edit-buttons btn-group shadow">
                    <Button
                      className="btn btn-secondary cat-action-reject-link btn-sm "
                      onClick={() => {
                        setAsmtNumID(item["id"]);
                      }}
                    >
                      <FaDownload />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="edit-buttons btn-group shadow">
                    <Button
                      className="btn btn-secondary cat-action-reject-link btn-sm "
                      onClick={() => {
                        setAsmtNumID(item["id"]);
                      }}
                    >
                      <FaDownload />
                    </Button>
                  </div>
                </>
              );
            },
          },
        ]
      : [
          {
            accessorKey: "name",
            header: () => <span>Name</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "type",
            header: () => <span>Type</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "compliance",
            header: () => <span>Compliance</span>,
            cell: (info) => <ComplianceBadge compliance={info.getValue()} />,
            enableColumnFilter: false,
          },
          {
            accessorKey: "ranking",
            header: () => <span>Ranking</span>,
            cell: (info) => {
              return info.getValue() === null ? (
                <ComplianceBadge compliance={null} />
              ) : (
                info.getValue()
              );
            },
            enableColumnFilter: false,
          },
          {
            accessorKey: "published",
            header: () => <span>Access</span>,
            cell: (info) => {
              return info.getValue() === true ? "Public" : "Private";
            },
            enableColumnFilter: false,
          },
          {
            accessorKey: "subject_type",
            header: () => <span>Subject Type</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "subject_name",
            header: () => <span>Subject Name</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorKey: "organisation",
            header: () => <span>Organisation</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorFn: (row) => row.created_on,
            id: "created_on",
            cell: (info) => (
              <span className="cat-date-cell" title={String(info.getValue())}>
                {String(info.getValue()).split(" ")[0]}
              </span>
            ),
            header: () => <span>Created On</span>,
            enableColumnFilter: false,
          },
          {
            id: "action",
            accessorFn: (row) => row,
            enableColumnFilter: false,
            header: () => <span>Actions</span>,
            show: !listPublic,
            cell: (info) => {
              const item: AssessmentListItem =
                info.getValue() as AssessmentListItem;
              return !listPublic ? (
                <>
                  <div className="edit-buttons btn-group shadow">
                    <Link
                      id={`edit-button-${item.id}`}
                      className="btn btn-secondary cat-action-view-link btn-sm "
                      to={`/assessments/${item.id}`}
                    >
                      <FaEdit />
                    </Link>
                    <Button
                      id={`download-button-${item.id}`}
                      className="btn btn-secondary cat-action-reject-link btn-sm "
                      onClick={() => {
                        setAsmtNumID(item["id"]);
                      }}
                    >
                      <FaDownload />
                    </Button>
                    <Button
                      id={`delete-button-${item.id}`}
                      className="btn btn-secondary cat-action-reject-link btn-sm "
                      onClick={() => {
                        handleDeleteOpenModal(item);
                      }}
                    >
                      <FaTimes />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="edit-buttons btn-group shadow">
                    <Button
                      className="btn btn-secondary cat-action-reject-link btn-sm "
                      onClick={() => {
                        setAsmtNumID(item["id"]);
                      }}
                    >
                      <FaDownload />
                    </Button>
                  </div>
                </>
              );
            },
          },
        ];
  }, [listPublic, deleteModalConfig]);

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFilters({ ...filters, ...formData.current });
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

  return (
    <div className="mt-4">
      <DeleteModal
        show={deleteModalConfig.show}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemId={deleteModalConfig.itemId}
        itemName={deleteModalConfig.itemName}
        onHide={() => {
          setDeleteModalConfig({ ...deleteModalConfig, show: false });
        }}
        onDelete={handleDeleteConfirmed}
      />
      <div className="d-flex justify-content-between my-2 container">
        <h3 className="cat-view-heading">
          <FaCheckCircle className="me-2" />
          {/* if component is used in public list mode display the actor name */}
          {listPublic && actorName && <span>{actorName} </span>}
          assessments
        </h3>
        <div>
          <>
            <Button
              variant="secondary"
              onClick={() => setFiltersToggle(!filtersToggle)}
              aria-controls="filter-collapse-div"
              aria-expanded={filtersToggle}
            >
              <FaFilter className="me-2" />
              Filter
            </Button>
          </>
          {!listPublic && (
            <>
              <Link
                to="/assessments/create"
                className="btn btn-light border-black ms-3"
              >
                <FaPlus /> <span className="align-middle">Create New</span>
              </Link>
              <Link
                to="/assessments/import"
                className="btn btn-light border-black ms-3"
              >
                <FaFileImport /> <span className="align-middle">Import</span>
              </Link>
            </>
          )}
        </div>
      </div>
      <div>
        <Collapse in={filtersToggle} className="bg-light">
          <Form
            onSubmit={(e: React.FormEvent<HTMLFormElement>) => formSubmit(e)}
            ref={formRef}
          >
            <Container className="p-2">
              <Row>
                <Col xs={5}>
                  <InputGroup className="mb-3">
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          The type of the Subject (such as a web resource
                          identified by the Owner) or a service provided by an
                          Authority, Provider, or Manager, the assessment will
                          be done for.
                        </Tooltip>
                      }
                    >
                      <InputGroup.Text id="subject-type-input">
                        <FaInfoCircle className="me-2" /> Subject Type
                      </InputGroup.Text>
                    </OverlayTrigger>
                    <FloatingLabel
                      controlId="floatingSelectSubjectType"
                      label="The type of the Subject of the issued assessment"
                    >
                      <Form.Select
                        aria-label="Floating label select example"
                        onChange={(e) => {
                          formData.current = {
                            ...formData.current,
                            subject_type: e.target.value,
                          };
                        }}
                        defaultValue={formData.current["subject_type"]}
                      >
                        <option disabled value="">
                          Select Subject Type
                        </option>
                        {renderSubjectTypeOptions()}
                      </Form.Select>
                    </FloatingLabel>
                  </InputGroup>
                </Col>
                <Col xs={5}>
                  <InputGroup className="mb-3">
                    <OverlayTrigger
                      key="top"
                      placement="top"
                      overlay={
                        <Tooltip id={`tooltip-top`}>
                          The name of the Subject the assessment will be done
                          for
                        </Tooltip>
                      }
                    >
                      <InputGroup.Text id="subject-type-input">
                        <FaInfoCircle className="me-2" /> Subject Name
                      </InputGroup.Text>
                    </OverlayTrigger>
                    <FloatingLabel
                      controlId="floatingSelectSubjectName"
                      label="The name of the Subject for the issued assessment"
                    >
                      <Form.Select
                        aria-label="Floating label select example"
                        onChange={(e) => {
                          formData.current = {
                            ...formData.current,
                            subject_name: e.target.value,
                          };
                        }}
                        defaultValue={""}
                      >
                        <option disabled value={""}>
                          Select Subject Name
                        </option>
                        {renderSubjectNameOptions()}
                      </Form.Select>
                    </FloatingLabel>
                  </InputGroup>
                </Col>
                <Col className="d-flex justify-content-end filter-div">
                  <InputGroup className="mb-3">
                    <Button
                      id="apply_filter_button"
                      className="btn btn-success btn centerButton"
                      type="submit"
                    >
                      Apply
                    </Button>
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <Button
                      id="clear_filter_button"
                      className="btn btn-primary btn centerButton"
                      type="submit"
                      onClick={() => {
                        formData.current = {
                          ...formData.current,
                          subject_type: "",
                          subject_name: "",
                        };
                        handleReset();
                      }}
                    >
                      Clear
                    </Button>
                  </InputGroup>
                </Col>
              </Row>
            </Container>
          </Form>
        </Collapse>
      </div>
      {/* if list public call the Custom table with extra properties and the correct data function */}
      {listPublic ? (
        <CustomTable
          columns={cols}
          dataSource={useGetPublicAssessments}
          goBackLoc="/assess"
          extraDataOps={{
            actorId: actorId,
            assessmentTypeId: assessmentTypeId,
            ...filters,
          }}
        />
      ) : (
        <CustomTable
          columns={cols}
          dataSource={useGetAssessments}
          extraDataOps={filters}
          goBackLoc="/assess"
        />
      )}
    </div>
  );
}

export default AssessmentsList;
