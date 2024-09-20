import { useMotivationAddPrinciple } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { relMtvPrincipleId } from "@/config";
import { AlertInfo, Principle } from "@/types";
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
import { FaFile, FaInfoCircle } from "react-icons/fa";

interface MotivationPrincipleModalProps {
  motivationPrinciples: Principle[];
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for adding an actor to motivation
 */
export function MotivationPrincipleModal(props: MotivationPrincipleModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak } = useContext(AuthContext)!;

  const [prId, setPrId] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const mutateAddPrinciple = useMotivationAddPrinciple(
    keycloak?.token || "",
    props.id,
    prId,
    relMtvPrincipleId,
  );

  function handleValidate() {
    setShowErrors(true);
    return prId !== "" && prId !== "";
  }

  useEffect(() => {
    if (props.show) {
      {
        setPrId("");
      }
      setShowErrors(false);
    }
  }, [props.show]);

  // handle backend call to add a principle to the motivation
  function handleCreate() {
    const promise = mutateAddPrinciple
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: "Principle Added!",
        };
      });
    toast.promise(promise, {
      loading: "Adding Principle...",
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
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaFile className="me-2" /> Add Principle to Motivation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <InputGroup className="mt-2">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={<Tooltip id={`tooltip-top`}>Select Principle</Tooltip>}
              >
                <InputGroup.Text id="label-actor-type">
                  <FaInfoCircle className="me-2" /> Principle (*):
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Select
                id="input-actor-type"
                aria-describedby="label-actor-type"
                value={prId ? prId : ""}
                onChange={(e) => {
                  setPrId(e.target.value);
                }}
              >
                <>
                  <option value="" disabled>
                    Select Principle
                  </option>
                  {props.motivationPrinciples.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.pri} - {item.label}
                    </option>
                  ))}
                </>
              </Form.Select>
            </InputGroup>
            {showErrors && prId === "" && (
              <span className="text-danger">Required</span>
            )}
          </Col>
        </Row>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          Close
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              handleCreate();
            }
          }}
        >
          Create
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
