import { AuthContext } from "@/auth";
import { AlertInfo, Criterion, Principle } from "@/types";
import { useState, useContext, useEffect, useRef } from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  FaAward,
  FaExclamationTriangle,
  FaInfo,
  FaMinusCircle,
  FaPlusCircle,
  FaTags,
} from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";
import MotivationPrinciplesModal from "./components/MotivationPrinciplesModal";

import { relMtvPrincpleCriterion } from "@/config";
import {
  useGetAllCriteria,
  useGetAllPrinciples,
  useGetMotivationCriteria,
  useUpdateMotivationPrinciplesCriteria,
} from "@/api";

export default function MotivationCriteriaPrinciples() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
  const [availablePrinciples, setAvailablePrinciples] = useState<Principle[]>(
    [],
  );
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);
  const [targetCriterion, setTargetCriterion] = useState<Criterion | null>(
    null,
  );
  const [showManagePrinciples, setShowManagePrinciples] = useState(false);

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const {
    data: priData,
    fetchNextPage: priFetchNextPage,
    hasNextPage: priHasNextPage,
  } = useGetAllPrinciples({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all available principles in one array
    let tmpPri: Principle[] = [];

    // iterate over backend pages and gather all items in the pri array
    if (priData?.pages) {
      priData.pages.map((page) => {
        tmpPri = [...tmpPri, ...page.content];
      });
      if (priHasNextPage) {
        priFetchNextPage();
      }
    }
    setAvailablePrinciples(tmpPri);
  }, [priData, priHasNextPage, priFetchNextPage]);

  const mutationUpdate = useUpdateMotivationPrinciplesCriteria(
    keycloak?.token || "",
    params.mtvId || "",
  );

  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetAllCriteria({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: selCriData,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationCriteria(params.mtvId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all motivation actor criteria in one array
    let tmpSelCri: Criterion[] = [];

    // iterate over backend pages and gather all items in the mtv array
    if (selCriData?.pages) {
      selCriData.pages.map((page) => {
        tmpSelCri = [...tmpSelCri, ...page.content];
      });
      if (selCriHasNextPage) {
        selCriFetchNextPage();
      }
    }
    setSelectedCriteria(tmpSelCri);
  }, [selCriData, selCriHasNextPage, selCriFetchNextPage]);

  useEffect(() => {
    // gather all motivation criteria in one array
    let tmpCri: Criterion[] = [];

    const selCri =
      selectedCriteria.map((item) => {
        return item.cri;
      }) || [];

    // iterate over backend pages and gather all items in the mtv array
    if (criData?.pages) {
      criData.pages.map((page) => {
        tmpCri = [...tmpCri, ...page.content];
      });
      if (criHasNextPage) {
        criFetchNextPage();
      }
    }
    setAvailableCriteria(tmpCri.filter((item) => !selCri.includes(item.cri)));
  }, [criData, criHasNextPage, criFetchNextPage, selectedCriteria]);

  function handleUpdate() {
    if (selectedCriteria) {
      const priCri = selectedCriteria.flatMap((cri) =>
        cri.principles.map((pri) => ({
          criterion_id: cri.id,
          principle_id: pri.id,
          annotation_url: "",
          annotation_text: "",
          relation: relMtvPrincpleCriterion,
        })),
      );
      const promise = mutationUpdate
        .mutateAsync(priCri)
        .catch((err) => {
          alert.current = {
            message: "Error during saving Motivation Criteria & Principles!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Motivation Criteria & Principles Saved!",
          };
          navigate(`/motivations/${params.mtvId}`);
        });
      toast.promise(promise, {
        loading: "Saving Motivation Criteria & Principles...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  const handleUpdatePrinciples = (
    criterionId: string,
    principles: Principle[],
  ) => {
    setSelectedCriteria((prevSelCriteria) =>
      prevSelCriteria.map((criterion) =>
        criterion.id === criterionId
          ? { ...criterion, principles: principles }
          : criterion,
      ),
    );
  };

  const allPrinciplesSet = selectedCriteria.every(
    (item) => item.principles && item.principles.length > 0,
  );

  return (
    <div className="pb-4">
      <MotivationPrinciplesModal
        principles={availablePrinciples}
        criterion={targetCriterion}
        show={showManagePrinciples}
        onHide={() => {
          setShowManagePrinciples(false);
          setTargetCriterion(null);
        }}
        handleUpdatePrinciples={handleUpdatePrinciples}
      />
      <Row className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Manage Criteria
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                For Motivation:
                <strong className="badge bg-light text-secondary mx-2">
                  {params.mtvId}
                </strong>
                and Actor:
                <strong className="badge bg-light text-secondary ms-2">
                  {params.actId}
                </strong>
                <br />
                <span className="text-sm">
                  The desirable properties or outcome of a specific motivation
                  is usually expressed as a set of Criteria.These criteria serve
                  to verify that principles are adhered to or objectives are
                  met. Meeting criteria is considered to signal compliance with
                  a principle or alignment with/ support of the objective.
                </span>
              </p>
            )}
          </h2>
        </Col>
      </Row>
      <Row className=" border-bottom pb-2 bg-light">
        <Col className="mt-2 px-2">
          <FaInfo className="text-warning float-start" size={40} />
          <span className="text-sm">
            One of the basic characteristics of the assessment is to have
            criteria. The Criteria shall match the compliance of the specific
            actor <span className="">{params.actId}</span>
            <br />
            Please follow the steps in order to start filling up the assessment
            type.
          </span>
        </Col>
        <Col className="mt-2 px-2">
          <span className="text-sm">
            <ol>
              <li>Read and Select the Criteria for your actor</li>
              <li>Move the Criteria from left to the right list</li>
              <li>Update the imperative of the Criteria and click Save</li>
            </ol>
          </span>
        </Col>
      </Row>
      <Row className="mt-4  pb-4">
        <Col className="px-4">
          <div>
            <strong className="p-1">Available Criteria</strong>
            <span className="ms-1 badge bg-primary rounded-pill fs-6">
              {availableCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" /> Click an item below to add it to
              this Motivation...
            </small>
          </div>
          <div className="cat-vh-60 overflow-auto">
            {availableCriteria?.map((item) => (
              <div
                key={item.cri}
                className="mb-4 p-2 cat-select-item"
                onClick={() => {
                  setSelectedCriteria([...selectedCriteria, item]);
                }}
              >
                <div className="d-inline-flex align-items-center">
                  <FaAward className="me-2" />
                  <strong>
                    {item.cri} - {item.label}
                  </strong>
                  <span className="ms-2 badge badge-sm bg-light text-success border border-success">
                    {item.imperative.label}
                  </span>
                </div>

                <div className="text-muted text-sm">{item.description}</div>
                <div>
                  {item.principles &&
                    item.principles.map((principle) => (
                      <span
                        key={principle.id}
                        className="badge bg-light text-dark me-1 text-ms border"
                      >
                        {principle.pri} - {principle.label}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Col>
        <Col>
          <div>
            <strong className="p-1">
              Criteria included in this motivation
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {selectedCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaMinusCircle className="me-2" /> Click an item below to remove
              it from this assessment type...
            </small>
          </div>
          <div>
            <div className="cat-vh-60 overflow-auto">
              {selectedCriteria?.map((item) => (
                <div
                  key={item.cri}
                  className={`mb-4 p-2 cat-select-item ${!item.principles || item.principles.length === 0 ? "border rounded border-danger" : null}`}
                >
                  {(!item.principles || item.principles.length === 0) && (
                    <div className="text-danger mb-1">
                      <small>
                        <FaExclamationTriangle /> No principles defined! -
                        Please use the button below to manage them...
                      </small>
                    </div>
                  )}
                  <div className="d-inline-flex align-items-center">
                    <div>
                      <FaAward className="me-2" />
                      <strong>
                        {item.cri} - {item.label}
                      </strong>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Manage Principles</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-4"
                          onClick={() => {
                            setTargetCriterion(item);
                            setShowManagePrinciples(true);
                          }}
                        >
                          <FaTags className="text-dark" />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Delete Criterion</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-2"
                          onClick={() => {
                            setSelectedCriteria(
                              selectedCriteria.filter(
                                (selItem) => selItem.cri != item.cri,
                              ),
                            );
                          }}
                        >
                          <FaTrashCan className="text-danger" />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>

                  <div className="text-muted text-sm">{item.description}</div>
                  <div>
                    {item.principles &&
                      item.principles.map((principle) => (
                        <span
                          key={principle.pri}
                          className="badge bg-light text-dark me-1 text-ms border"
                        >
                          {principle.pri} - {principle.label}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <div className="d-flex justify-content-between">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(`/motivations/${params.mtvId}`);
          }}
        >
          Back
        </Button>
        <Button
          variant="success"
          onClick={() => {
            handleUpdate();
          }}
          disabled={!allPrinciplesSet}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
