import { SearchBox } from "@/components/SearchBox";
import { Criterion, Principle } from "@/types";
import { useState, useEffect, useMemo } from "react";
import {
  Button,
  Col,
  Row,
  OverlayTrigger,
  Tooltip,
  Modal,
} from "react-bootstrap";
import { useTranslation } from "react-i18next";

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
  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const { t } = useTranslation();

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

  const filteredPrinciples = useMemo(() => {
    return availablePrinciples.filter((item) => {
      const query = searchInput.toLowerCase();
      return (
        item.pri.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [searchInput, availablePrinciples]);

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
          <FaTags className="me-2" />{" "}
          {t("page_motivations.modal_principles_title")}
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
              <strong className="p-1">
                {t("page_motivations.available_principles")}
              </strong>
              <span className="ms-1 badge bg-primary rounded-pill fs-6">
                {availablePrinciples.length}
              </span>
            </div>
            <div className="alert alert-primary p-2 mt-1">
              {selectedPrinciples.length === 0 ? (
                <small>
                  <FaPlusCircle className="me-2" />
                  {t("page_motivations.info_assign_principle")}
                </small>
              ) : (
                <small>
                  <FaTriangleExclamation className="me-2" />
                  {t("page_motivations.info_assign_one_principle")}
                </small>
              )}
            </div>
            <div>
              <SearchBox
                searchInput={searchInput}
                handleChange={handleSearchChange}
                handleClear={handleSearchClear}
              />
            </div>
            <div
              className={`cat-vh-40 overflow-auto ${selectedPrinciples.length > 0 ? "text-muted" : ""}`}
            >
              {filteredPrinciples?.map((item) => (
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
                {t("page_motivations.principles_in_criterion")}
              </strong>
              <span className="badge bg-primary rounded-pill fs-6">
                {selectedPrinciples.length}
              </span>
            </div>
            <div className="alert alert-primary p-2 mt-1">
              <small>
                <FaMinusCircle className="me-2" />{" "}
                {t("page_motivations.info_assign_principle")}
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
                          overlay={
                            <Tooltip>
                              {t("page_motivations.tip_remove_principle")}
                            </Tooltip>
                          }
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
            {t("buttons.cancel")}
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
            {t("buttons.update")}
          </Button>
        </Modal.Footer>
      </Modal.Body>
    </Modal>
  );
}
