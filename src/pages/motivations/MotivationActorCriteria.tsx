import { useGetMotivationCriteria } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { Criterion } from "@/types";
import { useState, useContext, useEffect } from "react";
import { Button, Col, Row } from "react-bootstrap";
import { FaStar } from "react-icons/fa6";

import { useParams, useNavigate } from "react-router-dom";

export default function MotivationActorCriteria() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);
  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetMotivationCriteria(params.mtvId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

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

  return (
    <div className="pb-4">
      <div className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Manage Criteria
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                For Motivation:
                <strong className="badge bg-secondary mx-2">
                  {params.mtvId}
                </strong>
                and Actor:
                <strong className="badge bg-secondary ms-2">
                  {params.actId}
                </strong>
              </p>
            )}
          </h2>
        </Col>
      </div>
      <Row className="mt-4 border-bottom pb-4">
        <Col className="px-4">
          <p>Available Criteria in this motivation:</p>
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
                </div>

                <div className="text-muted">{item.description}</div>
                <div>
                  {item.principles.map((principle) => (
                    <span
                      key={principle.id}
                      className="badge bg-secondary bg-small me-1"
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
          <p>Criteria included in the Assessment Type:</p>
          <div>
            <div className="cat-vh-60 overflow-auto">
              {selectedCriteria?.map((item) => (
                <div
                  key={item.cri}
                  className="mb-4 p-2 cat-select-item"
                  onClick={() => {
                    setSelectedCriteria(
                      selectedCriteria.filter(
                        (selItem) => selItem.cri != item.cri,
                      ),
                    );
                  }}
                >
                  <div className="d-inline-flex align-items-center">
                    <FaStar className="me-2" />
                    <strong>
                      {item.cri} - {item.label}
                    </strong>
                  </div>

                  <div className="text-muted">{item.description}</div>
                  <div>
                    {item.principles.map((principle) => (
                      <span
                        key={principle.pri}
                        className="badge bg-secondary bg-small me-1"
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
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(-1);
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
