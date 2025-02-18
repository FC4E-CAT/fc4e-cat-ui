import { useAssessmentPublish, useAssessmentUnpublish } from "@/api";
import { AuthContext } from "@/auth";
import { AlertInfo } from "@/types";
import { useContext, useRef } from "react";
import { Modal, Button, ListGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface PublishModalProps {
  name: string;
  id: string;
  admin: boolean;
  publish: boolean;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for publish/unpublish assessments
 */
export function PublishModal(props: PublishModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();

  const mutatePublish = useAssessmentPublish(
    keycloak?.token || "",
    props.id,
    props.admin,
  );
  const mutateUnpublish = useAssessmentUnpublish(
    keycloak?.token || "",
    props.id,
    props.admin,
  );

  function handlePublish() {
    const promise = mutatePublish
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("toast_assessment_publish_success"),
        };
        props.onHide();
      });
    toast.promise(promise, {
      loading: t("toast_assessment_publish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleUnpublish() {
    const promise = mutateUnpublish
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        alert.current = {
          message: t("toast_assessment_unpublish_success"),
        };
        props.onHide();
      });
    toast.promise(promise, {
      loading: t("toast_assessment_unpublish_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.publish ? (
            <>
              <FaEye className="me-2" />
              {t("assessment_publish_title")}
            </>
          ) : (
            <>
              <FaEyeSlash className="me-2" />
              {t("assessment_unpublish_title")}
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <span>
            {props.publish
              ? t("assessment_publish_message")
              : t("assessment_unpublish_message")}
          </span>
          <ListGroup>
            <ListGroup.Item>
              <strong>{t("fields.name")}: </strong>
              {props.name}
            </ListGroup.Item>
            <ListGroup.Item>
              <strong>{t("fields.id")}: </strong>
              {props.id}
            </ListGroup.Item>
          </ListGroup>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        {props.publish ? (
          <Button
            className="btn-success"
            onClick={() => {
              handlePublish();
            }}
          >
            {t("buttons.publish")}
          </Button>
        ) : (
          <Button
            className="btn-success"
            onClick={() => {
              handleUnpublish();
            }}
          >
            {t("buttons.unpublish")}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}
