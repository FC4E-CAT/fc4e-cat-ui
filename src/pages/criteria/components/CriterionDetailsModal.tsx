import { useGetCriterion } from "@/api";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { Modal, Button } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaAward } from "react-icons/fa";

interface CriDetailsModalProps {
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for viewing details on a criterion
 */
export function CriterionDetailsModal(props: CriDetailsModalProps) {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const { data } = useGetCriterion({
    id: props.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaAward className="me-2" />
          {t("page_criteria.view")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <h5>General Info:</h5>
          <div>
            <strong className="me-2">Id:</strong>
            {data?.id}
          </div>
          <div>
            <strong className="me-2">Label:</strong>
            {data?.label}
          </div>
          <div>
            <strong className="me-2">Description:</strong>
            {data?.description}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <div></div>
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
