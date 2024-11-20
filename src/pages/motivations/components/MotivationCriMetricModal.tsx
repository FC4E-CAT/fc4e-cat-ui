import { Modal, Button } from "react-bootstrap";
import MotivationCriMetric from "./MotivationCriMetric";

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
          Criterion Metric/Tests
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.mtvId && props.criId && (
          <MotivationCriMetric mtvId={props.mtvId} criId={props.criId} />
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
