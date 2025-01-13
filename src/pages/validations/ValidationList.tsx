import { useContext, useState, useEffect } from "react";
import { useGetValidationList } from "@/api";
import { AuthContext } from "@/auth";
import { ValidationResponse } from "@/types";
import { Link } from "react-router-dom";
import {
  FaList,
  FaExclamationTriangle,
  FaPlus,
  FaArrowLeft,
  FaArrowRight
} from "react-icons/fa";

import { Alert, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BadgeStatus from "@/components/BadgeStatus";

type ValidationState = {
  sortOrder: string;
  sortBy: string;
  type: string;
  page: number;
  size: number;
  search: string;
  status: string;
};

function ValidationList() {
  const { t } = useTranslation();

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
            {t("validation_requests")}
            <p className="lead cat-view-lead">
              {t("page_validations.subtitle")}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Link to="/validations/request" className="btn btn-warning mx-2">
            <FaPlus className="m2" /> {t("buttons.create_new")}
          </Link>
        </div>
      </div>
      <div className="py-2 px-2">
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span>{t("fields.id")}</span>
              </th>
              <th>
                <span>{t("page_validations.org_name")}</span>
              </th>
              <th>
                <span>{t("page_validations.org_role")}</span>
              </th>
              <th>
                <span>{t("page_validations.actor_name")}</span>
              </th>
              <th>
                <span>{t("fields.status")}</span>
              </th>
              <th>
                <span>{t("fields.actions")}</span>
              </th>
            </tr>
          </thead>
          {validations.length > 0 ? (
            <tbody>
              {validations.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">{item.id}</td>
                    <td className="align-middle">{item.organisation_name}</td>
                    <td className="align-middle">{item.organisation_role}</td>
                    <td className="align-middle">{item.actor_name}</td>
                    <td className="align-middle">
                      <BadgeStatus status={item.status} />
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger
                          key="view"
                          placement="top"
                          overlay={
                            <Tooltip id={`tooltip-view`}>
                              {t("page_validations.tip_view")}
                            </Tooltip>
                          }
                        >
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/validations/${item.id}`}
                          >
                            <FaList />
                          </Link>
                        </OverlayTrigger>
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
