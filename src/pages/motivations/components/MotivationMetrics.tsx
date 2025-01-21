import { AuthContext } from "@/auth";
import { MotivationMetric } from "@/types";
import { useContext, useEffect, useState } from "react";
import {
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import notavailImg from "@/assets/thumb_notavail.png";
import { FaBars, FaCog, FaPlus } from "react-icons/fa";
import { MotivationMetricModal } from "./MotivationMetricModal";
import { useGetAllMotivationMetrics } from "@/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MotivationMetricDetailsModal } from "./MotivationMetricDetailsModal";

interface MetricModalConfig {
  show: boolean;
  itemId: string;
}

export const MotivationMetrics = ({
  mtvId,
  published,
}: {
  mtvId: string;
  published: boolean;
}) => {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvMetrics, setMtvMetrics] = useState<MotivationMetric[]>([]);
  const [showCreateMetric, setShowCreateMetric] = useState(false);

  const [metricModal, setMetricModal] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
  });

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
      <MotivationMetricDetailsModal
        show={metricModal.show}
        onHide={() => {
          setMetricModal({ itemId: "", show: false });
        }}
        mtvId={mtvId}
        itemId={metricModal.itemId}
        getByCriterion={false}
      />
      <MotivationMetricModal
        show={showCreateMetric}
        mtvId={mtvId}
        onHide={() => {
          setShowCreateMetric(false);
        }}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          {t("page_motivations.list_of_metrics")}
          <p className="lead cat-view-lead">
            <span className="text-sm">
              {t("page_motivations.list_of_metrics_subtitle")}
            </span>
          </p>
        </h5>
        <div>
          {published ? (
            <span className="btn btn-warning disabled">
              <FaPlus className="me-2" />
              {t("page_motivations.create_metric")}
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
              {t("page_motivations.create_metric")}
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
                <Col xs="auto">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>
                        {t("page_motivations.tip_view_metric_tests")}
                      </Tooltip>
                    }
                  >
                    <Button
                      variant="light"
                      onClick={() => {
                        setMetricModal({ itemId: item.metric_id, show: true });
                      }}
                    >
                      <FaBars />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{t("page_motivations.assign_tests")}</Tooltip>
                    }
                  >
                    <Link
                      className="btn btn-light"
                      to={`/admin/motivations/${mtvId}/metrics-tests/${item.metric_id}`}
                    >
                      <FaCog />
                    </Link>
                  </OverlayTrigger>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};
