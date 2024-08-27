import { useGetAssessmentShares, useShareAssessment } from "@/api";
import { AuthContext } from "@/auth";
import { AlertInfo } from "@/types";
import { useContext, useRef, useState } from "react";
import { Modal, Button, ListGroup, Form, InputGroup } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaShare, FaUserAlt } from "react-icons/fa";

interface ShareModalProps {
  name: string;
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for adding shares (share assessment to other users)
 */
export function ShareModal(props: ShareModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;

  const qShares = useGetAssessmentShares({
    id: props.id,
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });
  const mutateShare = useShareAssessment(keycloak?.token || "", props.id);
  const [email, setEmail] = useState("");

  function handleShare() {
    const promise = mutateShare
      .mutateAsync({
        shared_with_user: email,
      })
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        setEmail("");
        alert.current = {
          message: "Succesfully shared with: " + email,
        };
      });
    toast.promise(promise, {
      loading: "Sharing...",
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
          <FaShare className="me-2" /> Share assessment
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <ListGroup>
          <ListGroup.Item>
            <strong>Name: </strong>
            {props.name}
          </ListGroup.Item>
          <ListGroup.Item>
            <strong>ID: </strong>
            {props.id}
          </ListGroup.Item>
        </ListGroup>

        <div className="mt-2 bg-light p-3 rounded border">
          <InputGroup>
            <InputGroup.Text id="label-share-user">Share with:</InputGroup.Text>
            <Form.Control
              id="input-share-user"
              placeholder="Enter user's email to share the assessment with"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
              aria-describedby="label-share-user"
            />
            <Button
              disabled={email.length == 0}
              onClick={() => {
                handleShare();
              }}
            >
              Confirm
            </Button>
          </InputGroup>
          {qShares.data && (
            <div className="mt-2">
              <small>
                Already Shared with:
                <ListGroup>
                  {qShares.data.shared_users.map((item) => (
                    <ListGroup.Item key={item.id}>
                      <FaUserAlt className="me-2" /> {item.name} {item.surname}{" "}
                      ({item.email})
                    </ListGroup.Item>
                  ))}
                </ListGroup>
              </small>
            </div>
          )}
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
  );
}