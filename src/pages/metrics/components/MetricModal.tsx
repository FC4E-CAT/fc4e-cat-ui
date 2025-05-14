import { RegistryMetric } from "@/types";

import { Modal, Button, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaBorderNone, FaChartArea, FaCheck } from "react-icons/fa";
import { FaChartSimple, FaGlasses } from "react-icons/fa6";
import { MotivationRefList } from "@/components/MotivationRefList";

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
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          <FaBorderNone className="me-2" /> {t("page_metrics.tip_view")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="cat-view-heading-block row">
          <div className="col">
            <h6 className="text-muted cat-view-heading ">
              {props.metric?.metric_mtr} - {props.metric?.metric_label} /{" "}
              {props.metric?.metric_id}
            </h6>
            <p className="cat-view-lead">{props.metric?.metric_description}</p>
          </div>
          <div className="col-md-auto  cat-heading-right"></div>
        </div>
        <div className="ms-2">
          <ListGroup>
            <h6 className="chocolate">
              {" "}
              <FaChartSimple
                style={{
                  color: "#D2691E",
                  marginLeft: "10px",
                }}
                className="me-2"
              />
              {t("fields.algorithm")}
            </h6>

            <span className="ms-2">
              <span className="small badge bg-light-cat">
                <FaGlasses /> {props.metric?.type_algorithm_label}
              </span>
              <span className="ms-2">
                <small>{props.metric?.type_algorithm_description}</small>
              </span>
            </span>
          </ListGroup>
          <hr></hr>
          <ListGroup>
            <h6 className="chocolate">
              {" "}
              <FaChartArea
                style={{
                  color: "#D2691E",
                  marginLeft: "10px",
                }}
                className="me-2"
              />
              {t("fields.benchmark")}
            </h6>
            <span className="ms-2">
              <span className="small badge bg-success-cat">
                <FaCheck /> {props.metric?.type_benchmark_label}
              </span>
              <span className="ms-2">
                <small>{props.metric?.type_benchmark_description}</small>
              </span>
            </span>
            <div className="container">
              {props.metric?.type_benchmark_patter ? (
                <div className="row">
                  <div className="col-1">
                    <small>
                      <strong>{t("fields.pattern")}</strong>
                    </small>
                  </div>
                  <div className="col-2">
                    <span>
                      {" "}
                      <span className="ms-2">
                        <span className="badge bg-primary-cat">
                          {props.metric?.type_benchmark_patter}
                        </span>
                      </span>
                    </span>
                  </div>
                </div>
              ) : null}
              <div className="row">
                <div className="col-1">
                  <small>
                    <strong>{t("fields.value")}</strong>
                  </small>
                </div>
                <div className="col-2">
                  <span className="ms-2">
                    <span className="badge bg-primary-cat">
                      {props.metric?.value_benchmark}
                    </span>
                  </span>{" "}
                </div>
              </div>
            </div>
          </ListGroup>
          <hr></hr>
          <ListGroup>
            <h6 className="chocolate">
              {" "}
              <FaChartArea
                style={{
                  color: "#D2691E",
                  marginLeft: "10px",
                }}
                className="me-2"
              />
              {t("fields.motivations")}
            </h6>
            <span className="ms-3">
              <MotivationRefList
                motivations={props.metric?.used_by_motivations || []}
              />
            </span>
          </ListGroup>
        </div>
      </Modal.Body>
      <Modal.Footer className="">
        <Button className="btn-secondary btn-sm" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
