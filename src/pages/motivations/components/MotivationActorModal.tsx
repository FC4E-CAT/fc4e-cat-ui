import {
  useGetRelations,
  useMotivationAddActor,
} from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { AlertInfo, MotivationActor, Relation } from "@/types";
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
import { FaInfoCircle, FaUser } from "react-icons/fa";

interface MotivationActorModalProps {
  motivationActors: MotivationActor[];
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for adding an actor to motivation
 */
export function MotivationActorModal(props: MotivationActorModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;

  const [actorId, setActorId] = useState("");
  const [relId, setRelId] = useState("");
  const [showErrors, setShowErrors] = useState(false);

  const [relations, setRelations] = useState<Relation[]>([]);

  const mutateCreate = useMotivationAddActor(
    keycloak?.token || "",
    props.id,
    actorId,
    relId,
  );

  function handleValidate() {
    setShowErrors(true);
    return actorId !== "" && relId !== "";
  }

  useEffect(() => {
    if (props.show) {
      {
        setActorId("");
        setRelId("");
      }

      setShowErrors(false);
    }
  }, [props.show]);

  const {
    data: relationData,
    fetchNextPage: relFetchNextPage,
    hasNextPage: relHasNextPage,
  } = useGetRelations({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all relations in one array
    let tmpRel: Relation[] = [];

    // iterate over backend pages and gather all items in the relations array
    if (relationData?.pages) {
      relationData.pages.map((page) => {
        tmpRel = [...tmpRel, ...page.content];
      });
      if (relHasNextPage) {
        relFetchNextPage();
      }
    }
    setRelations(tmpRel);
  }, [relationData, relHasNextPage, relFetchNextPage]);

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

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaUser className="me-2" /> Add Actor to Motivation
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      Select the type of actor
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-actor-type">
                    <FaInfoCircle className="me-2" /> Actor (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-actor-type"
                  aria-describedby="label-actor-type"
                  value={actorId ? actorId : ""}
                  onChange={(e) => {
                    setActorId(e.target.value);
                  }}
                >
                  <>
                    <option value="" disabled>
                      Select Actor type
                    </option>
                    {props.motivationActors.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && actorId === "" && (
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
                      Select the type of Relationship
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-rel-type">
                    <FaInfoCircle className="me-2" /> Relation (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-rel-type"
                  aria-describedby="label-rel-type"
                  value={relId ? relId : ""}
                  onChange={(e) => {
                    setRelId(e.target.value);
                  }}
                >
                  <>
                    <option value="" disabled>
                      Select Relationship type
                    </option>
                    {relations.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && relId === "" && (
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
