import React from "react";
import { useTranslation } from "react-i18next";
import { TestInput, TestParam } from "@/types/tests";
import { EvidenceURLS, TestToolTip } from "@/pages/assessments/components";
import { TestBinaryParamForm } from "@/pages/assessments/components/tests/TestBinaryParam";
import {
  TestAutoG069,
  TestAutoHttpsCheck,
  TestAutoMD1,
  TestBinaryParam,
  TestValueParam,
} from "@/types";
import { defaultG069userInfo, defaultG069tokenIntrospection } from "@/config";
import { TestValueFormParam } from "@/pages/assessments/components/tests/TestValueFormParam";
import { TestAutoG069Form } from "@/pages/assessments/components/tests/TestAutoG069Form";
import { TestAutoHttpsCheckForm } from "@/pages/assessments/components/tests/TestAutoHttpsCheckForm";
import { TestAutoMd1Form } from "@/pages/assessments/components/tests/TestAutoMd1Form";

interface TestPreviewProps {
  test: TestInput;
  params: TestParam[];
  testMethodName?: string;
  hasEvidenceParam?: boolean;
}

const TestPreviewModal: React.FC<TestPreviewProps> = ({
  test,
  params,
  testMethodName,
  hasEvidenceParam,
}) => {
  const { t } = useTranslation();

  const testParams: JSX.Element[] = [];

  if (
    testMethodName === "Binary-Manual-Evidence" ||
    testMethodName === "Binary-Binary" ||
    testMethodName === "Binary-Manual"
  ) {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      description: test.description || "",
      type: testMethodName || "Binary-Manual",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      evidence_url: [],
    } as unknown as TestBinaryParam;

    testParams.push(
      <TestBinaryParamForm
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (
    testMethodName === "Number-Manual" ||
    testMethodName === "Number-Auto" ||
    testMethodName === "Ratio-Manual" ||
    testMethodName === "Percent-Manual" ||
    testMethodName === "TRL-Manual" ||
    testMethodName === "Years-Manual"
  ) {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Number-Manual",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      suffix: "",
      unit: "",
      min_value: 0,
      max_value: 100,
      default_value: 0,
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
    } as unknown as TestValueParam;

    testParams.push(
      <TestValueFormParam
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (testMethodName === "Auto-Check-String-Binary") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Auto-Check-String-Binary",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "g069",
    } as unknown as TestAutoG069;

    testParams.push(
      <TestAutoG069Form
        g069param=""
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (testMethodName === "Auto-Check-AARC-G069-User-Info") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Auto-Check-AARC-G069-User-Info",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "g069",
    } as unknown as TestAutoG069;

    testParams.push(
      <TestAutoG069Form
        g069param={defaultG069userInfo}
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (testMethodName === "Auto-Check-AARC-G069-Token-Introspection") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Auto-Check-AARC-G069-Token-Introspection",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "g069",
    } as unknown as TestAutoG069;

    testParams.push(
      <TestAutoG069Form
        g069param={defaultG069tokenIntrospection}
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (testMethodName === "Auto-Check-Url-Binary") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Auto-Check-Url-Binary",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "https",
    } as unknown as TestAutoHttpsCheck;

    testParams.push(
      <TestAutoHttpsCheckForm
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  } else if (
    testMethodName === "Auto-Check-Xml-MD1a" ||
    testMethodName === "Auto-Check-Xml-MD1b1" ||
    testMethodName === "Auto-Check-Xml-MD1b2"
  ) {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName || "Auto-Check-Xml-MD1a",
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "md1",
    } as unknown as TestAutoMD1;

    testParams.push(
      <TestAutoMd1Form
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId={""}
        principleId={""}
      />,
    );
  }

  return (
    <div className="border rounded cat-test-div">
      {testParams?.length > 0 ? (
        testParams
      ) : (
        <h5 className="text-muted">{t("No parameters defined yet")}</h5>
      )}
      {hasEvidenceParam && (
        <div className="mt-4 mb-2">
          <span className="fw-light-500 text-sm text-secondary">
            <strong>
              Can you provide public evidence of such a declaration?
            </strong>
            <span className="ms-2">
              <TestToolTip
                tipId="evidence-id"
                tipText="A document, web page, or publication describing the intention"
              />
            </span>
          </span>
          <EvidenceURLS urls={[]} onListChange={() => {}} noTitle={true} />
        </div>
      )}
    </div>
  );
};

export default TestPreviewModal;
