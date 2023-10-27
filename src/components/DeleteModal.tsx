import { Modal, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { FaTimes } from "react-icons/fa";

interface DeleteModalProps {
  title: string;
  message: string;
  itemId: string;
  itemName: string;
  show: boolean;
  onHide: () => void;
  onDelete: () => void;
}
/**
 * Implements a simple component that displays a modal (popup window) when
 * the user needs to confirm the deletion of an item. Modal accepts a list of
 * properties such as a title, message, itemId and itemName.
 * Also it accepts two callback functions: onHide (what to do when modal closes)
 * and onDelete (what to do when user clicks Confirm Delete button)
 */
export function DeleteModal(props: DeleteModalProps) {
  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-danger text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaTimes className="me-2" /> {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{props.message}</p>
        <ListGroup>
          <ListGroupItem>
            <strong>Name: </strong>
            {props.itemName}
          </ListGroupItem>
          <ListGroupItem>
            <strong>ID: </strong>
            {props.itemId}
          </ListGroupItem>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-danger me-4" onClick={props.onDelete}>
          Confirm Delete
        </Button>
        <Button className="btn-secondary" onClick={props.onHide}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
