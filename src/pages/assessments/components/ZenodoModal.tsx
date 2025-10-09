import { useState } from "react";
import { Modal, Button, Alert, Spinner } from "react-bootstrap";
import { FaExternalLinkAlt, FaSearch } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface ZenodoModalProps {
  show: boolean;
  name: string;
  id: string;
  isPublished: boolean;
  zenodoUrl?: string;
  onHide: () => void;
  onPublish: (id: string) => Promise<void>;
}

function ZenodoModal({
  show,
  name,
  id,
  isPublished,
  zenodoUrl,
  onHide,
  onPublish,
}: ZenodoModalProps) {
  const { t } = useTranslation();
  const [isPublishing, setIsPublishing] = useState(false);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(id);
      onHide();
    } catch (error) {
      console.error("Error publishing to Zenodo:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <FaSearch className="me-2" />
          {t("page_assessment_list.zenodo_modal_title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3">
          <strong>{t("fields.name")}:</strong> {name}
        </div>

        {isPublished ? (
          <Alert variant="success">
            <Alert.Heading className="h6">
              {t("page_assessment_list.zenodo_already_published")}
            </Alert.Heading>
            <p className="mb-2">
              {t("page_assessment_list.zenodo_already_published_message")}
            </p>
            {zenodoUrl && (
              <div className="mt-3">
                <a
                  href={zenodoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-primary btn-sm"
                >
                  <FaExternalLinkAlt className="me-2" />
                  {t("page_assessment_list.view_on_zenodo")}
                </a>
              </div>
            )}
          </Alert>
        ) : (
          <>
            <p
              style={{
                fontSize: "1.1rem",
                lineHeight: "1.3",
              }}
            >
              {t("page_assessment_list.zenodo_publish_confirmation")}
            </p>
            <Alert variant="warning" className="mb-1">
              <small>
                <strong>
                  {t("page_assessment_list.zenodo_warning_title")}
                </strong>{" "}
                {t("page_assessment_list.zenodo_warning_message")}
              </small>
            </Alert>
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide} disabled={isPublishing}>
          {t("buttons.close")}
        </Button>
        {!isPublished && (
          <Button
            variant="success"
            onClick={handlePublish}
            disabled={isPublishing}
          >
            {isPublishing ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                {t("page_assessment_list.toast_zenodo_progress")}
              </>
            ) : (
              <>{t("page_assessment_list.zenodo_publish_button")}</>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ZenodoModal;
