import { useCreateMotivationPrinciple } from "@/api";
import {
  useCreatePrinciple,
  useUpdatePrinciple,
} from "@/api/services/principles";
import { AuthContext } from "@/auth";
import { AlertInfo, Principle, PrincipleInput } from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaFile, FaInfoCircle } from "react-icons/fa";

interface PrincipleModalProps {
  principle: Principle | null;
  mtvId?: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for creating/editing a principle
 */
export function PrincipleModal(props: PrincipleModalProps) {
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak } = useContext(AuthContext)!;

  const [principleInput, setPrincipleInput] = useState<PrincipleInput>({
    pri: "",
    label: "",
    description: "",
  });

  const [showErrors, setShowErrors] = useState(false);

  function handleValidate() {
    setShowErrors(true);
    return (
      principleInput.pri !== "" &&
      principleInput.label !== "" &&
      principleInput.description !== ""
    );
  }

  const mutateCreate = useCreatePrinciple(
    keycloak?.token || "",
    principleInput,
  );

  const mutateCreateMtv = useCreateMotivationPrinciple(
    keycloak?.token || "",
    props.mtvId || "",
    principleInput,
  );

  const mutateUpdate = useUpdatePrinciple(
    keycloak?.token || "",
    props.principle?.id || "",
    principleInput,
  );

  useEffect(() => {
    if (props.show) {
      if (props.principle) {
        setPrincipleInput({
          pri: props.principle.pri,
          label: props.principle.label,
          description: props.principle.description,
        });
      } else {
        setPrincipleInput({
          pri: "",
          label: "",
          description: "",
        });
      }

      setShowErrors(false);
    }
  }, [props.show, props.principle]);

  // handle backend call to add a new principle
  function handleCreate() {
    const promise = mutateCreate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_principles.toast_create_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_principles.toast_create_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleCreateMtv() {
    const promise = mutateCreateMtv
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_principles.toast_create_mtv_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_principles.toast_create_mtv_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handle backend call to update an existing principle
  function handleUpdate() {
    const promise = mutateUpdate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_principles.toast_update_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_principles.toast_update_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaFile className="me-2" />{" "}
          {props.principle === null ? t("create_new") : t("edit")}{" "}
          {` ${t("principle")}`}
          {props.mtvId && ` (${t("under_motivation")})`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Row>
            <Col xs={3}>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_principles.tip_pri")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-principle-pri">
                    <FaInfoCircle className="me-2" /> Pri (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-principle-pri"
                  value={principleInput.pri}
                  onChange={(e) => {
                    setPrincipleInput({
                      ...principleInput,
                      pri: e.target.value,
                    });
                  }}
                  aria-describedby="label-principle-pri"
                />
              </InputGroup>
              {showErrors && principleInput.pri === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_principles.tip_description")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-principle-label">
                    <FaInfoCircle className="me-2" /> {t("fields.label")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-principle-label"
                  aria-describedby="label-principle-label"
                  value={principleInput.label}
                  onChange={(e) => {
                    setPrincipleInput({
                      ...principleInput,
                      label: e.target.value,
                    });
                  }}
                />
              </InputGroup>
              {showErrors && principleInput.label === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="mt-1">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_principles.tip_description")}
                  </Tooltip>
                }
              >
                <span id="label-principle-description">
                  <FaInfoCircle className="ms-1 me-2" />{" "}
                  {t("fields.description")} (*):
                </span>
              </OverlayTrigger>
              <Form.Control
                className="mt-1"
                as="textarea"
                rows={2}
                value={principleInput.description}
                onChange={(e) => {
                  setPrincipleInput({
                    ...principleInput,
                    description: e.target.value,
                  });
                }}
              />
              {showErrors && principleInput.description === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              if (props.principle === null) {
                if (props.mtvId && props.mtvId !== "") {
                  handleCreateMtv();
                } else {
                  handleCreate();
                }
              } else {
                handleUpdate();
              }
            }
          }}
        >
          {props.principle === null ? t("buttons.create") : t("buttons.update")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
