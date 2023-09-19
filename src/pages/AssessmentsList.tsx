import { useMemo, useContext } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components";
import { FaCheckCircle, FaEdit, FaPlus } from "react-icons/fa";
import { AssessmentListItem } from "@/types";
import { useGetAssessments } from "@/api";
import { AuthContext } from "@/auth";
import { Link } from "react-router-dom";

function AssessmentsList() {
  const { authenticated, keycloak } = useContext(AuthContext)!;

  const cols = useMemo<ColumnDef<AssessmentListItem>[]>(
    () => [
      {
        header: " ",
        columns: [
          {
            accessorKey: "id",
            header: () => <span>ID</span>,
            cell: (info) => info.getValue(),
            enableColumnFilter: false,
          },
          {
            accessorFn: (row) => row.created_on,
            id: "created_on",
            cell: (info) => info.getValue(),
            header: () => <span>Created On</span>,
            enableColumnFilter: false,
          },
          {
            accessorFn: (row) => row.validation_id,
            id: "validation_id",
            cell: (info) => info.getValue(),
            header: () => <span>Validation ID</span>,
            enableColumnFilter: true,
          },
          {
            accessorFn: (row) => row.template_id,
            id: "template_id",
            cell: (info) => info.getValue(),
            header: () => <span>Template ID</span>,
            enableColumnFilter: true,
          },
          {
            id: "action",
            accessorFn: (row) => row.id,
            header: () => <span>Actions</span>,
            cell: (info) => {
              return (
                <div className="edit-buttons btn-group shadow">
                  <Link
                    className="btn btn-secondary cat-action-view-link btn-sm "
                    to={`/assessments/${info.getValue()}`}
                  >
                    <FaEdit />
                  </Link>
                </div>
              );
            },
          },
        ],
      },
    ],
    [],
  );

  return (
    <div className="mt-4">
      {keycloak?.token && authenticated && (
        <div className="d-flex justify-content-between my-2 container">
          <h3 className="cat-view-heading">
            <FaCheckCircle className="me-1" /> assessments
          </h3>
          <Link to="/validations" className="btn btn-light border-black mx-3">
            <FaPlus /> Create New
          </Link>
        </div>
      )}
      <CustomTable columns={cols} data_source={useGetAssessments} />
    </div>
  );
}

export default AssessmentsList;
