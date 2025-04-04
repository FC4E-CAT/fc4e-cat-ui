import { useAdminGetValidations, useGetAllRegistryActors } from "@/api";
import { AuthContext } from "@/auth";
import { RegistryActor, ValidationResponse } from "@/types";
import { idToColor, trimField } from "@/utils/admin";
import { useContext, useEffect, useState } from "react";
import {
  Alert,
  Button,
  Form,
  OverlayTrigger,
  Table,
  Tooltip,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowsAltV,
  FaBars,
  FaCheck,
  FaExclamationTriangle,
  FaTimes,
  FaUserCircle,
} from "react-icons/fa";
import { Link } from "react-router-dom";

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

// create an up/down arrow to designate sorting in a column
export function SortMarker(
  field: string,
  sortField: string,
  sortOrder: string,
) {
  if (field === sortField) {
    if (sortOrder === "DESC") return <FaArrowUp />;
    else if (sortOrder === "ASC") return <FaArrowDown />;
  }
  return <FaArrowsAltV className="text-secondary opacity-50" />;
}

// the main component that lists all the validations for admins
export default function AdminValidations() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const { t } = useTranslation();

  // create the tooltips
  const tooltipAccept = (
    <Tooltip id="tip-accept">{t("page_admin_validations.accept_tip")}</Tooltip>
  );
  const tooltipReject = (
    <Tooltip id="tip-restore">{t("page_admin_validations.reject_tip")}</Tooltip>
  );
  const tooltipView = (
    <Tooltip id="tip-view">{t("page_admin_validations.view_tip")}</Tooltip>
  );

  const [opts, setOpts] = useState<ValidationState>({
    sortBy: "status",
    sortOrder: "ASC",
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

  // handler for clicking to sort
  const handleSortClick = (field: string) => {
    if (field === opts.sortBy) {
      if (opts.sortOrder === "ASC") {
        setOpts({ ...opts, sortOrder: "DESC" });
      } else {
        setOpts({ ...opts, sortOrder: "ASC" });
      }
    } else {
      setOpts({ ...opts, sortOrder: "ASC", sortBy: field });
    }
  };

  const [actors, setActors] = useState<RegistryActor[]>();

  const {
    data: actData,
    fetchNextPage: actFetchNextPage,
    hasNextPage: actHasNextPage,
  } = useGetAllRegistryActors({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all registry actors types
    let tmpAct: RegistryActor[] = [];

    // iterate over backend pages and gather all items in the registry actors array
    if (actData?.pages) {
      actData.pages.map((page) => {
        tmpAct = [...tmpAct, ...page.content];
      });
      if (actHasNextPage) {
        actFetchNextPage();
      }
    }

    setActors(tmpAct);
  }, [actData, actHasNextPage, actFetchNextPage]);

  // data get admin validations
  const { isLoading, data, refetch } = useAdminGetValidations({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: opts.search,
    type: opts.type,
    status: opts.status,
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
            {t("page_admin_validations.title")}
            <p className="lead cat-view-lead">
              {t("page_admin_validations.subtitle")}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right"></div>
      </div>

      <Form className="mb-3">
        <div className="row cat-view-search-block border-bottom">
          <div className="col col-lg-3">
            <Form.Select
              onChange={(e) => {
                setOpts({ ...opts, type: e.target.value });
              }}
              value={opts.type}
            >
              <option value="">{t("fields.select_type")}</option>
              <>
                {actors?.map((item) => (
                  <option key={item.id}>{item.label}</option>
                ))}
              </>
            </Form.Select>
          </div>
          <div className="col-md-auto">
            <Form.Select
              onChange={(e) => {
                setOpts({ ...opts, status: e.target.value });
              }}
              value={opts.status}
            >
              <option value="">{t("fields.select_status")}</option>
              <option value="APPROVED">{t("approved")}</option>
              <option value="REJECTED">{t("rejected")}</option>
              <option value="REVIEW">{t("review")}</option>
            </Form.Select>
          </div>
          <div className="col col-lg-6">
            <div className="d-flex justify-content-center">
              <Form.Control
                placeholder={t("fields.search")}
                onChange={(e) => {
                  setOpts({ ...opts, search: e.target.value });
                }}
                value={opts.search}
              />
              <Button
                onClick={() => {
                  setOpts({ ...opts, search: "", type: "", status: "" });
                }}
                className="ms-4"
              >
                {t("buttons.clear")}
              </Button>
            </div>
          </div>
        </div>
      </Form>

      <Table hover>
        <thead>
          <tr className="table-light">
            <th>{t("fields.name")} </th>
            <th>
              <span
                onClick={() => handleSortClick("organisationName")}
                className="cat-cursor-pointer"
              >
                {t("fields.organisation")}{" "}
                {SortMarker("organisationName", opts.sortBy, opts.sortOrder)}
              </span>
            </th>
            <th>
              <span>{t("fields.actor_name")}</span>
            </th>
            <th>
              <span
                onClick={() => handleSortClick("status")}
                className="cat-cursor-pointer"
              >
                {t("fields.status")}{" "}
                {SortMarker("status", opts.sortBy, opts.sortOrder)}
              </span>
            </th>
            <th></th>
          </tr>
        </thead>
        {validations.length > 0 ? (
          <tbody>
            {validations.map((item) => {
              return (
                <tr key={item.id}>
                  <td className="align-middle">
                    <div className="d-flex  justify-content-start">
                      <div>
                        <FaUserCircle
                          size={"3rem"}
                          style={{ color: idToColor(item.user_id) }}
                        />
                      </div>
                      <div className="ms-2 d-flex flex-column justify-content-between">
                        <div>{item.user_name || <br />}</div>
                        <div>
                          <span
                            style={{ fontSize: "0.64rem" }}
                            className="text-muted"
                          >
                            {t("fields.id").toLowerCase()}:{" "}
                            {trimField(item.user_id, 20)}
                          </span>
                        </div>

                        <div>
                          <span
                            style={{ fontSize: "0.64rem" }}
                            className="text-muted"
                          >
                            {t("fields.created_on").toLowerCase()}:{" "}
                            {item.created_on.split("T")[0]}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle">
                    <div className="ms-2 d-flex flex-column justify-content-between">
                      <div>{item.organisation_name || <br />}</div>
                      <div>
                        <span
                          style={{ fontSize: "0.64rem" }}
                          className="text-muted"
                        >
                          {t("fields.role")}: {item.organisation_role}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="align-middle">{item.registry_actor_name}</td>
                  <td className="align-middle">
                    <BadgeStatus status={item.status} />
                  </td>
                  <td>
                    <div className="d-flex flex-nowrap">
                      <OverlayTrigger placement="top" overlay={tooltipView}>
                        <Link
                          className="btn btn-light btn-sm m-1"
                          to={`/admin/validations/${item.id}`}
                        >
                          <FaBars />
                        </Link>
                      </OverlayTrigger>
                      {item.status === "REVIEW" ? (
                        <OverlayTrigger placement="top" overlay={tooltipAccept}>
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/admin/validations/${item.id}/approve#alert-spot`}
                          >
                            <FaCheck />
                          </Link>
                        </OverlayTrigger>
                      ) : null}
                      {item.status === "REVIEW" ? (
                        <OverlayTrigger placement="top" overlay={tooltipReject}>
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/admin/validations/${item.id}/reject/#alert-spot`}
                          >
                            <FaTimes />
                          </Link>
                        </OverlayTrigger>
                      ) : null}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ) : null}
      </Table>
      {!isLoading && validations.length === 0 && (
        <Alert variant="warning" className="text-center mx-auto">
          <h3>
            <FaExclamationTriangle />
          </h3>
          <h5>{t("no_data")}</h5>
        </Alert>
      )}
      <div className="d-flex justify-content-end">
        <div>
          <span className="mx-1">{t("rows_per_page")} </span>
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
