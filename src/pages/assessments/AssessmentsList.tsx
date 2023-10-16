import { useRef, useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components";
import {
  FaCheckCircle,
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaFilter,
} from "react-icons/fa";
import {
  Collapse,
  Button,
  InputGroup,
  Form,
  Container,
  Row,
  Col,
} from "react-bootstrap";
import { AssessmentListItem, AssessmentFiltersType } from "@/types";
import { useGetAssessments, useGetPublicAssessments } from "@/api";
import { Link } from "react-router-dom";

/**
 * ComplianceBadge gets a compliance value (null, false, true) and renders
 * a corresponding badge
 */
function ComplianceBadge({ compliance }: { compliance: boolean | null }) {
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

function AssessmentsList({ listPublic = false }: AssessmentListProps) {
  // get the extra url parameters when in public list mode from url
  const urlParams = new URLSearchParams(location.search);
  const actorName = urlParams.get("actor-name");
  const actorIdParam = urlParams.get("actor-id");
  const assessmentTypeIdParam = urlParams.get("assessment-type-id");

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

  const cols = useMemo<ColumnDef<AssessmentListItem>[]>(() => {
    return listPublic
      ? [
          {
            header: " ",
            columns: [
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
                accessorKey: "subject_name",
                header: () => <span>subject name</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: false,
              },
              {
                accessorKey: "subject_type",
                header: () => <span>subject type</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: true,
              },
              {
                accessorKey: "organisation",
                header: () => <span>organisation</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: true,
              },
              {
                accessorFn: (row) => row.created_on,
                id: "created_on",
                cell: (info) => (
                  <span className="cat-date-cell">
                    {info.getValue().split(" ")[0]}
                    <span className="ms-1 cat-full-date-info">
                      <FaInfoCircle title={info.getValue()} />
                    </span>
                  </span>
                ),
                header: () => <span>Created On</span>,
                enableColumnFilter: false,
              },
            ],
          },
        ]
      : [
          {
            header: " ",
            columns: [
              {
                accessorKey: "name",
                header: () => <span>ID</span>,
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
                accessorKey: "compliance",
                header: () => <span>compliance</span>,
                cell: (info) => (
                  <ComplianceBadge compliance={info.getValue()} />
                ),
                enableColumnFilter: false,
              },
              {
                accessorKey: "ranking",
                header: () => <span>ranking</span>,
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
                accessorKey: "access",
                header: () => <span>access</span>,
                cell: (info) => {
                  return info.getValue() === true ? "Public" : "Private";
                },
                enableColumnFilter: false,
              },
              {
                accessorKey: "subject_name",
                header: () => <span>subject name</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: true,
              },
              {
                accessorKey: "subject_type",
                header: () => <span>subject type</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: true,
              },
              {
                accessorKey: "organisation",
                header: () => <span>organisation</span>,
                cell: (info) => info.getValue(),
                enableColumnFilter: true,
              },
              {
                accessorFn: (row) => row.created_on,
                id: "created_on",
                cell: (info) => (
                  <span className="cat-date-cell" title={info.getValue()}>
                    {info.getValue().split(" ")[0]}
                  </span>
                ),
                header: () => <span>Created On</span>,
                enableColumnFilter: false,
              },
              {
                id: "action",
                accessorFn: (row) => row.id,
                enableColumnFilter: false,
                header: () => <span>Actions</span>,
                show: !listPublic,
                cell: (info) => {
                  return !listPublic ? (
                    <div className="edit-buttons btn-group shadow">
                      <Link
                        className="btn btn-secondary cat-action-view-link btn-sm "
                        to={`/assessments/${info.getValue()}`}
                      >
                        <FaEdit />
                      </Link>
                    </div>
                  ) : null;
                },
              },
            ],
          },
        ];
  }, [listPublic]);

  const formSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Test");
    setFilters({ ...filters, ...formData.current });
  };

  return (
    <div className="mt-4">
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
            <Link
              to="/assessments/create"
              className="btn btn-light border-black mx-3"
            >
              <FaPlus /> Create New
            </Link>
          )}
        </div>
      </div>
      <div>
        <Collapse in={filtersToggle} className="bg-light">
          <Container className="p-2">
            <Row>
              <Col className="filter-div">
                <FaFilter size={50} className="me-2" />
              </Col>
              <Col xs={10} id="filter-collapse-div">
                <Form
                  onSubmit={(e: React.FormEvent<HTMLFormElement>) =>
                    formSubmit(e)
                  }
                >
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="subject-name-input">
                      Subject Name
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      onChange={(e) => {
                        formData.current = {
                          ...formData.current,
                          subject_name: e.target.value,
                        };
                      }}
                    />
                  </InputGroup>
                  <InputGroup className="mb-3">
                    <InputGroup.Text id="subject-type-input">
                      Subject Type
                    </InputGroup.Text>
                    <Form.Control
                      aria-label="Default"
                      aria-describedby="inputGroup-sizing-default"
                      onChange={(e) => {
                        formData.current = {
                          ...formData.current,
                          subject_type: e.target.value,
                        };
                      }}
                    />
                  </InputGroup>
                  <Button
                    className="btn btn-primary btn-large centerButton"
                    type="submit"
                  >
                    Apply
                  </Button>
                </Form>
              </Col>
            </Row>
          </Container>
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
