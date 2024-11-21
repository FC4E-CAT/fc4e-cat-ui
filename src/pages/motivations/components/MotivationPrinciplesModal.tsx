import { Criterion, Principle } from "@/types";
import { useState, useEffect } from "react";
import {
  Button,
  Col,
  Row,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";

import { FaAward, FaMinusCircle, FaPlusCircle, FaTags } from "react-icons/fa";
import { FaTrashCan, FaTriangleExclamation } from "react-icons/fa6";

interface MotivationPrinciplesModalProps {
  criterion: Criterion | null;
  principles: Principle[];
  show: boolean;
  onHide: () => void;
  handleUpdatePrinciples: (criterionId: string, princples: Principle[]) => void;
}

export default function MotivationPrinciplesModal(
  props: MotivationPrinciplesModalProps,
) {
  const [availablePrinciples, setAvailablePrinciples] = useState<Principle[]>(
    [],
  );
  const [selectedPrinciples, setSelectedPrinciples] = useState<Principle[]>([]);

  useEffect(() => {
    const selIds = props.criterion?.principles
      ? props.criterion?.principles.map((item) => item.id)
      : [];
    setSelectedPrinciples(
      props.principles.filter((item) => selIds.includes(item.id)),
    );
    setAvailablePrinciples(
      props.principles.filter((item) => !selIds.includes(item.id)),
    );
  }, [props]);

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
          <FaTags className="me-2" /> Manage Principles
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.criterion && (
          <Row className="border-bottom pb-2">
            <div>
              <strong>
                <FaAward /> {props.criterion.cri} - {props.criterion.label}
              </strong>
            </div>
            <div>
              <small>{props.criterion.description}</small>
            </div>
          </Row>
        )}
        <Row className="mt-4  pb-4">
          <Col className="px-4">
            <div>
              <strong className="p-1">Available Principles</strong>
              <span className="ms-1 badge bg-primary rounded-pill fs-6">
                {availablePrinciples.length}
              </span>
            </div>
            <div className="alert alert-primary p-2 mt-1">
              {selectedPrinciples.length === 0 ? (
                <small>
                  <FaPlusCircle className="me-2" />
                  Click an item below to add it...
                </small>
              ) : (
                <small>
                  <FaTriangleExclamation className="me-2" />
                  You can only assign one item to the right
                </small>
              )}
            </div>
            <div
              className={`cat-vh-40 overflow-auto ${selectedPrinciples.length > 0 ? "text-muted" : ""}`}
            >
              {availablePrinciples?.map((item) => (
                <div
                  key={item.pri}
                  className="mb-4 p-2 cat-select-item"
                  onClick={() => {
                    if (selectedPrinciples.length == 0) {
                      setSelectedPrinciples([...selectedPrinciples, item]);
                      setAvailablePrinciples(
                        availablePrinciples.filter((pri) => pri.id != item.id),
                      );
                    }
                  }}
                >
                  <div className="d-inline-flex align-items-center">
                    <FaTags className="me-2" />
                    <strong>
                      {item.pri} - {item.label}
                    </strong>
                  </div>

                  <div className="text-muted text-sm">{item.description}</div>
                </div>
              ))}
            </div>
          </Col>
          <Col>
            <div>
              <strong className="p-1">
                Principles linked to this criterion
              </strong>
              <span className="badge bg-primary rounded-pill fs-6">
                {selectedPrinciples.length}
              </span>
            </div>
            <div className="alert alert-primary p-2 mt-1">
              <small>
                <FaMinusCircle className="me-2" /> Click an item below to remove
                it...
              </small>
            </div>
            <div>
              <div className="cat-vh-40 overflow-auto">
                {selectedPrinciples?.map((item) => (
                  <div key={item.pri} className="mb-4 p-2 cat-select-item">
                    <div className="d-inline-flex align-items-center">
                      <div>
                        <FaTags className="me-2" />
                        <strong>
                          {item.pri} - {item.label}
                        </strong>
                        <OverlayTrigger
                          placement="top"
                          overlay={<Tooltip>Delete Principle</Tooltip>}
                        >
                          <Button
                            size="sm"
                            variant="light"
                            className="ms-4"
                            onClick={() => {
                              setSelectedPrinciples(
                                selectedPrinciples.filter(
                                  (selItem) => selItem.id != item.id,
                                ),
                              );
                              setAvailablePrinciples([
                                ...availablePrinciples,
                                item,
                              ]);
                            }}
                          >
                            <FaTrashCan className="text-danger" />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </div>
                    <div className="text-muted text-sm">{item.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </Col>
        </Row>
        <Modal.Footer className="d-flex justify-content-between">
          <Button
            variant="secondary"
            onClick={() => {
              props.onHide();
              setSelectedPrinciples([]);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={() => {
              props.onHide();
              props.handleUpdatePrinciples(
                props.criterion?.id || "",
                selectedPrinciples,
              );
              setSelectedPrinciples([]);
            }}
          >
            Update
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}
