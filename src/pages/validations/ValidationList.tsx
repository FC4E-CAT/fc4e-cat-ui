import { useMemo, useContext, useState, useRef } from "react";
import {
  useAdminValidations,
  useGetValidationList,
  useValidationStatusUpdate,
} from "@/api";
import { AuthContext } from "@/auth";
import { ColumnDef } from "@tanstack/react-table";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  FaCheck,
  FaList,
  FaTimes,
  FaExclamationTriangle,
  FaPlus,
  FaIdBadge,
} from "react-icons/fa";
import { CustomTable } from "@/components";
import {
  ValidationResponse,
  AlertInfo,
  ValidationProps,
  ValidationStatus,
} from "@/types";

import { toast } from "react-hot-toast";

function ValidationList(props: ValidationProps) {
  const navigate = useNavigate();
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const params = useParams();

  const isAdmin = useRef<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const { keycloak, registered } = useContext(AuthContext)!;

  const { mutateAsync: mutateValidationUpdateStatus } =
    useValidationStatusUpdate({
      validation_id: params.id!,
      status: reviewStatus,
      token: keycloak?.token || "",
      isRegistered: registered,
    });

  if (props.admin) {
    isAdmin.current = true;
  }

  const cols = useMemo<ColumnDef<ValidationResponse>[]>(() => {
    const setAdminPrefix = (url: string) => {
      if (props.admin) {
        return "/admin" + url;
      }
      return url;
    };

    return [
      {
        accessorKey: "id",
        header: () => <span>ID</span>,
        cell: (info) => info.getValue(),
        footer: (props) => props.column.id,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.user_id,
        id: "user_id",
        cell: (info) => info.getValue(),
        header: () => <span>User ID</span>,
        footer: (props) => props.column.id,
        enableColumnFilter: true,
      },
      {
        accessorFn: (row) => row.organisation_name,
        id: "organisation_name",
        cell: (info) => info.getValue(),
        header: () => <span>Organisation Name</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.organisation_role,
        id: "organisation_role",
        cell: (info) => info.getValue(),
        header: () => <span>Organisation Role</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorFn: (row) => row.actor_name,
        id: "actor_name",
        cell: (info) => info.getValue(),
        header: () => <span>Actor</span>,
        footer: (props) => props.column.id,
        enableColumnFilter: true,
      },
      {
        accessorFn: (row) => row.status,
        id: "status",
        cell: (info) => info.getValue(),
        header: () => <span>Status</span>,
        footer: (props) => props.column.id,
      },
      {
        id: "action",
        cell: (props) => {
          if (isAdmin.current) {
            return (
              <div className="edit-buttons btn-group shadow">
                <Link
                  className="btn btn-secondary cat-action-view-link btn-sm "
                  to={setAdminPrefix(`/validations/${props.row.original.id}`)}
                >
                  <FaList />
                </Link>
                {props.row.original.status === "REVIEW" ? (
                  <Link
                    className="btn btn-secondary cat-action-approve-link btn-sm "
                    to={setAdminPrefix(
                      `/validations/${props.row.original.id}/approve#alert-spot`,
                    )}
                  >
                    <FaCheck />
                  </Link>
                ) : null}
                {props.row.original.status === "REVIEW" ? (
                  <Link
                    className="btn btn-secondary cat-action-reject-link btn-sm "
                    to={setAdminPrefix(
                      `/validations/${props.row.original.id}/reject/#alert-spot`,
                    )}
                  >
                    <FaTimes />
                  </Link>
                ) : null}
              </div>
            );
          } else {
            return (
              <div className="edit-buttons btn-group shadow">
                <Link
                  className="btn btn-secondary btn-sm "
                  to={setAdminPrefix(`/validations/${props.row.original.id}`)}
                >
                  <FaList />
                </Link>
              </div>
            );
          }
        },

        header: () => <span>Actions</span>,
        enableColumnFilter: false,
      },
    ];
  }, [props.admin]);

  let rejectCard = null;
  let approveCard = null;

  if (props.toReject) {
    rejectCard = (
      <div className="container">
        <div className="card border-danger mb-2">
          <div className="card-header border-danger text-danger text-center">
            <h5 id="reject-alert">
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Rejection</strong>
            </h5>
          </div>
          <div className=" card-body border-danger text-center">
            Are you sure you want to reject validation with ID:{" "}
            <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-danger text-danger text-center">
            <button
              className="btn btn-danger mr-2"
              onClick={() => {
                setReviewStatus(ValidationStatus.REJECTED);
                const promise = mutateValidationUpdateStatus()
                  .catch((err) => {
                    alert.current = {
                      message: "Error during validation rejection.",
                    };
                    throw err;
                  })
                  .then(() => {
                    alert.current = {
                      message: "Validation successfully rejected.",
                    };
                  })
                  .finally(() => navigate("/validations"));
                toast.promise(promise, {
                  loading: "Rejecting",
                  success: () => `${alert.current.message}`,
                  error: () => `${alert.current.message}`,
                });
              }}
            >
              Reject
            </button>
            <button
              onClick={() => {
                navigate("/admin/validations");
              }}
              className="btn btn-dark"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (props.toApprove) {
    approveCard = (
      <div className="container">
        <div className="card border-success mb-2">
          <div className="card-header border-success text-success text-center">
            <h5 id="approve-alert">
              <FaExclamationTriangle className="mx-3" />
              <strong>Validation Request Approval</strong>
            </h5>
          </div>
          <div className=" card-body border-info text-center">
            Are you sure you want to approve validation with ID:{" "}
            <strong>{params.id}</strong> ?
          </div>
          <div className="card-footer border-success text-success text-center">
            <button
              className="btn btn-success mr-2"
              onClick={() => {
                setReviewStatus(ValidationStatus.REJECTED);
                const promise = mutateValidationUpdateStatus()
                  .catch((err) => {
                    alert.current = {
                      message: "Error during validation approval.",
                    };
                    throw err;
                  })
                  .then(() => {
                    alert.current = {
                      message: "Validation successfully approved.",
                    };
                  })
                  .finally(() => navigate("/validations"));
                toast.promise(promise, {
                  loading: "Approving",
                  success: () => `${alert.current.message}`,
                  error: () => `${alert.current.message}`,
                });
              }}
            >
              Approve
            </button>
            <button
              onClick={() => {
                navigate("/admin/validations");
              }}
              className="btn btn-dark"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4">
      {rejectCard}
      {approveCard}
      <div
        className={`${
          props.admin && "alert alert-primary"
        } d-flex justify-content-between`}
      >
        <h3 className={`${!props.admin && "cat-view-heading"}`}>
          <FaIdBadge /> validation requests
        </h3>
        {props.admin ? (
          <h3 className="opacity-50">admin mode</h3>
        ) : (
          <Link
            to="/validations/request"
            className="btn btn-light border-black mx-3"
          >
            <FaPlus /> Create New
          </Link>
        )}
      </div>
      {isAdmin.current && keycloak ? (
        <CustomTable columns={cols} dataSource={useAdminValidations} />
      ) : (
        <CustomTable columns={cols} dataSource={useGetValidationList} />
      )}
    </div>
  );
}

export default ValidationList;
