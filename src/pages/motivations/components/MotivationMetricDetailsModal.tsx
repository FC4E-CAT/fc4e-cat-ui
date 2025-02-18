import { Modal, Button } from "react-bootstrap";
import MotivationMetric from "./MotivationMetric";
import { useTranslation } from "react-i18next";

interface MotivationMetricProps {
  mtvId: string;
  itemId: string;
  show: boolean;
  getByCriterion: boolean;
  onHide: () => void;
}
/**
 * Modal component for displaying criterion metric
 */
export function MotivationMetricDetailsModal(props: MotivationMetricProps) {
  const { t } = useTranslation();
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
          {props.getByCriterion
            ? t("page_motivations.criterion_metric_tests")
            : t("page_motivations.metric_details")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.mtvId && props.itemId && (
          <MotivationMetric
            mtvId={props.mtvId}
            itemId={props.itemId}
            getByCriterion={props.getByCriterion}
          />
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
