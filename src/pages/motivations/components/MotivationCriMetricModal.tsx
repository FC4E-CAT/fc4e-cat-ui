import { Modal, Button } from "react-bootstrap";
import MotivationCriMetric from "./MotivationCriMetric";
import { useTranslation } from "react-i18next";

interface MotivationCriMetricProps {
  mtvId: string;
  criId: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for displaying criterion metric
 */
export function MotivationCriMetricModal(props: MotivationCriMetricProps) {
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
          {t("page_motivations.criterion_metric_tests")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.mtvId && props.criId && (
          <MotivationCriMetric mtvId={props.mtvId} criId={props.criId} />
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
