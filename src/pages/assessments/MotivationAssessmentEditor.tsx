import { useGetMotivationAssessmentType } from "@/api";
import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { DebugJSON } from "./components/DebugJSON";
import { CriteriaTabs } from "./components";
import { Alert, Button, Col } from "react-bootstrap";
import {
  Assessment,
  AssessmentCriterion,
  AssessmentCriterionImperative,
  AssessmentTest,
} from "@/types";
import { evalAssessment, evalMetric } from "@/utils";
import { AssessmentEvalStats } from "./components/AssessmentEvalStats";
import { FaExclamationTriangle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

export const MotivationAssessmentEditor = () => {
  const { t } = useTranslation();
  // get actId and mtvId as routing parameters
  const params = useParams();
  const [resetCriterionTab, setResetCriterionTab] = useState(false);
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const { data, isLoading } = useGetMotivationAssessmentType(
    params.mtvId || "",
    params.actId || "",
    keycloak?.token || "",
    registered,
  );

  const navigate = useNavigate();

  function handleResetCriterionTabComplete() {
    setResetCriterionTab(false);
  }

  function handleCriterionChange(
    principleID: string,
    criterionID: string,
    newTest: AssessmentTest,
  ) {
    // update criterion change
    const mandatory: (number | null)[] = [];
    const optional: (number | null)[] = [];

    if (assessment) {
      const newPrinciples = assessment?.principles.map((principle) => {
        if (principle.id === principleID) {
          const newCriteria = principle.criteria.map((criterion) => {
            let resultCriterion: AssessmentCriterion;
            if (criterion.id === criterionID) {
              const newTests = criterion.metric.tests.map((test) => {
                if (test.id === newTest.id) {
                  return newTest;
                }
                return test;
              });
              let newMetric = { ...criterion.metric, tests: newTests };
              const { result, value } = evalMetric(newMetric);
              newMetric = { ...newMetric, result: result, value: value };
              // create a new criterion object with updates due to changes
              resultCriterion = { ...criterion, metric: newMetric };
            } else {
              // use the old object with no changes
              resultCriterion = criterion;
            }

            return resultCriterion;
          });

          return { ...principle, criteria: newCriteria };
        }
        return principle;
      });

      let compliance: boolean | null;

      const newAssessment = {
        ...assessment,
        principles: newPrinciples,
      };
      // update criteria result reference tables

      newAssessment.principles.forEach((principle) => {
        principle.criteria.forEach((criterion) => {
          if (
            criterion.imperative === AssessmentCriterionImperative.Must ||
            criterion.imperative === AssessmentCriterionImperative.MUST
          ) {
            mandatory.push(criterion.metric.result);
          } else {
            optional.push(criterion.metric.result);
          }
        });
      });

      if (mandatory.some((result) => result === null)) {
        compliance = null;
      } else {
        compliance = mandatory.every((result) => result === 1);
      }

      const ranking: number | null = optional.reduce((sum, result) => {
        if (sum === null || result === null) return null;
        return sum + result;
      }, 0);

      setAssessment({
        ...newAssessment,
        result: { compliance: compliance, ranking: ranking },
      });
    }
  }

  useEffect(() => {
    if (data) {
      setAssessment(data);
      setResetCriterionTab(true);
    }
  }, [data]);

  const evalResult = evalAssessment(assessment);

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
        <div className="p-4">
          {evalResult && assessment?.result && (
            <AssessmentEvalStats
              evalResult={evalResult}
              assessmentResult={assessment.result}
            />
          )}
          <div className="row bg-secondary" style={{ height: "1px" }}></div>
          <CriteriaTabs
            principles={assessment.principles || []}
            resetActiveTab={resetCriterionTab}
            onTestChange={handleCriterionChange}
            onResetActiveTab={handleResetCriterionTabComplete}
            handleGuide={() => {}}
            handleGuideClose={() => {}}
          />
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
      <Button
        variant="secondary"
        onClick={() => {
          navigate(-1);
        }}
      >
        {t("buttons.back")}
      </Button>
    </div>
  );
};
