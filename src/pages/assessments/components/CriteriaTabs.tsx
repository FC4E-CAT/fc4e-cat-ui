import {
  Col,
  ListGroup,
  Nav,
  OverlayTrigger,
  Row,
  Tab,
  Tooltip,
} from "react-bootstrap";
import {
  FaCableCar,
  FaShieldCat,
  FaHubspot,
  FaSliders,
  FaTape,
  FaArrowDownUpAcrossLine,
  FaReadme,
  FaConnectdevelop,
  FaParachuteBox,
  FaCubesStacked,
  FaChair,
  FaHeartPulse,
} from "react-icons/fa6";
import {
  type AssessmentPrinciple,
  type AssessmentTest,
  AssessmentCriterionImperative,
  type TestBinary,
  type TestValue,
  type TestBinaryParam,
  type TestValueParam,
  type TestAutoHttpsCheck,
  type TestAutoMD1,
  type TestAutoG069,
  type TestAutoValidation,
  type AutoGroupTest,
} from "@/types";
import {
  TestBinaryForm,
  TestValueForm,
} from "@/pages/assessments/components/tests";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { CriterionProgress } from "./CriterionProgress";
import { TestBinaryParamForm } from "./tests/TestBinaryParamForm";
import { TestValueFormParam } from "./tests/TestValueFormParam";
import { TestAutoHttpsCheckForm } from "./tests/TestAutoHttpsCheckForm";
import { useTranslation } from "react-i18next";
import { TestAutoMd1Form } from "./tests/TestAutoMd1Form";
import { TestAutoG069Form } from "./tests/TestAutoG069Form";
import { defaultG069tokenIntrospection, defaultG069userInfo } from "@/config";
import { TestAutoValidationForm } from "./tests/TestAutoValidationForm";
import { TestTRLForm } from "./tests/TestTRLForm";
import { TestRatioForm } from "./tests/TestRatioForm";
import { TestPercentForm } from "./tests/TestPercentForm";
import React from "react";

type CriteriaTabsProps = {
  autogroups: AutoGroupTest[] | undefined;
  onAutoTestGroup(autogroup: AutoGroupTest): void;
  principles: AssessmentPrinciple[];
  resetActiveTab: boolean;
  handleGuide(id: string, title: string, text: string): void;
  handleGuideClose(): void;
  onResetActiveTab(): void;
  onTestChange(
    principleId: string,
    criterionId: string,
    newTest: AssessmentTest,
  ): void;
};

/** CriteriaTabs holds the tabs and test content for different criteria */
export function CriteriaTabs(props: CriteriaTabsProps) {
  const navs: React.JSX.Element[] = [];
  const tabs: React.JSX.Element[] = [];
  const [activeKey, setActiveKey] = useState("");

  const { t } = useTranslation();

  useEffect(() => {
    // if resetActiveTab signal is set to true try to find the first criterion
    // and set it as an active tab
    if (
      props.resetActiveTab &&
      props.principles.length > 0 &&
      props.principles[0].criteria.length > 0
    ) {
      const firstCriterion =
        props.principles[0].id + props.principles[0].criteria[0].id;

      setActiveKey(firstCriterion);
      // when you set the active tab reset the signal to false
      props.onResetActiveTab();
    }
  }, [props]);

  props.principles.forEach((principle) => {
    navs.push(
      <div className="cat-menu-principal" key={principle.id}>
        <span className="cat-menu-principal-name">
          {principle.id === "P1" && (
            <FaCableCar className="met-2" color="green" width="2em" />
          )}
          {principle.id === "P2" && (
            <FaShieldCat className="met-2" color="green" width="2em" />
          )}
          {principle.id === "P3" && (
            <FaHubspot className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P4" && (
            <FaSliders className="met-2 " color="green" width="2em" />
          )}

          {principle.id === "P6" && (
            <FaArrowDownUpAcrossLine
              className="met-2 "
              color="green"
              width="2em"
            />
          )}
          {principle.id === "P7" && (
            <FaCubesStacked className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P8" && (
            <FaConnectdevelop className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P9" && (
            <FaParachuteBox className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P10" && (
            <FaChair className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P13" && (
            <FaTape className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P14" && (
            <FaReadme className="met-2 " color="green" width="2em" />
          )}
          {principle.id === "P15" && (
            <FaHeartPulse className="met-2 " color="red" width="2em" />
          )}
          <span className="px-2">
            {principle.id} - {principle.name}
          </span>
        </span>
      </div>,
    );
    principle.criteria.forEach((criterion) => {
      navs.push(
        <Nav.Item key={principle.id + criterion.id} className="cat-crit-tab">
          <Nav.Link
            eventKey={principle.id + criterion.id}
            className="p-0"
            onClick={() => {
              props.handleGuideClose();
            }}
          >
            <div className="cat-tab-inner p-3 ">
              <div className="d-flex">
                <h6
                  className={
                    criterion.imperative ===
                      AssessmentCriterionImperative.Must ||
                    criterion.imperative === AssessmentCriterionImperative.MUST
                      ? "fw-bold"
                      : ""
                  }
                >
                  {" "}
                  {criterion.id} - {criterion.name}
                  {criterion.metric.result === 0 && (
                    <FaTimesCircle className="ms-2 text-danger" />
                  )}
                  {criterion.metric.result === 1 && (
                    <FaCheckCircle className="ms-2 text-success" />
                  )}
                </h6>
                {(criterion.imperative === AssessmentCriterionImperative.Must ||
                  criterion.imperative ===
                    AssessmentCriterionImperative.MUST) && (
                  <div>
                    <small
                      style={{ fontSize: "0.6rem" }}
                      className="ms-2 badge mb-2 rounded-pill text-bg-light text-secondary border align-middle"
                    >
                      {t("required")}
                    </small>
                  </div>
                )}
              </div>
            </div>
          </Nav.Link>
        </Nav.Item>,
      );

      // store state of test results

      const testList: React.JSX.Element[] =
        criterion.metric.tests?.flatMap((test) => {
          switch (test.type) {
            case "binary":
              return (
                <div className="border rounded mt-4" key={test.id}>
                  <div className="cat-test-div">
                    <TestBinaryForm
                      test={test as TestBinary}
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
                      handleGuide={props.handleGuide}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
                      handleGuide={props.handleGuide}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
                    />
                  </div>
                </div>
              );
            case "Fully-Automated-Validation":
              return (
                <div className="border mt-4" key={test.id}>
                  <div className="cat-test-div">
                    <TestAutoValidationForm
                      autogroup={props.autogroups?.find(
                        (item) => item.test_method === test.type,
                      )}
                      test={test as TestAutoValidation}
                      onAutoGroupTestCall={props.onAutoTestGroup}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
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
                      onTestChange={props.onTestChange}
                      criterionId={criterion.id}
                      principleId={principle.id}
                    />
                  </div>
                </div>
              );
            default:
              return [];
          }
        }) ?? [];

      // add criterion content
      tabs.push(
        <Tab.Pane
          key={principle.id + criterion.id}
          className="text-dark"
          eventKey={principle.id + criterion.id}
        >
          {/* add a principle info box before criterion content */}

          <div className="p-4">
            <div className="d-flex justify-content-end">
              <CriterionProgress metric={criterion.metric} />
            </div>
            <div>
              <div className="">
                <span className="h4 align-middle">
                  {criterion.id}: {criterion.name}
                </span>

                {criterion.imperative === AssessmentCriterionImperative.Must ||
                criterion.imperative === AssessmentCriterionImperative.MUST ? (
                  <span className="badge bg-success bg-small ms-4 align-middle">
                    {t("required")}
                  </span>
                ) : (
                  <span className="badge bg-warning bg-small ms-4 align-middle">
                    {t("optional")}
                  </span>
                )}
                <p className="text-muted lh-sm mt-2 mb-2">
                  {criterion.description}
                </p>
                <div className="cat-view-heading">
                  <span className="align-middle">
                    {t("page_assessment_edit.part_of_principle")} {principle.id}
                    : {principle.name}{" "}
                  </span>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip id={`tip-pri-${principle.id}`}>
                        {principle.description}
                      </Tooltip>
                    }
                  >
                    <span>
                      <FaInfoCircle className="text-secondary opacity-50 align-middle" />
                    </span>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
            <ListGroup className="mb-4">{testList}</ListGroup>
          </div>
        </Tab.Pane>,
      );
    });
  });

  return (
    <Tab.Container
      id="left-tabs"
      activeKey={activeKey}
      onSelect={(key) => setActiveKey(key || "")}
    >
      <Row className="border p-0">
        <Col sm={4} className="cat-crit-sidebar p-0">
          <div className="cat-viewport-scroll cat-view-reverse">
            <div className="cat-view-reverse-reverse">
              <Nav className="flex-column cat-asmt-nav">{navs}</Nav>
            </div>
          </div>
        </Col>
        <Col sm={8}>
          <div className="cat-viewport-scroll">
            <Tab.Content>{tabs}</Tab.Content>
          </div>
        </Col>
      </Row>
    </Tab.Container>
  );
}
