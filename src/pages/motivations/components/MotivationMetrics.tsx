import { AuthContext } from "@/auth";
import { MotivationMetric } from "@/types";
import { useContext, useEffect, useState } from "react";
import { Button, Col, ListGroup, ListGroupItem, Row } from "react-bootstrap";
import notavailImg from "@/assets/thumb_notavail.png";
import { FaPlus } from "react-icons/fa";
import { MotivationMetricModal } from "./MotivationMetricModal";
import { useGetAllMotivationMetrics } from "@/api";

export const MotivationMetrics = ({
  mtvId,
  published,
}: {
  mtvId: string;
  published: boolean;
}) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvMetrics, setMtvMetrics] = useState<MotivationMetric[]>([]);
  const [showCreateMetric, setShowCreateMetric] = useState(false);

  const {
    data: mtrData,
    fetchNextPage: mtrFetchNextPage,
    hasNextPage: mtrHasNextPage,
  } = useGetAllMotivationMetrics(mtvId, {
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all mtv metrics in one array
    let tmpMtr: MotivationMetric[] = [];

    // iterate over backend pages and gather all items in the motivation metrics array
    if (mtrData?.pages) {
      mtrData.pages.map((page) => {
        tmpMtr = [...tmpMtr, ...page.content];
      });
      if (mtrHasNextPage) {
        mtrFetchNextPage();
      }
    }
    setMtvMetrics(tmpMtr);
  }, [mtrData, mtrHasNextPage, mtrFetchNextPage]);

  return (
    <div className="px-5 mt-4">
      <MotivationMetricModal
        show={showCreateMetric}
        mtvId={mtvId}
        onHide={() => {
          setShowCreateMetric(false);
        }}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          List of Metrics
          <p className="lead cat-view-lead">
            <span className="text-sm">
              Metrics group tests and aggregate their results
            </span>
          </p>
        </h5>
        <div>
          {published ? (
            <span className="btn btn-warning disabled">
              <FaPlus className="me-2" />
              Create Metric
            </span>
          ) : (
            <Button
              variant="warning"
              onClick={() => {
                setShowCreateMetric(true);
              }}
              disabled={published}
            >
              <FaPlus className="me-2" />
              Create Metric
            </Button>
          )}
        </div>
      </div>
      <div>
        <ListGroup>
          {mtvMetrics.map((item) => (
            <ListGroupItem key={item.metric_id}>
              <Row>
                <Col>
                  <div className="flex items-center ng-star-inserted">
                    <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                      <img
                        src={notavailImg}
                        className="text-center m-1 rounded-full"
                        width="60%"
                      />
                    </div>
                    <div>
                      <div className="flex text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                        {item.metric_label}
                      </div>
                      <div className="text-xs text-gray-600 ng-star-inserted">
                        {item.metric_description}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs="auto">{/* Actions will be plaed here */}</Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};
