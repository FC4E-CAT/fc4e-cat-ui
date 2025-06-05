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
  AssessmentPrinciple,
  AssessmentTest,
  AssessmentCriterionImperative,
  TestBinary,
  TestValue,
  TestBinaryParam,
  TestValueParam,
  TestAutoHttpsCheck,
  TestAutoMD1,
  TestAutoG069,
} from "@/types";
import {
  TestBinaryForm,
  TestValueForm,
} from "@/pages/assessments/components/tests";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { CriterionProgress } from "./CriterionProgress";
import { TestBinaryParamForm } from "./tests/TestBinaryParam";
import { TestValueFormParam } from "./tests/TestValueFormParam";
import { TestAutoHttpsCheckForm } from "./tests/TestAutoHttpsCheckForm";
import { useTranslation } from "react-i18next";
import { TestAutoMd1Form } from "./tests/TestAutoMd1Form";
import { TestAutoG069Form } from "./tests/TestAutoG069Form";
import { defaultG069tokenIntrospection, defaultG069userInfo } from "@/config";

type CriteriaTabsProps = {
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
  const navs: JSX.Element[] = [];
  const tabs: JSX.Element[] = [];
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

      // tests for each criterion
      const testList: JSX.Element[] = [];

      // store state of test results

      criterion.metric.tests &&
        criterion.metric.tests.forEach((test) => {
          if (test.type === "binary") {
            testList.push(
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
              </div>,
            );
          } else if (
            test.type === "Binary-Manual-Evidence" ||
            test.type === "Binary-Binary" ||
            test.type === "Binary-Manual"
          ) {
            testList.push(
              <div className="border rounded mt-4" key={test.id}>
                <div className="cat-test-div">
                  <TestBinaryParamForm
                    test={test as TestBinaryParam}
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
                  />
                </div>
              </div>,
            );
          } else if (test.type === "value") {
            testList.push(
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
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
                    onTestChange={props.onTestChange}
                    criterionId={criterion.id}
                    principleId={principle.id}
                  />
                </div>
              </div>,
            );
          }
        });

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
