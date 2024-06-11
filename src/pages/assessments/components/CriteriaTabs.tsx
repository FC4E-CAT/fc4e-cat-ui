import {
  // Alert,
  Col,
  ListGroup,
  Nav,
  // OverlayTrigger,
  Row,
  Tab,
  // Tooltip,
} from "react-bootstrap";
import {
  AssessmentTest,
  CriterionImperative,
  // MetricAlgorithm,
  Principle,
} from "@/types";
import {
  TestBinaryForm,
  TestValueForm,
} from "@/pages/assessments/components/tests";
import { FaCheckCircle, FaInfoCircle, FaTimesCircle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { CriterionProgress } from "./CriterionProgress";

type CriteriaTabsProps = {
  principles: Principle[];
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

  useEffect(() => {
    // if resetActiveTab signal is set to true try to find the first criterion
    // and set it as an active tab
    if (
      props.resetActiveTab &&
      props.principles.length > 0 &&
      props.principles[0].criteria.length > 0
    ) {
      const firstCriterion = props.principles[0].criteria[0].id;
      setActiveKey(firstCriterion);
      // when you set the active tab reset the signal to false
      props.onResetActiveTab();
    }
  }, [props]);

  props.principles.forEach((principle) => {
    // comment to not push principle lable to navigation list
    // navs.push(
    //   <span className="mt-2 text-muted" key={principle.id}>
    //     {principle.id} - {principle.name}:
    //   </span>,
    // );

    principle.criteria.forEach((criterion) => {
      navs.push(
        <Nav.Item key={criterion.id} className="cat-crit-tab">
          <Nav.Link
            eventKey={criterion.id}
            className="p-0"
            onClick={() => {
              props.handleGuideClose();
            }}
          >
            <div className="cat-tab-inner p-3 ">
              <div className="d-flex">
                <h6
                  className={
                    criterion.imperative === CriterionImperative.Must
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
                {criterion.imperative === CriterionImperative.Must && (
                  <div>
                    <small
                      style={{ fontSize: "0.6rem" }}
                      className="ms-2 badge mb-2 rounded-pill text-bg-light text-secondary border align-middle"
                    >
                      required
                    </small>
                  </div>
                )}
              </div>
              <p className="text-secondary lh-sm m-0">
                <small>{criterion.description}</small>
              </p>
            </div>
          </Nav.Link>
        </Nav.Item>,
      );

      // tests for each criterion
      const testList: JSX.Element[] = [];

      // store state of test results
      criterion.metric.tests.forEach((test) => {
        if (test.type === "binary") {
          testList.push(
            <div className="border mt-4">
              <div className="cat-test-div" key={test.id}>
                <TestBinaryForm
                  test={test}
                  onTestChange={props.onTestChange}
                  criterionId={criterion.id}
                  principleId={principle.id}
                  handleGuide={props.handleGuide}
                />
              </div>
            </div>,
          );
        } else if (test.type === "value") {
          testList.push(
            <div className="border mt-4">
              <div className="cat-test-div" key={test.id}>
                <TestValueForm
                  test={test}
                  onTestChange={props.onTestChange}
                  criterionId={criterion.id}
                  principleId={principle.id}
                  handleGuide={props.handleGuide}
                />
              </div>
            </div>,
          );
        }
      });

      // add criterion content
      tabs.push(
        <Tab.Pane
          key={criterion.id}
          className="text-dark"
          eventKey={criterion.id}
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

                {criterion.imperative === CriterionImperative.Must ? (
                  <span className="badge bg-success bg-small ms-4 align-middle">
                    Required
                  </span>
                ) : (
                  <span className="badge bg-warning bg-small ms-4 align-middle">
                    Optional
                  </span>
                )}
                <p className="text-muted lh-sm mt-2 mb-2">
                  {criterion.description}
                </p>
                <div className="cat-view-heading">
                  <span className="align-middle">
                    part of principle {principle.id}: {principle.name}{" "}
                  </span>

                  <FaInfoCircle
                    title={principle.description}
                    className="text-secondary opacity-50 align-middle"
                  />
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
          <Nav className="flex-column cat-asmt-nav">{navs}</Nav>
        </Col>
        <Col sm={8}>
          <Tab.Content>{tabs}</Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}
