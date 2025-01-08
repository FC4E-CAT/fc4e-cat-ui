import { useGetAssessmentShares, useShareAssessment } from "@/api";
import { AuthContext } from "@/auth";
import { AlertInfo } from "@/types";
import { useContext, useRef, useState } from "react";
import { Modal, Button, ListGroup, Form, InputGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaShare, FaUserAlt, FaCopy } from "react-icons/fa";
import { Tooltip, OverlayTrigger, TooltipProps } from "react-bootstrap";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { useTranslation } from "react-i18next";

interface ShareModalProps {
  name: string;
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for adding shares (share assessment to other users)
 */
export function ShareModal(props: ShareModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;
  const { t } = useTranslation();

  const qShares = useGetAssessmentShares({
    id: props.id,
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });
  const mutateShare = useShareAssessment(keycloak?.token || "", props.id);
  const [email, setEmail] = useState("");

  const [copySuccess, setCopySuccess] = useState("");

  const domainName =
    window.location.protocol + "://" + window.location.hostname;
  const renderTooltip = (props: TooltipProps) => (
    <Tooltip id="button-tooltip" {...props}>
      {copySuccess ? "Copied!" : "Copy to clipboard"}
    </Tooltip>
  );

  function handleShare() {
    const promise = mutateShare
      .mutateAsync({
        shared_with_user: email,
      })
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        setEmail("");
        alert.current = {
          message: `${t("page_assessment_edit.toast_share_success")}: ${email}`,
        };
      });
    toast.promise(promise, {
      loading: t("page_assessment_edit.toast_share_progress"),
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
          <FaShare className="me-2" />
          {t("page_assessment_list.tip_share")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
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
        <div className="mt-2">
          <ListGroup>
            <ListGroup.Item>
              <span className="text-black-50">
                <small>
                  <strong>{t("page_assessment_edit.share_url")}</strong>
                  <br />
                  {t("page_assessment_edit.share_url_text")}{" "}
                </small>
                <OverlayTrigger
                  placement="top"
                  delay={{ show: 250, hide: 400 }}
                  overlay={renderTooltip}
                >
                  <CopyToClipboard
                    text={`${domainName}/assessments/${props.id}`}
                    onCopy={() => setCopySuccess(t("copied"))}
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
            </ListGroup.Item>
          </ListGroup>
        </div>
        <div className="mt-2 bg-light p-3 rounded border">
          <InputGroup>
            <InputGroup.Text id="label-share-user">
              {t("page_assessment_edit.share_with")}:
            </InputGroup.Text>
            <Form.Control
              id="input-share-user"
              placeholder={t("page_assessment_edit.share_email")}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              aria-describedby="label-share-user"
            />
            <Button
              disabled={email.length == 0}
              onClick={() => {
                handleShare();
              }}
            >
              {t("buttons.confirm")}
            </Button>
          </InputGroup>

          {qShares.data && (
            <div className="mt-2">
              <small>
                {t("page_assessment_edit.already_shared")}
                <ListGroup>
                  {qShares.data.shared_users.map((item) => (
                    <ListGroup.Item key={item.id}>
                      <FaUserAlt className="me-2" /> {item.name} {item.surname}{" "}
                      ({item.email})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </small>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
