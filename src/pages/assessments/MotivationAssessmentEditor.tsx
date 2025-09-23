import { useGetMotivationAssessmentType } from "@/api";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { DebugJSON } from "./components/DebugJSON";
import { Alert, Col } from "react-bootstrap";
import { type Assessment } from "@/types";
import { FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import AssessmentBuilder from "../assessment-builder/AssessmentBuilder";

export const MotivationAssessmentEditor = () => {
  const { t } = useTranslation();
  // get actId and mtvId as routing parameters
  const params = useParams();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const { data, isLoading } = useGetMotivationAssessmentType(
    params.mtvId || "",
    params.actId || "",
    keycloak?.token || "",
    registered,
  );

  useEffect(() => {
    if (data) {
      setAssessment(data);
    }
  }, [data]);

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            {t("page_preview.title")}
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                {t("page_preview.motivation")}:{" "}
                <strong>{data?.assessment_type.name}</strong>
                <strong className="badge bg-light text-secondary mx-2 text-ms">
                  {params.mtvId}
                </strong>
                {t("page_preview.actor")}: <strong>{data?.actor.name}</strong>
                <strong className="badge bg-light text-secondary mx-2 text-ms">
                  {params.actId}
                </strong>
              </p>
            )}
          </h2>
        </Col>
      </div>
      {isLoading ? (
        <div>
          <Alert variant="light">{t("loading")}: ...</Alert>
        </div>
      ) : assessment ? (
        <div className="py-1">
          <AssessmentBuilder showTitle={false} />
          <DebugJSON assessment={assessment} />
        </div>
      ) : (
        <div>
          <Alert variant="warning">
            <FaExclamationTriangle />
            {t("page_preview.no_data")}: ...
          </Alert>
        </div>
      )}
    </div>
  );
};
