import { Modal, Button, ListGroup, ListGroupItem } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaTrash } from "react-icons/fa";

interface DeleteModalProps {
  title: string;
  message: string;
  itemId: string;
  itemName: string;
  show: boolean;
  onHide: () => void;
  handleDelete: () => void;
}
/**
 * Implements a simple component that displays a modal (popup window) when
 * the user needs to confirm the deletion of an item. Modal accepts a list of
 * properties such as a title, message, itemId and itemName.
 * Also it accepts two callback functions: onHide (what to do when modal closes)
 * and onDelete (what to do when user clicks Confirm Delete button)
 */
export function DeleteModal(props: DeleteModalProps) {
  const { t } = useTranslation();
  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-danger text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaTrash className="me-2" /> {props.title}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>{props.message}</p>
        <ListGroup>
          <ListGroupItem>
            <strong>{t("fields.name")}: </strong>
            {props.itemName}
          </ListGroupItem>
          <ListGroupItem>
            <strong>{t("fields.id")}: </strong>
            {props.itemId}
          </ListGroupItem>
        </ListGroup>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.cancel")}
        </Button>
        <Button className="btn-danger" onClick={props.handleDelete}>
          {t("buttons.confirm_delete")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
