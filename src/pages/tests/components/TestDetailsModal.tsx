import { useGetTest } from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { Modal, Button, ListGroupItem, ListGroup } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaClipboardQuestion } from "react-icons/fa6";

interface TestModalDetailsProps {
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for viewing details on a test
 */
export function TestDetailsModal(props: TestModalDetailsProps) {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const { data } = useGetTest({
    id: props.id,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const testParams: string[] = data?.test_params
    ? data.test_params.split("|")
    : [];
  const testQuestions: string[] = data?.test_question
    ? data.test_question.split("|")
    : [];
  const testTips: string[] = data?.tool_tip ? data.tool_tip.split("|") : [];

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          <FaClipboardQuestion className="me-2" />
          {t("page_tests.view")}
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
        <hr />
        <h5>Parameters:</h5>
        <ListGroup>
          {data?.test_params?.split("|")?.map((item, index) => {
            return (
              <ListGroupItem key={item}>
                <div>
                  <strong className="me-2">Parameter:</strong>
                  <code>{testParams[index]}</code>
                </div>
                <div>
                  <strong className="me-2">Text:</strong>
                  {testParams[index] === "evidence"
                    ? testQuestions[index] ||
                      "Provide evidence of that via a URL to a page or to a documentation"
                    : testQuestions[index]}
                </div>
                <div>
                  <strong className="me-2">Tooltip:</strong>
                  {testParams[index] === "evidence"
                    ? testTips[index] ||
                      "A document, web page, or publication describing provisions"
                    : testTips[index]}
                </div>
              </ListGroupItem>
            );
          })}
        </ListGroup>
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
