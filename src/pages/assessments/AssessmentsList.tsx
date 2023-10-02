import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components";
import { FaCheckCircle, FaEdit, FaInfoCircle, FaPlus } from "react-icons/fa";
import { AssessmentListItem } from "@/types";
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

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between my-2 container">
        <h3 className="cat-view-heading">
          <FaCheckCircle className="me-2" />
          {/* if component is used in public list mode display the actor name */}
          {listPublic && actorName && <span>{actorName} </span>}
          assessments
        </h3>
        {!listPublic && (
          <Link
            to="/assessments/create"
            className="btn btn-light border-black mx-3"
          >
            <FaPlus /> Create New
          </Link>
        )}
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
          goBackLoc="/assess"
        />
      )}
    </div>
  );
}

export default AssessmentsList;
