import { useValidationStatusUpdate, useGetValidationDetails } from "@/api";
import { AuthContext } from "@/auth";
import {
  ValidationProps,
  AlertInfo,
  ValidationResponse,
  ValidationStatus,
} from "@/types";
import { useRef, useState, useContext, useEffect } from "react";
import { Form, Modal } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  FaExclamationTriangle,
  FaGlasses,
  FaTimes,
  FaCheck,
  FaCopy,
  FaUserCircle,
} from "react-icons/fa";
import Badge from "react-bootstrap/Badge";
import { useParams, useNavigate, Link } from "react-router-dom";
import { idToColor, trimField } from "@/utils/admin";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

function ValidationDetails(props: ValidationProps) {
  const { t } = useTranslation();

  const params = useParams();
  const navigate = useNavigate();
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const isAdmin = useRef<boolean>(false);
  const [reviewStatus, setReviewStatus] = useState<string>("");
  const { keycloak, registered } = useContext(AuthContext)!;
  const [rejection, setRejection] = useState<string>("");

  const { mutateAsync: mutateValidationUpdateStatus } =
    useValidationStatusUpdate({
      validation_id: params.id!,
      status: reviewStatus,
      rejection_reason: rejection,
      token: keycloak?.token || "",
      isRegistered: registered,
    });

  if (props.admin) {
    isAdmin.current = true;
  }

  const [copySuccess, setCopySuccess] = useState("");

  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copySuccess ? t("tip_copied") : t("tip_copy")}
    </Tooltip>
  );
  const [validation, setValidation] = useState<ValidationResponse>();

  const { data: validationData } = useGetValidationDetails({
    validation_id: params.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
    adminMode: props.admin || false,
  });

  useEffect(() => {
    setValidation(validationData);
  }, [validationData]);

  let rejectCard = null;
  let approveCard = null;

  if (props.toReject) {
    rejectCard = (
      <Modal show={true} className="border-danger mb-2">
        <Modal.Header className="card-header border-danger text-danger text-center">
          <h5>
            <FaExclamationTriangle className="mx-3" />
            <strong>{t("page_validation_details.modal_reject")}</strong>
          </h5>
        </Modal.Header>
        <Modal.Body className=" card-body border-danger text-center">
          {t("page_validation_details.modal_reject_text")}:{" "}
          <strong>{params.id}</strong> ?
          <div className="text-start mt-2">
            <Form.Control
              id="input-share-user"
              placeholder={t(
                "page_validation_details.reject_reason_placeholder",
              )}
              value={rejection}
              as="textarea"
              rows={3}
              onChange={(e) => {
                setRejection(e.target.value);
              }}
              aria-describedby="label-share-user"
            />
          </div>
        </Modal.Body>
        <Modal.Footer className="card-footer border-danger text-danger text-center">
          <button
            className="btn btn-danger mr-2"
            disabled={rejection === ""}
            onClick={() => {
              setReviewStatus(ValidationStatus.REJECTED);
              const promise = mutateValidationUpdateStatus()
                .catch((err) => {
                  alert.current = {
                    message: t("page_validation_details.toast_reject_fail"),
                  };
                  throw err;
                })
                .then(() => {
                  alert.current = {
                    message: t("page_validation_details.toast_reject_success"),
                  };
                })
                .finally(() => navigate("/admin/validations"));
              toast.promise(promise, {
                loading: t("page_validation_details.toast_reject_progress"),
                success: () => `${alert.current.message}`,
                error: () => `${alert.current.message}`,
              });
            }}
          >
            {t("buttons.reject")}
          </button>
          <button
            onClick={() => {
              navigate(`/admin/validations/${params.id}`);
            }}
            className="btn btn-dark mx-4"
          >
            {t("buttons.cancel")}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (props.toApprove) {
    approveCard = (
      <Modal show={true}>
        <Modal.Header className="border-success text-success text-center">
          <h5>
            <FaExclamationTriangle className="mx-3" />
            <strong>{t("page_validation_details.modal_approve")}</strong>
          </h5>
        </Modal.Header>
        <Modal.Body className="border-info text-center">
          {t("page_validation_details.modal_approve_text")}:{" "}
          <strong>{params.id}</strong> ?
        </Modal.Body>
        <Modal.Footer className="border-success text-success text-center">
          <button
            className="btn btn-success mr-2"
            onClick={() => {
              setReviewStatus(ValidationStatus.APPROVED);
              const promise = mutateValidationUpdateStatus()
                .catch((err) => {
                  alert.current = {
                    message: t("page_validation_details.toast_approve_fail"),
                  };
                  throw err;
                })
                .then(() => {
                  alert.current = {
                    message: t("page_validation_details.toast_approve_success"),
                  };
                })
                .finally(() => navigate("/admin/validations"));
              toast.promise(promise, {
                loading: t("page_validation_details.toast_approve_progress"),
                success: () => `${alert.current.message}`,
                error: () => `${alert.current.message}`,
              });
            }}
          >
            {t("buttons.approve")}
          </button>
          <button
            onClick={() => {
              navigate(`/admin/validations/${params.id}`);
            }}
            className="btn btn-dark mx-4"
          >
            {t("buttons.cancel")}
          </button>
        </Modal.Footer>
      </Modal>
    );
  }

  if (keycloak?.token) {
    return (
      <div>
        <span id="alert-spot" />
        {rejectCard}
        {approveCard}
        <div className="cat-view-heading-block row border-bottom">
          <div className="col">
            <h2 className="cat-view-heading text-muted">
              {t("page_validation_details.title")}
              <p className="lead cat-view-lead">
                {props.admin ? (
                  <span className="admin-mode-badge-sm">
                    <small className="small-badge">
                      <Badge bg="dark"> {t("admin_mode")}</Badge>
                    </small>
                  </span>
                ) : null}
                {t("page_validation_details.subtitle")}: {validation?.id} .
              </p>
            </h2>
          </div>
          <div className="col-md-auto cat-heading-right">
            {validation?.status === ValidationStatus.REVIEW &&
              isAdmin?.current &&
              !props.toApprove &&
              !props.toReject && (
                <span>
                  <Link
                    className="btn btn-light border-black text-success"
                    to={`/admin/validations/${params.id}/approve#alert-spot`}
                  >
                    <FaCheck /> {t("buttons.approve")}
                  </Link>
                  <Link
                    className="btn btn-light mx-4 text-danger border-black"
                    to={`/admin/validations/${params.id}/reject#alert-spot`}
                  >
                    <FaTimes /> {t("buttons.reject")}
                  </Link>
                </span>
              )}
          </div>
        </div>
        <div className="row">
          <div className="col col-lg-3 border-right  border-dashed">
            <div className="d-flex flex-column align-items-center text-center p-1 py-1">
              <div className="py-3 mt-5">
                <FaUserCircle
                  size={"9rem"}
                  style={{ color: idToColor(validation?.user_id || "black") }}
                />
              </div>
              <span className="font-weight-bold">
                {validation?.user_name} {validation?.user_surname}
              </span>
              <span className="text-black-50">{validation?.user_email}</span>
              {validation?.user_id && (
                <span className="text-black-50">
                  <strong>ID:</strong> {trimField(validation?.user_id, 10)}
                  <OverlayTrigger
                    placement="top"
                    delay={{ show: 250, hide: 400 }}
                    overlay={renderTooltip}
                  >
                    <CopyToClipboard
                      text={validation?.user_id}
                      onCopy={() => setCopySuccess("Copied!")}
                    >
                      <FaCopy
                        style={{
                          color: "#FF7F50",
                          cursor: "pointer",
                          marginLeft: "10px",
                        }}
                        onMouseLeave={() => setCopySuccess("")}
                      />
                    </CopyToClipboard>
                  </OverlayTrigger>
                </span>
              )}
            </div>
          </div>
          <div className="col col-lg-9 border-right">
            <div className="p-3">
              <div className="row py-3 mt-4">
                {validation?.status === "REVIEW" && (
                  <h4>
                    {t("field.status")}
                    <small className="px-3">
                      <span className="badge bg-primary">
                        <FaGlasses /> {t("review")}
                      </span>
                    </small>
                  </h4>
                )}
                {validation?.status === ValidationStatus.REJECTED && (
                  <>
                    <h4>
                      {t("field.status")}
                      <small className="px-3">
                        <span className="badge bg-danger">
                          <FaTimes /> {t("rejected")}
                        </span>
                      </small>
                    </h4>
                    <div className="alert alert-danger">
                      <strong>
                        {t("page_validation_details.rejection_reason")}:
                      </strong>
                      <p>{validation?.rejection_reason}</p>
                    </div>
                    <div>
                      <strong>
                        {t("page_validation_details.rejected_on")}:
                      </strong>{" "}
                      {validation?.validated_on}
                    </div>
                    <div>
                      <strong>
                        {t("page_validation_details.rejected_by")}:
                      </strong>{" "}
                      {validation?.validated_by}
                    </div>
                  </>
                )}
                {validation?.status === ValidationStatus.APPROVED && (
                  <>
                    <h4>
                      {t("field.status")}
                      <small className="px-3">
                        <span className="badge bg-success">
                          <FaCheck /> {t("approved")}
                        </span>
                      </small>
                    </h4>
                    <div>
                      <strong>
                        {t("page_validation_details.approved_on")}:
                      </strong>{" "}
                      {validation?.validated_on}
                    </div>
                    <div>
                      <strong>
                        {t("page_validation_details.approved_by")}:
                      </strong>{" "}
                      {validation?.validated_by}
                    </div>
                  </>
                )}{" "}
                <section className="col-9 disabled">
                  <div>
                    <strong>{t("fields.created_on")}:</strong>{" "}
                    {validation?.created_on}
                  </div>
                </section>
              </div>
              <div className="row border-top py-3 mt-4">
                <h4>{t("fields.organisation")}</h4>
                <section className="col-9 disabled">
                  <div>
                    <strong>{t("fields.id")}: </strong>
                    {validation?.organisation_source === "ROR" ? (
                      <>
                        <a
                          target="_blank"
                          rel="noreferrer"
                          href={"http://ror.org/" + validation?.organisation_id}
                        >
                          {validation?.organisation_id}
                        </a>
                        <span> - [{t("ror")}]</span>
                      </>
                    ) : (
                      <>
                        <span>{validation?.organisation_id}</span>
                        <small>({validation?.organisation_source})</small>
                      </>
                    )}
                  </div>
                  <div>
                    <strong>{t("fields.name")}:</strong>{" "}
                    {validation?.organisation_name}
                  </div>
                </section>
              </div>
              <div className="row border-top py-3 mt-4">
                <h4>{t("fields.roles")}</h4>
                <section className="col-9 disabled">
                  <div>
                    <strong>
                      {t("page_validation_details.org_user_role")}:
                    </strong>{" "}
                    {validation?.organisation_role}
                  </div>
                  <div>
                    <strong>
                      {t("page_validation_details.actor_user_requests")}:
                    </strong>{" "}
                    {validation?.actor_name}
                  </div>
                </section>
              </div>
            </div>
          </div>
        </div>

        <Link
          className="btn btn-secondary my-4"
          to={`${isAdmin.current ? "/admin" : ""}/validations`}
        >
          {t("buttons.back")}
        </Link>
      </div>
    );
  } else {
    return <div>{t("no_login")}</div>;
  }
}

export default ValidationDetails;
