import { useMotivationAddActor } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { relMtvActorId } from "@/config";
import { AlertInfo, MotivationActor } from "@/types";
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
import { FaInfoCircle, FaUser } from "react-icons/fa";

interface MotivationActorModalProps {
  motivationActors: MotivationActor[];
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for adding an actor to motivation
 */
export function MotivationActorModal(props: MotivationActorModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak } = useContext(AuthContext)!;

  const [actorId, setActorId] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const mutateAddActor = useMotivationAddActor(
    keycloak?.token || "",
    props.id,
    actorId,
    relMtvActorId,
  );

  function handleValidate() {
    setShowErrors(true);
    return actorId !== "";
  }

  useEffect(() => {
    if (props.show) {
      {
        setActorId("");
      }
      setShowErrors(false);
    }
  }, [props.show]);

  // handle backend call to add an actor to the motivation
  function handleAddActor() {
    const promise = mutateAddActor
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_motivations.toast_add_actor_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_add_actor_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      onHide={props.onHide}
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          <FaUser className="me-2" />{" "}
          {t("page_motivations.modal_add_actor_title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <InputGroup className="mt-2">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_motivations.tip_select_actor_type")}
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-actor-type">
                  <FaInfoCircle className="me-2" /> {t("actor")} (*):
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Select
                id="input-actor-type"
                aria-describedby="label-actor-type"
                value={actorId ? actorId : ""}
                onChange={(e) => {
                  setActorId(e.target.value);
                }}
              >
                <>
                  <option value="" disabled>
                    {t("page_motivations.select_actor_type")}
                  </option>
                  {props.motivationActors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </>
              </Form.Select>
            </InputGroup>
            {showErrors && actorId === "" && (
              <span className="text-danger">{t("required")}</span>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              handleAddActor();
            }
          }}
        >
          {t("buttons.create")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
