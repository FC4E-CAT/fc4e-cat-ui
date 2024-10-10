import {
  useGetAllImperatives,
  useGetMotivationActorCriteria,
  useGetMotivationCriteria,
  useUpdateMotivationActorCriteria,
} from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { AlertInfo, Criterion, Imperative } from "@/types";
import { useState, useContext, useEffect, useRef } from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaInfo, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { FaStar, FaTrashCan } from "react-icons/fa6";
import {} from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";

export default function MotivationActorCriteria() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [imperatives, setImperatives] = useState<Map<string, Imperative>>(
    new Map(),
  );
  const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);

  const mutationUpdate = useUpdateMotivationActorCriteria(
    keycloak?.token || "",
    params.mtvId || "",
    params.actId || "",
  );

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const tooltipDeletePrinciple = (
    <Tooltip id="tip-restore">
      Delete this principle from the list of Principles for this actor.
    </Tooltip>
  );

  const {
    data: impData,
    fetchNextPage: impFetchNextPage,
    hasNextPage: impHasNextPage,
  } = useGetAllImperatives({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetMotivationCriteria(params.mtvId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: selCriData,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationActorCriteria(params.mtvId || "", params.actId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all imperatives in one dictionary
    const tmpImp: Map<string, Imperative> = new Map();
    // iterate over backend pages and gather all items in the imp dictionary, keyed by imp id
    if (impData?.pages) {
      impData.pages.map((page) => {
        page.content.forEach((item) => {
          tmpImp.set(item.id, item);
        });
      });
      if (impHasNextPage) {
        impFetchNextPage();
      }
    }
    setImperatives(tmpImp);
  }, [impData, impHasNextPage, impFetchNextPage]);

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

  function handleUpdateImperative(
    index: number,
    criImp: Imperative | undefined,
  ) {
    if (criImp === undefined) return;
    setSelectedCriteria((prevSelCriteria) =>
      prevSelCriteria.map((selCri, selCriIndx) =>
        selCriIndx === index
          ? {
              ...selCri,
              imperative: criImp,
            }
          : selCri,
      ),
    );
  }

  function handleUpdate() {
    if (selectedCriteria.length > 0) {
      const criImp = selectedCriteria.map((item) => ({
        criterion_id: item.id,
        imperative_id: item.imperative.id,
      }));
      const promise = mutationUpdate
        .mutateAsync(criImp)
        .catch((err) => {
          alert.current = {
            message: "Error during saving Assessment Type Criteria!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Assessment Type Criteria Saved!",
          };
          navigate(-1);
        });
      toast.promise(promise, {
        loading: "Saving Assessment Type Criteria...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  return (
    <div className="pb-4">
      <Row className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Manage Criteria
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                For Motivation:
                <strong className="badge bg-secondary mx-2">
                  {params.mtvId} {params.motivation}
                </strong>
                and Actor:
                <strong className="badge bg-secondary ms-2">
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
            <strong className="p-1">
              Available Criteria in this motivation{" "}
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {availableCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" /> Click an item below to add it to
              this assessment type...
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
                  <FaStar className="me-2" />
                  <strong>
                    {item.cri} - {item.label}
                  </strong>
                  <span className="ms-2 badge badge-sm bg-light text-success border border-success">
                    {item.imperative.label}
                  </span>
                </div>

                <div className="text-muted text-sm">{item.description}</div>
                <div>
                  {item.principles.map((principle) => (
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
              Criteria included in the Assessment Type
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
              {selectedCriteria?.map((item, index) => (
                <div key={item.cri} className="mb-4 p-2 cat-select-item">
                  <div className="d-inline-flex align-items-center">
                    <div>
                      <FaStar className="me-2" />
                      <strong>
                        {item.cri} - {item.label}
                      </strong>
                      <select
                        className="ms-2 badge badge-sm bg-light text-success border border-success"
                        value={item.imperative.id}
                        onChange={(e) => {
                          handleUpdateImperative(
                            index,
                            imperatives.get(e.target.value),
                          );
                        }}
                      >
                        {Array.from(imperatives.values()).map((impItem) => (
                          <option key={impItem.id} value={impItem.id}>
                            {impItem.label}
                          </option>
                        ))}
                      </select>
                      <OverlayTrigger
                        placement="top"
                        overlay={tooltipDeletePrinciple}
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-4"
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
                    {item.principles.map((principle) => (
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
            navigate(-1);
          }}
        >
          Back
        </Button>
        <Button
          variant="success"
          onClick={() => {
            handleUpdate();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
