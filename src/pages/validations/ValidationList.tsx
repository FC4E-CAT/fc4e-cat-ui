import { useContext, useState, useEffect } from "react";
import { useGetValidationList } from "@/api";
import { AuthContext } from "@/auth";
import { ValidationResponse } from "@/types";
import { Link } from "react-router-dom";
import {
  FaCheck,
  FaList,
  FaTimes,
  FaExclamationTriangle,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaGlasses,
} from "react-icons/fa";

import { Alert, Table } from "react-bootstrap";

type ValidationState = {
  sortOrder: string;
  sortBy: string;
  type: string;
  page: number;
  size: number;
  search: string;
  status: string;
};

// create a validation status badge for approved, rejected, pending
const ValidationStatusBadge = (status: string) => {
  if (status === "APPROVED") {
    return (
      <span className="badge bg-success">
        <FaCheck /> Approved
      </span>
    );
  } else if (status === "REJECTED") {
    return (
      <span className="badge bg-danger">
        <FaTimes /> Rejected
      </span>
    );
  } else if (status === "REVIEW") {
    return (
      <span className="badge bg-primary">
        <FaGlasses /> Pending Review
      </span>
    );
  } else {
    return null;
  }
};

function ValidationList() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const [opts, setOpts] = useState<ValidationState>({
    sortBy: "",
    sortOrder: "",
    type: "",
    page: 1,
    size: 20,
    search: "",
    status: "",
  });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // data get admin users
  const { isLoading, data, refetch } = useGetValidationList({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the validation data to create the table
  const validations: ValidationResponse[] = data ? data?.content : [];

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Validation Requests
            <p className="lead cat-view-lead">
              All validation Requests in one place.
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Link to="/validations/request" className="btn btn-warning mx-2">
            <FaPlus /> Create New
          </Link>
        </div>
      </div>
      <div className="py-2 px-2">
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span>ID</span>
              </th>
              <th>
                <span>User ID</span>
              </th>

              <th>
                <span>Organization Name </span>
              </th>
              <th>
                <span>Organisation Role</span>
              </th>
              <th>
                <span>Actor Name</span>
              </th>
              <th>
                <span>Status</span>
              </th>
              <th>
                <span>Actions </span>
              </th>
            </tr>
          </thead>
          {validations.length > 0 ? (
            <tbody>
              {validations.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">{item.id}</td>
                    <td className="align-middle">{item.user_id}</td>

                    <td className="align-middle">{item.organisation_name}</td>
                    <td className="align-middle">{item.organisation_role}</td>
                    <td className="align-middle">{item.actor_name}</td>
                    <td className="align-middle">
                      <td className="align-middle">
                        {ValidationStatusBadge(item.status)}
                      </td>
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <Link
                          className="btn btn-secondary btn-sm "
                          to="/validations/${props.row.original.id}`"
                        >
                          <FaList />
                        </Link>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : null}
        </Table>
      </div>
      {!isLoading && validations.length === 0 && (
        <Alert variant="warning" className="text-center mx-auto">
          <h3>
            <FaExclamationTriangle />
          </h3>
          <h5>No data found...</h5>
        </Alert>
      )}
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
      <div className="row py-3 p-4">
        <div className="col"></div>
      </div>
    </div>
  );
}

export default ValidationList;
