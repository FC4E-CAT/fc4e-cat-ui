import { useContext, useState, useEffect } from "react";
import { useGetProfile, useGetValidationList } from "@/api";
import { AuthContext } from "@/auth";
import type { ValidationResponse } from "@/types";
import { Link } from "react-router-dom";
import {
  FaList,
  FaExclamationTriangle,
  FaPlus,
  FaArrowLeft,
  FaArrowRight,
  FaIdBadge,
  FaUserSecret,
} from "react-icons/fa";

import {
  Alert,
  OverlayTrigger,
  Tooltip,
  Row,
  Col,
  Card,
  Badge,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";
import BadgeStatus from "@/components/BadgeStatus";
import ROUTES, { buildRoute } from "../../routes";

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

  const { data: profileData } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const shouldShowActions =
    (profileData?.name && profileData?.surname && profileData?.email) ||
    profileData?.user_type === "Admin";

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
        {shouldShowActions && (
          <div className="col-md-auto cat-heading-right">
            <Link
              to={ROUTES.VALIDATIONS.REQUEST}
              className="btn btn-warning mx-2"
            >
              <FaPlus className="m2" /> {t("buttons.create_new")}
            </Link>
          </div>
        )}
      </div>

      <div className="py-2 px-2 ">
        {validations.length > 0 ? (
          <Row className="mt-3 align-items-stretch">
            {validations.map((item) => (
              <Col
                key={item.id}
                lg={3}
                md={6}
                sm={12}
                className="mb-2 d-flex align-items-stretch"
              >
                <Card className="shadow border-1 w-100">
                  <Card.Body className="p-3">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <BadgeStatus status={item.status} />
                      <div className="small text-end">
                        <Badge bg="light" text="dark">
                          {t("fields.id")}:{item.id}
                        </Badge>
                      </div>
                    </div>
                    <div className="gap-2 mb-1">
                      <Card.Title className="fw-light fs-5">
                        {item.organisation_name}
                      </Card.Title>
                    </div>
                    <div className="fw-light fs-6">
                      {" "}
                      <FaIdBadge className="m2 text-secondary " />{" "}
                      {item.organisation_role}
                    </div>
                    <div className="fw-light fs-6">
                      {" "}
                      <FaUserSecret className="m2 text-secondary " />{" "}
                      {item.registry_actor_name}
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-transparent border-1">
                    <div className="text-end">
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
                          className="btn btn-light btn-sm"
                          to={buildRoute(ROUTES.VALIDATIONS.VIEW, {
                            id: item.id.toString(),
                          })}
                        >
                          <FaList />
                        </Link>
                      </OverlayTrigger>
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))}
          </Row>
        ) : null}
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
