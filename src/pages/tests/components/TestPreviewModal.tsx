import { TestInput, TestParam } from "@/types/tests";
import { EvidenceURLS, TestToolTip } from "@/pages/assessments/components";
import { TestBinaryParamForm } from "@/pages/assessments/components/tests/TestBinaryParamForm";
import { FaTrash } from "react-icons/fa";
import {
  TestAutoG069,
  TestAutoHttpsCheck,
  TestAutoMD1,
  TestAutoValidation,
  TestBinaryParam,
  TestValueParam,
} from "@/types";
import { defaultG069userInfo, defaultG069tokenIntrospection } from "@/config";
import { TestValueFormParam } from "@/pages/assessments/components/tests/TestValueFormParam";
import { TestAutoG069Form } from "@/pages/assessments/components/tests/TestAutoG069Form";
import { TestAutoHttpsCheckForm } from "@/pages/assessments/components/tests/TestAutoHttpsCheckForm";
import { TestAutoMd1Form } from "@/pages/assessments/components/tests/TestAutoMd1Form";
import { TestAutoValidationForm } from "@/pages/assessments/components/tests/TestAutoValidationForm";
import styles from "@/pages/assessment-builder/AssessmentBuilder.module.css";
import { TestTRLForm } from "@/pages/assessments/components/tests/TestTRLForm";
import { TestPercentForm } from "@/pages/assessments/components/tests/TestPercentForm";
import { TestRatioForm } from "@/pages/assessments/components/tests/TestRatioForm";

interface TestPreviewProps {
  test: TestInput;
  params: TestParam[];
  testMethodName?: string;
  hasEvidenceParam?: boolean;
  onTestDelete?: () => void;
}

const TestPreviewModal = ({
  test,
  params,
  testMethodName,
  hasEvidenceParam,
  onTestDelete,
}: TestPreviewProps) => {
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
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  } else if (
    testMethodName === "Number-Manual" ||
    testMethodName === "Number-Auto" ||
    testMethodName === "Years-Manual"
  ) {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "TRL-Manual") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      description: test.description || "",
      type: testMethodName,
      text: params?.map((p) => p.text).join("|") || "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
    } as unknown as TestValueParam;

    testParams.push(
      <TestTRLForm
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Percent-Manual") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      description: test.description || "",
      type: testMethodName,
      text: params?.map((p) => p.text).join("|") || "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
    } as unknown as TestValueParam;

    testParams.push(
      <TestPercentForm
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Ratio-Manual") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      description: test.description || "",
      type: testMethodName,
      text: params?.map((p) => p.text).join("|") || "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
    } as unknown as TestValueParam;

    testParams.push(
      <TestRatioForm
        test={adaptedTest}
        onTestChange={() => {}}
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Auto-Check-String-Binary") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Fully-Automated-Validation") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
      text: params?.map((p) => p.text).join("|") || "",
      value: "",
      result: "",
      params: params?.map((p) => p.name).join("|") || "",
      evidence_url: [],
      tool_tip: params?.map((p) => p.tooltip).join("|") || "",
      auto_type: "g069",
    } as unknown as TestAutoValidation;
    testParams.push(
      <TestAutoValidationForm
        test={adaptedTest}
        onAutoGroupTestCall={() => {}}
      />,
    );
  } else if (testMethodName === "Auto-Check-AARC-G069-User-Info") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Auto-Check-AARC-G069-Token-Introspection") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  } else if (testMethodName === "Auto-Check-Url-Binary") {
    const adaptedTest = {
      id: test.tes || "",
      name: test.label || "",
      type: testMethodName,
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
        criterionId=""
        principleId=""
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
      type: testMethodName,
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
        criterionId=""
        principleId=""
      />,
    );
  }

  return (
    <>
      {testParams?.length > 0 ? (
        <div className="border rounded cat-test-div position-relative">
          {onTestDelete && (
            <span
              onClick={(e) => {
                e.stopPropagation();
                onTestDelete();
              }}
              style={{
                position: "absolute",
                top: "12px",
                right: "12px",
                cursor: "pointer",
              }}
            >
              <FaTrash className={styles["delete-icon"]} size="16px" />
            </span>
          )}
          {testParams}

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
      ) : null}
    </>
  );
};

export default TestPreviewModal;
