import {
  useCreateMotivation,
  useGetMotivationTypes,
  useUpdateMotivation,
} from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import {
  AlertInfo,
  Motivation,
  MotivationInput,
  MotivationType,
} from "@/types";
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
  Alert,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { FaFile, FaInfoCircle } from "react-icons/fa";
import { FaTriangleExclamation } from "react-icons/fa6";

interface MotivationModalProps {
  cloneId: string | null;
  cloneName: string;
  motivation: Motivation | null;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for creating/editing a motivation
 */
export function MotivationModal(props: MotivationModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;

  const [motivationInput, setMotivationInput] = useState<MotivationInput>({
    mtv: "",
    label: "",
    description: "",
    motivation_type_id: "",
    based_on: props.cloneId,
  });
  const [motivationTypes, setMotivationTypes] = useState<MotivationType[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const { data, fetchNextPage, hasNextPage } = useGetMotivationTypes({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  function handleValidate() {
    setShowErrors(true);
    return (
      motivationInput.mtv !== "" &&
      motivationInput.label !== "" &&
      motivationInput.description !== "" &&
      motivationInput.motivation_type_id !== ""
    );
  }

  const mutateCreate = useCreateMotivation(
    keycloak?.token || "",
    motivationInput,
  );

  const mutateUpdate = useUpdateMotivation(
    keycloak?.token || "",
    props.motivation?.id || "",
    motivationInput,
  );

  useEffect(() => {
    if (props.show) {
      if (props.motivation) {
        setMotivationInput({
          mtv: props.motivation.mtv,
          label: props.motivation.label,
          description: props.motivation.description,
          motivation_type_id: props.motivation.motivation_type_id || "",
          based_on: props.cloneId,
        });
      } else {
        setMotivationInput({
          mtv: "",
          label: "",
          description: "",
          motivation_type_id: "",
          based_on: props.cloneId,
        });
      }

      setShowErrors(false);
    }
  }, [props.show, props.motivation, props.cloneId]);

  useEffect(() => {
    // gather all actor/org/type mappings in one array
    let tmpMtt: MotivationType[] = [];

    // iterate over backend pages and gather all items in the actorMappings array
    if (data?.pages) {
      data.pages.map((page) => {
        tmpMtt = [...tmpMtt, ...page.content];
      });
      if (hasNextPage) {
        fetchNextPage();
      }
    }

    setMotivationTypes(tmpMtt);
  }, [data, hasNextPage, fetchNextPage]);

  // handle backend call to add a new motivation
  function handleCreate() {
    const promise = mutateCreate
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
          message: "Motivation Created!",
        };
      });
    toast.promise(promise, {
      loading: "Creating Motivation...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handle backend call to update an existing motivation
  function handleUpdate() {
    const promise = mutateUpdate
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
          message: "Motivation Updated!",
        };
      });
    toast.promise(promise, {
      loading: "Updating Motivation...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

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
          <FaFile className="me-2" />{" "}
          {props.motivation === null ? "Create new" : "Edit"} Motivation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          {props.cloneId && (
            <Alert variant="success">
              <FaTriangleExclamation /> The new motivation will be based on:{" "}
              <strong className="ms-2">{props.cloneName}</strong>{" "}
              <span className="badge bg-light ms-2 border">
                <code>{props.cloneId}</code>
              </span>
            </Alert>
          )}
          <Row>
            <Col xs={3}>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      Acronym to quickly distinguish the Motivation item
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-motivation-mtv">
                    <FaInfoCircle className="me-2" /> Mtv (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-motivation-mtv"
                  value={motivationInput.mtv}
                  onChange={(e) => {
                    setMotivationInput({
                      ...motivationInput,
                      mtv: e.target.value,
                    });
                  }}
                  aria-describedby="label-motivation-mtv"
                />
              </InputGroup>
              {showErrors && motivationInput.mtv === "" && (
                <span className="text-danger">Required</span>
              )}
            </Col>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      Label (Name) of the motivation item
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-motivation-label">
                    <FaInfoCircle className="me-2" /> Label (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-motivation-label"
                  aria-describedby="label-motivation-label"
                  value={motivationInput.label}
                  onChange={(e) => {
                    setMotivationInput({
                      ...motivationInput,
                      label: e.target.value,
                    });
                  }}
                />
              </InputGroup>
              {showErrors && motivationInput.label === "" && (
                <span className="text-danger">Required</span>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      Select the type of motivation
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-motivation-type">
                    <FaInfoCircle className="me-2" /> Type (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-motivation-type"
                  aria-describedby="label-motivation-type"
                  placeholder="Select a Motivation type"
                  value={
                    motivationInput.motivation_type_id
                      ? motivationInput.motivation_type_id
                      : ""
                  }
                  onChange={(e) => {
                    setMotivationInput({
                      ...motivationInput,
                      motivation_type_id: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      Select motivation type
                    </option>
                    {motivationTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && motivationInput.motivation_type_id === "" && (
                <span className="text-danger">Required</span>
              )}
              {motivationInput.motivation_type_id != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        motivationTypes.find(
                          (item) =>
                            item.id == motivationInput.motivation_type_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="mt-1">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    Short description of this motivation item
                  </Tooltip>
                }
              >
                <span id="label-motivation-description">
                  <FaInfoCircle className="ms-1 me-2" /> Description (*):
                </span>
              </OverlayTrigger>
              <Form.Control
                className="mt-1"
                as="textarea"
                rows={2}
                value={motivationInput.description}
                onChange={(e) => {
                  setMotivationInput({
                    ...motivationInput,
                    description: e.target.value,
                  });
                }}
              />
              {showErrors && motivationInput.description === "" && (
                <span className="text-danger">Required</span>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          Close
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              if (props.motivation === null) {
                handleCreate();
              } else {
                handleUpdate();
              }
            }
          }}
        >
          {props.motivation === null ? "Create" : "Update"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
