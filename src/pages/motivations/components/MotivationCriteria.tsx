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
import { MotivationCriMetricModal } from "./MotivationCriMetricModal";
import { FaBars, FaEdit } from "react-icons/fa";
import { Link } from "react-router-dom";

interface MetricModalConfig {
  show: boolean;
  criId: string;
}

export const MotivationCriteria = ({ mtvId }: { mtvId: string }) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvCriteria, setMtvCriteria] = useState<Criterion[]>([]);

  const [metricModal, setMetricModal] = useState<MetricModalConfig>({
    show: false,
    criId: "",
  });

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
      <MotivationCriMetricModal
        show={metricModal.show}
        onHide={() => {
          setMetricModal({ criId: "", show: false });
        }}
        mtvId={mtvId}
        criId={metricModal.criId}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          List of criteria
          <p className="lead cat-view-lead">
            <span className="text-sm">
              Criteria related with principles under motivation
            </span>
          </p>
        </h5>
        <div>
          <Link
            id="manage-motivation-criteria-principles"
            to={`/admin/motivations/${mtvId}/manage-criteria-principles`}
            className="btn btn-warning mt-4"
          >
            <FaEdit className="me-2" />
            Manage Criteria
          </Link>
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
                  <OverlayTrigger
                    placement="top"
                    overlay={<Tooltip>View Criterion Metric/Tests</Tooltip>}
                  >
                    <Button
                      className="btn btn-light btn-sm m-1"
                      onClick={() => {
                        setMetricModal({ show: true, criId: item.id });
                      }}
                    >
                      <FaBars />
                    </Button>
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
