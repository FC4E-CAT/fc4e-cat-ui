import { useGetMotivationCriteria } from "@/api/services/motivations";
import { AuthContext } from "@/auth";
import { Criterion } from "@/types";
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
import { MotivationMetricDetailsModal } from "./MotivationMetricDetailsModal";
import { FaBars, FaBorderNone, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";
import { MotivationMetricAssignModal } from "./MotivationMetricAssignModal";
import { useTranslation } from "react-i18next";

interface MetricModalConfig {
  show: boolean;
  itemId: string;
}

export const MotivationCriteria = ({
  mtvId,
  published,
}: {
  mtvId: string;
  published: boolean;
}) => {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvCriteria, setMtvCriteria] = useState<Criterion[]>([]);

  const [metricModal, setMetricModal] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
  });

  const [metricAssignModal, setMetricAssignModal] = useState<MetricModalConfig>(
    {
      show: false,
      itemId: "",
    },
  );

  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetMotivationCriteria(mtvId, {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all criteria in one array
    let tmpCri: Criterion[] = [];

    // iterate over backend pages and gather all items in the criteria array
    if (criData?.pages) {
      criData.pages.map((page) => {
        tmpCri = [...tmpCri, ...page.content];
      });
      if (criHasNextPage) {
        criFetchNextPage();
      }
    }
    setMtvCriteria(tmpCri);
  }, [criData, criFetchNextPage, criHasNextPage]);

  return (
    <div className="px-5 mt-4">
      <MotivationMetricDetailsModal
        show={metricModal.show}
        onHide={() => {
          setMetricModal({ itemId: "", show: false });
        }}
        mtvId={mtvId}
        itemId={metricModal.itemId}
        getByCriterion
      />
      <MotivationMetricAssignModal
        show={metricAssignModal.show}
        onHide={() => {
          setMetricAssignModal({ itemId: "", show: false });
        }}
        mtvId={mtvId}
        criId={metricAssignModal.itemId}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          {t("page_motivations.criteria_list")}
          <p className="lead cat-view-lead">
            <span className="text-sm">
              {t("page_motivations.criteria_list_subtitle")}
            </span>
          </p>
        </h5>
        <div>
          {published ? (
            <span className="btn btn-warning disabled">
              <FaEdit className="me-2" />{" "}
              {t("page_motivations.manage_criteria")}
            </span>
          ) : (
            <Link
              id="manage-motivation-criteria-principles"
              to={`/admin/motivations/${mtvId}/manage-criteria-principles`}
              className="btn btn-warning"
            >
              <FaEdit className="me-2" />
              {t("page_motivations.manage_criteria")}
            </Link>
          )}
        </div>
      </div>
      <div>
        <ListGroup>
          {mtvCriteria.map((item) => (
            <ListGroupItem key={item.id}>
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
                        {item.cri}
                        {" - "}
                        {item.label}
                      </div>
                      <div className="text-xs text-gray-600 ng-star-inserted">
                        {item.description}
                      </div>
                    </div>
                  </div>
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
                </Col>
                <Col xs="auto">
                  <div className="d-flex flex-nowrap">
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {t("page_motivations.tip_assign_metric")}
                        </Tooltip>
                      }
                    >
                      <Button
                        className="btn btn-light btn-sm m-1"
                        onClick={() => {
                          setMetricAssignModal({ show: true, itemId: item.id });
                        }}
                      >
                        <FaBorderNone />
                      </Button>
                    </OverlayTrigger>
                    <OverlayTrigger
                      placement="top"
                      overlay={
                        <Tooltip>
                          {t("page_motivations.view_cri_metric_tests")}
                        </Tooltip>
                      }
                    >
                      <Button
                        className="btn btn-light btn-sm m-1"
                        onClick={() => {
                          setMetricModal({ show: true, itemId: item.id });
                        }}
                      >
                        <FaBars />
                      </Button>
                    </OverlayTrigger>
                  </div>
                </Col>
              </Row>
            </ListGroupItem>
          ))}
        </ListGroup>
      </div>
    </div>
  );
};
