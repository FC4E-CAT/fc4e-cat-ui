import { useState, useEffect } from "react";
import { Modal, Button, Alert, Spinner, ProgressBar } from "react-bootstrap";
import { FaExternalLinkAlt, FaCheck, FaTimes } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { useGetZenodoAssessment } from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { useContext } from "react";

type ZenodoState =
  | "PROCESS_INIT"
  | "DEPOSIT_CREATED"
  | "FILE_UPLOADED_TO_DEPOSIT"
  | "DEPOSIT_PUBLISHED"
  | "PROCESS_COMPLETED"
  | "PROCESS_FAILED";

interface ZenodoModalProps {
  show: boolean;
  name: string;
  id: string;
  isPublished: boolean;
  zenodoUrl?: string;
  zenodoState?: string | undefined;
  onHide: () => void;
  onPublish: (id: string) => Promise<void>;
  onRefetch?: () => void;
}

function ZenodoModal({
  show,
  name,
  id,
  isPublished,
  zenodoUrl,
  zenodoState,
  onHide,
  onPublish,
  onRefetch,
}: ZenodoModalProps) {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [isPublishing, setIsPublishing] = useState(false);

  const { data: zenodoAssessment } = useGetZenodoAssessment({
    id,
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (
      show &&
      zenodoState !== "PROCESS_COMPLETED" &&
      zenodoState !== "PROCESS_FAILED" &&
      onRefetch
    ) {
      interval = setInterval(() => {
        onRefetch();
      }, 1000); // Poll every 2 seconds
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [show, zenodoState, onRefetch]);

  const isInProgressState = (state: string): boolean => {
    return [
      "PROCESS_INIT",
      "DEPOSIT_CREATED",
      "FILE_UPLOADED_TO_DEPOSIT",
      "DEPOSIT_PUBLISHED",
    ].includes(state);
  };

  // Reset publishing state when process fails
  useEffect(() => {
    if (zenodoState === "PROCESS_FAILED" && isPublishing) {
      setIsPublishing(false);
    }
  }, [zenodoState, isPublishing]);

  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await onPublish(id);
    } catch (error) {
      console.error("Error publishing to Zenodo:", error);
      setIsPublishing(false);
    }
  };

  const getStepStatus = (stepState: ZenodoState) => {
    // If we're publishing but no zenodo_publication_state yet, show first step as active
    if (isPublishing && !zenodoState) {
      return stepState === "PROCESS_INIT" ? "active" : "pending";
    }

    if (!zenodoState) return "pending";

    const stateOrder = [
      "PROCESS_INIT",
      "DEPOSIT_CREATED",
      "FILE_UPLOADED_TO_DEPOSIT",
      "DEPOSIT_PUBLISHED",
      "PROCESS_COMPLETED",
    ];
    const currentIndex = stateOrder.indexOf(zenodoState);
    const stepIndex = stateOrder.indexOf(stepState);

    if (zenodoState === "PROCESS_FAILED") return "failed";
    if (stepIndex < currentIndex) return "completed";
    if (stepIndex === currentIndex) return "active";
    return "pending";
  };

  const renderStepIcon = (status: string, isFinalStep: boolean = false) => {
    switch (status) {
      case "completed":
        return (
          <FaCheck className={isFinalStep ? "text-success" : "text-primary"} />
        );
      case "active":
        return (
          <Spinner
            as="span"
            animation="border"
            size="sm"
            className="text-primary"
          />
        );
      case "failed":
        return <FaTimes className="text-danger" />;
      default:
        return <div className="step-pending-icon"></div>;
    }
  };

  const getProgressPercentage = () => {
    // If we're publishing but no zenodo_publication_state yet, show minimal progress
    if (isPublishing && !zenodoState) return 10;

    if (!zenodoState) return 0;

    const stateOrder = [
      "PROCESS_INIT",
      "DEPOSIT_CREATED",
      "FILE_UPLOADED_TO_DEPOSIT",
      "DEPOSIT_PUBLISHED",
      "PROCESS_COMPLETED",
    ];
    const currentIndex = stateOrder.indexOf(zenodoState);

    if (zenodoState === "PROCESS_FAILED") return 100;
    if (zenodoState === "PROCESS_COMPLETED") return 100;

    return Math.max(0, (currentIndex / (stateOrder.length - 1)) * 100);
  };

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          <img
            className="me-2 mb-1"
            src="/zenodo.svg"
            style={{ height: "1.4rem" }}
          />
          {isPublished
            ? t("page_assessment_list.zenodo_modal_title_published")
            : t("page_assessment_list.zenodo_modal_title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="mb-3 d-flex align-items-center justify-content-between gap-1">
          <span>
            <strong>{t("fields.name")}:</strong> {name}
          </span>
          {zenodoAssessment?.image_url && zenodoAssessment?.target_url && (
            <a
              href={zenodoAssessment.target_url}
              target="_blank"
              rel="noopener noreferrer"
              title={`DOI: ${zenodoAssessment.doi}`}
            >
              <img
                src={zenodoAssessment.image_url}
                alt={`DOI Badge: ${zenodoAssessment.doi}`}
                style={{ height: "18px" }}
              />
            </a>
          )}
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
            {(zenodoState &&
              (isInProgressState(zenodoState) ||
                zenodoState === "PROCESS_FAILED")) ||
            isPublishing ? (
              <>
                <div className="mb-3">
                  <h6 className="mb-1">Publishing Progress</h6>
                  <ProgressBar now={getProgressPercentage()} className="mb-3" />

                  <div className="steps-container">
                    <div
                      className={`step-item d-flex align-items-center mb-2 ${getStepStatus("PROCESS_INIT")}`}
                    >
                      {renderStepIcon(getStepStatus("PROCESS_INIT"))}
                      <span
                        className={`ms-2 ${["completed", "active"].includes(getStepStatus("PROCESS_INIT")) ? "text-primary" : ""}`}
                      >
                        Initializing Process
                      </span>
                    </div>

                    <div
                      className={`step-item d-flex align-items-center mb-2 ${getStepStatus("DEPOSIT_CREATED")}`}
                    >
                      {renderStepIcon(getStepStatus("DEPOSIT_CREATED"))}
                      <span
                        className={`ms-2 ${["completed", "active"].includes(getStepStatus("DEPOSIT_CREATED")) ? "text-primary" : ""}`}
                      >
                        Creating Zenodo Deposit
                      </span>
                    </div>

                    <div
                      className={`step-item d-flex align-items-center mb-2 ${getStepStatus("FILE_UPLOADED_TO_DEPOSIT")}`}
                    >
                      {renderStepIcon(
                        getStepStatus("FILE_UPLOADED_TO_DEPOSIT"),
                      )}
                      <span
                        className={`ms-2 ${["completed", "active"].includes(getStepStatus("FILE_UPLOADED_TO_DEPOSIT")) ? "text-primary" : ""}`}
                      >
                        Uploading Assessment File
                      </span>
                    </div>

                    <div
                      className={`step-item d-flex align-items-center mb-2 ${getStepStatus("DEPOSIT_PUBLISHED")}`}
                    >
                      {renderStepIcon(getStepStatus("DEPOSIT_PUBLISHED"))}
                      <span
                        className={`ms-2 ${["completed", "active"].includes(getStepStatus("DEPOSIT_PUBLISHED")) ? "text-primary" : ""}`}
                      >
                        Publishing to Repository
                      </span>
                    </div>

                    <div
                      className={`step-item d-flex align-items-center mb-2 ${
                        zenodoState === "PROCESS_COMPLETED"
                          ? "completed"
                          : zenodoState === "PROCESS_FAILED"
                            ? "failed"
                            : "pending"
                      }`}
                    >
                      {zenodoState === "PROCESS_COMPLETED" ? (
                        <FaCheck className="text-success" />
                      ) : zenodoState === "PROCESS_FAILED" ? (
                        <FaTimes className="text-danger" />
                      ) : (
                        <div className="step-pending-icon"></div>
                      )}
                      <span
                        className={`ms-2 ${
                          zenodoState === "PROCESS_COMPLETED"
                            ? "text-success fw-bold"
                            : zenodoState === "PROCESS_FAILED"
                              ? "text-danger fw-bold"
                              : ""
                        }`}
                      >
                        {zenodoState === "PROCESS_COMPLETED"
                          ? "Successfully Published!"
                          : zenodoState === "PROCESS_FAILED"
                            ? "Publishing Failed"
                            : "Finalizing..."}
                      </span>
                    </div>
                  </div>

                  {zenodoState === "PROCESS_FAILED" && (
                    <Alert variant="danger" className="mt-3">
                      <small>
                        <strong>Error:</strong> Publishing to Zenodo failed.
                        Please try again later.
                      </small>
                    </Alert>
                  )}

                  {zenodoState === "PROCESS_COMPLETED" && zenodoUrl && (
                    <Alert variant="success" className="mt-3">
                      <Alert.Heading className="h6">
                        🎉 Successfully Published!
                      </Alert.Heading>
                      <p className="mb-2">
                        Your assessment has been successfully published to
                        Zenodo.
                      </p>
                      <div className="d-flex gap-2 flex-wrap">
                        <a
                          href={zenodoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline-success btn-sm"
                        >
                          <FaExternalLinkAlt className="me-2" />
                          {t("page_assessment_list.view_on_zenodo")}
                        </a>
                      </div>
                    </Alert>
                  )}
                </div>
              </>
            ) : (
              <>
                <p
                  style={{
                    fontSize: "1.1rem",
                    lineHeight: "1.3",
                  }}
                >
                  Are you sure you want to request publishing this assessment to
                  the Zenodo repository?
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
          </>
        )}
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          onClick={onHide}
          disabled={Boolean(zenodoState && isInProgressState(zenodoState))}
        >
          {t("buttons.close")}
        </Button>
        {!isPublished && zenodoState !== "PROCESS_COMPLETED" && (
          <Button
            variant={zenodoState === "PROCESS_FAILED" ? "warning" : "success"}
            onClick={handlePublish}
            disabled={
              isPublishing ||
              Boolean(zenodoState && isInProgressState(zenodoState))
            }
          >
            {isPublishing || (zenodoState && isInProgressState(zenodoState)) ? (
              <>
                <Spinner
                  as="span"
                  animation="border"
                  size="sm"
                  role="status"
                  className="me-2"
                />
                Processing Request...
              </>
            ) : (
              <>
                {zenodoState === "PROCESS_FAILED"
                  ? "Retry Publishing to Zenodo"
                  : "Request to Publish to Zenodo"}
              </>
            )}
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

export default ZenodoModal;
