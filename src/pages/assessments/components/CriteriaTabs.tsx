import {
  Alert,
  Col,
  ListGroup,
  Nav,
  OverlayTrigger,
  Row,
  Tab,
  Tooltip,
} from "react-bootstrap";
import {
  AssessmentTest,
  CriterionImperative,
  MetricAlgorithm,
  Principle,
} from "@/types";
import {
  TestBinaryForm,
  TestValueForm,
} from "@/pages/assessments/components/tests";
import { FaInfoCircle } from "react-icons/fa";
import { useEffect, useState } from "react";

type CriteriaTabsProps = {
  principles: Principle[];
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
    if (
      props.principles.length > 0 &&
      props.principles[0].criteria.length > 0
    ) {
      const firstCriterion = props.principles[0].criteria[0].id;
      setActiveKey(firstCriterion);
    }
  }, [props.principles]);

  props.principles.forEach((principle) => {
    // push principle lable to navigation list
    navs.push(
      <span className="mt-2 text-muted" key={principle.id}>
        {principle.id} - {principle.name}:
      </span>,
    );

    principle.criteria.forEach((criterion) => {
      navs.push(
        <Nav.Item key={criterion.id}>
          <Nav.Link eventKey={criterion.id}>
            {criterion.id} - {criterion.name}
          </Nav.Link>
        </Nav.Item>,
      );

      // tests for each criterion
      const testList: JSX.Element[] = [];

      // store state of test results
      criterion.metric.tests.forEach((test) => {
        if (test.type === "binary") {
          testList.push(
            <ListGroup.Item key={test.id}>
              <TestBinaryForm
                test={test}
                onTestChange={props.onTestChange}
                criterionId={criterion.id}
                principleId={principle.id}
              />
            </ListGroup.Item>,
          );
        } else if (test.type === "value") {
          testList.push(
            <ListGroup.Item key={test.id}>
              <TestValueForm
                test={test}
                onTestChange={props.onTestChange}
                criterionId={criterion.id}
                principleId={principle.id}
              />
            </ListGroup.Item>,
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
          <Alert variant="light">
            <h6>
              Principle {principle.id}: {principle.name}
            </h6>
            <small className="text-small">{principle.description}</small>
          </Alert>
          <div>
            <Alert variant="light">
              <Row>
                <Col>
                  <h5>
                    Criterion {criterion.id}: {criterion.name}
                    {criterion.imperative === CriterionImperative.Should ? (
                      <span className="badge bg-success bg-small ms-2">
                        Should
                      </span>
                    ) : (
                      <span className="badge bg-warning bg-small ms-2">
                        May
                      </span>
                    )}
                  </h5>
                  <p>{criterion.description}</p>
                </Col>
                <Col xs={3}>
                  <div className="text-end">
                    Metric:
                    {criterion.metric.result === null ? (
                      <span className="badge bg-secondary ms-2">UNKNOWN</span>
                    ) : criterion.metric.result > 0 ? (
                      <span className="badge bg-success ms-2">PASS</span>
                    ) : (
                      <span className="badge bg-danger ms-2">FAIL</span>
                    )}
                    <OverlayTrigger
                      overlay={
                        <Tooltip
                          className="cat-metric-tooltip"
                          id="info-metric"
                        >
                          <p>
                            The final <em>result</em> of this metric is a{" "}
                            <code>{criterion.metric.type}</code>.
                            {criterion.metric.type === "number" && (
                              <>
                                <br />- <em>result</em> of <code>1</code>{" "}
                                indicates a{" "}
                                <span className="text-success">PASS</span>.
                                <br />- <em>result</em> of <code>0</code>{" "}
                                indicates a{" "}
                                <span className="text-danger">FAIL</span>.
                                <br />
                              </>
                            )}
                            {criterion.metric.algorithm ===
                              MetricAlgorithm.Single && (
                              <>
                                The <em>result</em> is based on the{" "}
                                <em>value</em> of the single test.
                                <br />
                              </>
                            )}
                            {criterion.metric.algorithm ===
                              MetricAlgorithm.Sum && (
                              <>
                                The <em>result</em> is based on the{" "}
                                <strong>value</strong> calculated from summing
                                the result values of all included tests.
                                <br />
                              </>
                            )}
                            {"equal_greater_than" in
                              criterion.metric.benchmark && (
                              <>
                                This <em>value</em> should be{" "}
                                <code>
                                  &gt;={" "}
                                  {
                                    criterion.metric.benchmark[
                                      "equal_greater_than"
                                    ]
                                  }{" "}
                                </code>
                                <br />
                              </>
                            )}
                          </p>
                        </Tooltip>
                      }
                    >
                      <span>
                        <FaInfoCircle className="ms-2" title="tootltip" />
                      </span>
                    </OverlayTrigger>
                  </div>
                  <div className="text-end">
                    <div>
                      <small>
                        tests:{" "}
                        {
                          criterion.metric.tests.filter(
                            (item) => item.result !== null,
                          ).length
                        }
                        /{criterion.metric.tests.length}
                      </small>
                    </div>
                    {criterion.metric.result !== null && (
                      <div>
                        <small>result: {criterion.metric.result}</small>
                      </div>
                    )}
                  </div>
                </Col>
              </Row>
            </Alert>
            <ListGroup>{testList}</ListGroup>
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
      <Row>
        <Col sm={3}>
          <Nav variant="pills" className="flex-column">
            {navs}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content>{tabs}</Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  );
}
