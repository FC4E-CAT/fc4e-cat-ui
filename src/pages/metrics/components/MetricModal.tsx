import { RegistryMetric } from "@/types";

import { Modal, Button, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaBorderNone } from "react-icons/fa";

interface MetricModalProps {
  metric: RegistryMetric | null;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for viewing details of a metric
 */
export function MetricModal(props: MetricModalProps) {
  const { t } = useTranslation();

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaBorderNone className="me-2" /> {t("page_metrics.tip_view")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          <ListGroup.Item>
            <strong>ID:</strong>
            <span className="ms-2">{props.metric?.metric_id}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>MTR:</strong>
            <span className="ms-2">{props.metric?.metric_mtr}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Label:</strong>
            <span className="ms-2">{props.metric?.metric_label}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Motivation:</strong>
            <span className="ms-2">{props.metric?.motivation_id}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Description:</strong>
            <span className="ms-2">{props.metric?.metric_description}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Algorithm Type:</strong>
            <span className="ms-2">{props.metric?.type_algorithm_label}</span>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Benchmark Type:</strong>
            <span className="ms-2">{props.metric?.type_benchmark_label}</span>
            <br />
            <small>{props.metric?.type_benchmark_description}</small>
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>Benchmark Value:</strong>
            <span className="ms-2">{props.metric?.value_benchmark}</span>
          </ListGroup.Item>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
