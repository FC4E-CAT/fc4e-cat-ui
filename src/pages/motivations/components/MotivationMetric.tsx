import { useGetMotivationMetric } from "@/api";
import { AuthContext } from "@/auth";
import { defaultG069tokenIntrospection, defaultG069userInfo } from "@/config";
import { TestBinaryForm, TestValueForm } from "@/pages/assessments/components";
import { TestAutoG069Form } from "@/pages/assessments/components/tests/TestAutoG069Form";
import { TestAutoHttpsCheckForm } from "@/pages/assessments/components/tests/TestAutoHttpsCheckForm";
import { TestAutoMd1Form } from "@/pages/assessments/components/tests/TestAutoMd1Form";
import { TestAutoValidationForm } from "@/pages/assessments/components/tests/TestAutoValidationForm";
import { TestBinaryParamForm } from "@/pages/assessments/components/tests/TestBinaryParamForm";
import { TestPercentForm } from "@/pages/assessments/components/tests/TestPercentForm";
import { TestRatioForm } from "@/pages/assessments/components/tests/TestRatioForm";
import { TestTRLForm } from "@/pages/assessments/components/tests/TestTRLForm";
import { TestValueFormParam } from "@/pages/assessments/components/tests/TestValueFormParam";
import type {
  TestAutoG069,
  TestAutoHttpsCheck,
  TestAutoMD1,
  TestAutoValidation,
  TestBinary,
  TestBinaryParam,
  TestValue,
  TestValueParam,
} from "@/types";
import React from "react";
import { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function MotivationMetric({
  mtvId,
  itemId,
  getByCriterion,
  metricMetadata,
}: {
  mtvId: string;
  itemId: string;
  getByCriterion: boolean;
  metricMetadata?: {
    id: string;
    name: string;
    label_algorithm_type: string;
    label_type_metric: string;
    benchmark_value: string;
  };
}) {
  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const { data: metricData } = useGetMotivationMetric({
    mtvId: mtvId,
    itemId: itemId,
    token: keycloak?.token || "",
    getByCriterion: getByCriterion,
  });

  const testList: React.JSX.Element[] =
    metricData?.metric.tests?.flatMap(
      (
        test:
          | TestBinary
          | TestValue
          | TestBinaryParam
          | TestValueParam
          | TestAutoHttpsCheck
          | TestAutoMD1
          | TestAutoG069
          | TestAutoValidation,
      ) => {
        switch (test.type) {
          case "binary":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestBinaryForm
                    test={test as TestBinary}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                    handleGuide={() => {}}
                  />
                </div>
              </div>
            );
          case "Binary-Manual-Evidence":
          case "Binary-Binary":
          case "Binary-Manual":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestBinaryParamForm
                    test={test as TestBinaryParam}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "value":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestValueForm
                    test={test as TestValue}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                    handleGuide={() => {}}
                  />
                </div>
              </div>
            );
          case "Number-Manual":
          case "Number-Auto":
          case "Years-Manual":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestValueFormParam
                    test={test as TestValueParam}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "TRL-Manual":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestTRLForm
                    test={test as TestValueParam}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Percent-Manual":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestPercentForm
                    test={test as TestValueParam}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Ratio-Manual":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestRatioForm
                    test={test as TestValueParam}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Auto-Check-Url-Binary":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoHttpsCheckForm
                    test={test as TestAutoHttpsCheck}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Auto-Check-String-Binary":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoG069Form
                    g069param=""
                    test={test as TestAutoG069}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Fully-Automated-Validation":
            return (
              <div className="border mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoValidationForm
                    autogroup={undefined}
                    test={test as TestAutoValidation}
                    onAutoGroupTestCall={() => {}}
                  />
                </div>
              </div>
            );
          case "Auto-Check-AARC-G069-User-Info":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoG069Form
                    g069param={defaultG069userInfo}
                    test={test as TestAutoG069}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Auto-Check-AARC-G069-Token-Introspection":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoG069Form
                    g069param={defaultG069tokenIntrospection}
                    test={test as TestAutoG069}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          case "Auto-Check-Xml-MD1a":
          case "Auto-Check-Xml-MD1b1":
          case "Auto-Check-Xml-MD1b2":
            return (
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestAutoMd1Form
                    test={test as TestAutoMD1}
                    onTestChange={() => {}}
                    criterionId={getByCriterion ? itemId : ""}
                    principleId={""}
                  />
                </div>
              </div>
            );
          default:
            return [];
        }
      },
    ) ?? [];

  const metricDetails = metricData?.metric
    ? {
        id: metricData.metric.id,
        name: metricData.metric.name,
        label_type_metric: metricData.metric.label_type_metric,
        label_algorithm_type: metricData.metric.label_algorithm_type,
        benchmark_value: metricData.metric.benchmark_value,
      }
    : metricMetadata;

  return (
    <div className="pb-4">
      <div className="p-2 rounded border">
        <Row>
          <Col>
            <div>
              <strong className="me-2">{t("fields.id")}:</strong>
              <span>{metricDetails?.id || ""}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.name")}:</strong>
              <span>{metricDetails?.name || ""}</span>
            </div>
          </Col>
          <Col>
            <div>
              <strong className="me-2">{t("fields.type")}:</strong>
              <span>{metricDetails?.label_type_metric || ""}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.algorithm")}:</strong>
              <span>{metricDetails?.label_algorithm_type || ""}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.benchmark")}:</strong>
              <span>{metricDetails?.benchmark_value || ""}</span>
            </div>
          </Col>
        </Row>
        <div className="border-top mt-1">
          <h5 className="mt-3">
            <strong>
              {t("fields.tests")}:
              <span className="badge bg-primary ms-2">
                {metricData?.metric?.tests?.length || "0"}
              </span>
            </strong>
          </h5>
          <>{testList}</>
        </div>
      </div>
    </div>
  );
}
