import { useGetMotivationMetric } from "@/api";
import { AuthContext } from "@/auth";
import { defaultG069tokenIntrospection, defaultG069userInfo } from "@/config";
import { TestAutoG069Form } from "@/pages/assessments/components/tests/TestAutoG069Form";
import { TestAutoHttpsCheckForm } from "@/pages/assessments/components/tests/TestAutoHttpsCheckForm";
import { TestAutoMd1Form } from "@/pages/assessments/components/tests/TestAutoMd1Form";
import { TestBinaryParamForm } from "@/pages/assessments/components/tests/TestBinaryParam";
import { TestValueFormParam } from "@/pages/assessments/components/tests/TestValueFormParam";
import {
  TestAutoG069,
  TestAutoHttpsCheck,
  TestAutoMD1,
  TestBinaryParam,
  TestValueParam,
} from "@/types";
import { useContext } from "react";
import { Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

export default function MotivationMetric({
  mtvId,
  itemId,
  getByCriterion,
}: {
  mtvId: string;
  itemId: string;
  getByCriterion: boolean;
}) {
  const { keycloak } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const { data: metricData } = useGetMotivationMetric({
    mtvId: mtvId,
    itemId: itemId,
    token: keycloak?.token || "",
    getByCriterion: getByCriterion,
  });

  const testList: JSX.Element[] = [];

  metricData?.metric?.tests &&
    metricData.metric.tests.forEach((test) => {
      if (
        test.type === "Binary-Manual-Evidence" ||
        test.type === "Binary-Binary" ||
        test.type === "Binary-Manual"
      ) {
        testList.push(
          <div className="border rounded-lg mt-4" key={test.id}>
            <div className="cat-test-div">
              <TestBinaryParamForm
                test={test as TestBinaryParam}
                onTestChange={() => {}}
                criterionId={getByCriterion ? itemId : ""}
                principleId={""}
              />
            </div>
          </div>,
        );
      } else if (
        test.type === "Number-Manual" ||
        test.type === "Number-Auto" ||
        test.type === "Ratio-Manual" ||
        test.type === "Percent-Manual" ||
        test.type === "TRL-Manual" ||
        test.type === "Years-Manual"
      ) {
        testList.push(
          <div className="border rounded mt-4" key={test.id}>
            <div className="cat-test-div">
              <TestValueFormParam
                test={test as TestValueParam}
                onTestChange={() => {}}
                criterionId={getByCriterion ? itemId : ""}
                principleId={""}
              />
            </div>
          </div>,
        );
      } else if (test.type === "Auto-Check-String-Binary") {
        testList.push(
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
          </div>,
        );
      } else if (test.type === "Auto-Check-AARC-G069-User-Info") {
        testList.push(
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
          </div>,
        );
      } else if (test.type === "Auto-Check-AARC-G069-Token-Introspection") {
        testList.push(
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
          </div>,
        );
      } else if (test.type === "Auto-Check-Url-Binary") {
        testList.push(
          <div className="border rounded mt-4" key={test.id}>
            <div className="cat-test-div">
              <TestAutoHttpsCheckForm
                test={test as TestAutoHttpsCheck}
                onTestChange={() => {}}
                criterionId={getByCriterion ? itemId : ""}
                principleId={""}
              />
            </div>
          </div>,
        );
      } else if (
        test.type === "Auto-Check-Xml-MD1a" ||
        test.type === "Auto-Check-Xml-MD1b1" ||
        test.type === "Auto-Check-Xml-MD1b2"
      ) {
        testList.push(
          <div className="border rounded mt-4" key={test.id}>
            <div className="cat-test-div">
              <TestAutoMd1Form
                test={test as TestAutoMD1}
                onTestChange={() => {}}
                criterionId={getByCriterion ? itemId : ""}
                principleId={""}
              />
            </div>
          </div>,
        );
      }
    });

  return (
    <div className="pb-4">
      <div className="p-2 rounded border">
        <Row>
          <Col>
            <div>
              <strong className="me-2">{t("fields.id")}:</strong>
              <span>{metricData?.metric?.id}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.name")}:</strong>
              <span>{metricData?.metric?.name}</span>
            </div>
          </Col>
          <Col>
            <div>
              <strong className="me-2">{t("fields.type")}:</strong>
              <span>{metricData?.metric?.label_type_metric}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.algorithm")}:</strong>
              <span>{metricData?.metric?.label_algorithm_type}</span>
            </div>
            <div>
              <strong className="me-2">{t("fields.benchmark")}:</strong>
              <span>{metricData?.metric?.benchmark_value}</span>
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
