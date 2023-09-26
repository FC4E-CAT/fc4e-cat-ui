import { useEffect, useState, useContext, useCallback } from "react";
import { AuthContext } from "@/auth";
import {
  useGetTemplate,
  useGetValidationDetails,
  useGetValidationList,
} from "@/api";
import {
  Assessment,
  AssessmentSubject,
  AssessmentTest,
  CriterionImperative,
  Criterion,
  ValidationResponse,
} from "@/types";
import { useParams } from "react-router";
import { Row, Col, Alert, ProgressBar, Card, Nav, Form } from "react-bootstrap";
import { AssessmentInfo, AssessmentTabs } from "@/components";
import { FaChartLine, FaCheckCircle } from "react-icons/fa";
import {
  PiNumberSquareOneFill,
  PiNumberSquareTwoFill,
  PiNumberSquareThreeFill,
} from "react-icons/pi";
import { evalAssessment, evalMetric } from "@/utils";

import {
  useCreateAssessment,
  useGetAssessment,
  useUpdateAssessment,
} from "@/api";
import { Link } from "react-router-dom";

type AssessmentEditProps = {
  createMode?: boolean;
};

type ActorOrganisationMapping = {
  actor_name: string;
  actor_id: number;
  organisation_id: string;
  organisation_name: string;
  validation_id: number;
};

/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({ createMode = true }: AssessmentEditProps) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const [templateId, setTemplateID] = useState<number>();
  const [debug, setDebug] = useState<boolean>(false);
  const [actor, setActor] = useState<{ id: number; name: string }>();
  const [organisation, setOrganisation] = useState<{
    id: string;
    name: string;
  }>();
  const [templateData, setTemplateData] = useState<Assessment>();
  const { valID, asmtID } = useParams();
  // const [actorId, setActorId] = useState<number>();
  // for the time being get the only one assessment template supported
  // with templateId: 1 (pid policy) and actorId: 6 (for pid owner)
  // this will be replaced in time with dynamic code

  const validationID = valID !== undefined ? valID : "";
  const [vldid, setVldid] = useState<string>();
  const qValidation = useGetValidationDetails({
    validation_id: vldid!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const qTemplate = useGetTemplate(
    1,
    qValidation.data?.actor_id || actor?.id,
    keycloak?.token || "",
    registered,
  );

  const asmtNumID = asmtID !== undefined ? asmtID : "";

  const qAssessment = useGetAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const [page, setPage] = useState<number>(1);
  const [validations, setValidations] = useState<ValidationResponse[]>([]);
  const { data, refetch: refetchGetValidationList } = useGetValidationList({
    size: 100,
    page: page,
    sortBy: "asc",
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // Control the disabled tabs on wizard
  const [wizardTabActive, setWizardTabActive] = useState<boolean>(false);

  // TODO: Get all available pages in an infinite scroll not all sequentially.
  useEffect(() => {
    if (data?.content) {
      setValidations((validations) => [...validations, ...data.content]);
      if (data?.number_of_page < data?.total_pages) {
        setPage((page) => page + 1);
        refetchGetValidationList();
      }
    }
  }, [data, refetchGetValidationList]);

  // After retrieving user's valitions we create a struct for the option boxes creation
  const [actorsOrgsMap, setActorsOrgsMap] = useState<
    ActorOrganisationMapping[]
  >([]);
  useEffect(() => {
    const filt = validations
      // We only allow assessment creation for APPROVED validations and
      // specific actors
      .filter(
        (v: ValidationResponse) =>
          v["status"] === "APPROVED" &&
          (v.actor_id === 2 ||
            v.actor_id === 6 ||
            v.actor_id === 9 ||
            v.actor_id === 5),
      )
      .map((filtered: ValidationResponse) => {
        return {
          actor_name: filtered.actor_name,
          actor_id: filtered.actor_id,
          organisation_id: filtered.organisation_id,
          organisation_name: filtered.organisation_name,
          validation_id: filtered.id,
        } as ActorOrganisationMapping;
      })
      .sort((a, b) => (a.actor_id > b.actor_id ? 1 : -1));
    setActorsOrgsMap(filt);
  }, [validations]);

  const mutationCreateAssessment = useCreateAssessment(keycloak?.token || "");
  const mutationUpdateAssessment = useUpdateAssessment(
    keycloak?.token || "",
    asmtID,
  );

  function handleCreateAssessment() {
    if (templateId && vldid && assessment) {
      mutationCreateAssessment.mutate({
        validation_id: parseInt(vldid),
        template_id: templateId,
        assessment_doc: assessment,
      });
    }
  }

  function handleUpdateAssessment() {
    if (assessment && asmtID) {
      mutationUpdateAssessment.mutate({
        assessment_doc: assessment,
      });
    }
  }

  function handleNameChange(name: string) {
    if (assessment) {
      setAssessment({
        ...assessment,
        name: name,
      });
    }
  }

  // This is the callback to run upon Actor-Organisation option selection
  const handleActorChange = useCallback(
    (
      actor_name: string,
      actor_id: number,
      organisation_name: string,
      organisation_id: string,
    ) => {
      if (assessment) {
        setAssessment({
          ...assessment,
          actor: {
            name: actor_name,
            id: actor_id,
          },
          organisation: {
            name: organisation_name,
            id: organisation_id,
          },
        });
        setActor({ id: actor_id, name: actor_name });
        setOrganisation({ id: organisation_id, name: organisation_name });
      } else {
        setActor({ id: actor_id, name: actor_name });
        setOrganisation({ id: organisation_id, name: organisation_name });
      }
    },
    [assessment],
  );

  useEffect(() => {
    setAssessment({
      ...templateData!,
      actor: {
        name: actor?.name || "",
        id: actor?.id || 0,
      },
      organisation: {
        name: organisation?.name || "",
        id: organisation?.id || "",
      },
    });
    setWizardTabActive(
      (actor?.id && organisation?.id) ||
        (templateData?.actor.id && templateData?.organisation.id)
        ? true
        : false,
    );
  }, [actor, organisation, templateData]);

  // Handle the resetting of assessment templates
  useEffect(() => {
    if (createMode && qTemplate.data) {
      const data = qTemplate.data?.template_doc;
      data.organisation.id = qValidation.data?.organisation_id || "";
      data.organisation.name = qValidation.data?.organisation_name || "";
      // setAssessment(data);
      setTemplateData(data);
      setTemplateID(qTemplate.data.id);
      // if not on create mode load assessment itself
    } else if (createMode === false && qAssessment.data) {
      const data = qAssessment.data.assessment_doc;
      // setAssessment(data);
      setTemplateData(data);
    }
  }, [qTemplate.data, qValidation, createMode, qAssessment.data]);

  function handleSubjectChange(subject: AssessmentSubject) {
    if (assessment) {
      setAssessment({
        ...assessment,
        subject: subject,
      });
    }
  }

  function handlePublishedChange(published: boolean) {
    if (assessment) {
      setAssessment({
        ...assessment,
        published: published,
      });
    }
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
            let resultCriterion: Criterion;
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
          if (criterion.imperative === CriterionImperative.Should) {
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

  // evaluate the assessment
  const evalResult = evalAssessment(assessment);

  // Callback that draws the option boxes component at assessment create
  const actors_select_div = useCallback(() => {
    let checked = false;
    return (
      <Form.Group
        id="actorRadio"
        className="d-flex flex-column vh-100 overflow-scroll"
      >
        {actorsOrgsMap &&
          actorsOrgsMap.map((t, i) => {
            if (actor?.id && organisation?.name) {
              checked =
                actor?.id === t.actor_id &&
                organisation?.name === t.organisation_name;
            } else {
              checked =
                templateData?.actor.id === t.actor_id &&
                templateData?.organisation?.name === t.organisation_name;
            }
            if ((validationID || asmtID) && checked) {
              return (
                <Form.Check
                  key={`type-${i}`}
                  value={t.validation_id}
                  disabled={!checked}
                  type="radio"
                  aria-label={`radio-${i}`}
                  label={`${t.actor_name} at ${t.organisation_name}`}
                  onChange={() => {
                    setVldid(t.validation_id.toString());
                    handleActorChange(
                      t.actor_name,
                      t.actor_id,
                      t.organisation_name,
                      t.organisation_id,
                    );
                  }}
                  checked={checked}
                />
              );
            } else if (!validationID && !asmtID) {
              return (
                <Form.Check
                  key={`type-${i}`}
                  value={t.validation_id}
                  type="radio"
                  aria-label={`radio-${i}`}
                  label={`${t.actor_name} at ${t.organisation_name}`}
                  onChange={() => {
                    setVldid(t.validation_id.toString());
                    handleActorChange(
                      t.actor_name,
                      t.actor_id,
                      t.organisation_name,
                      t.organisation_id,
                    );
                  }}
                  checked={checked}
                />
              );
            }
          })}
      </Form.Group>
    );
  }, [
    actorsOrgsMap,
    asmtID,
    validationID,
    templateData?.actor.id,
    templateData?.organisation.name,
    actor?.id,
    organisation?.name,
    handleActorChange,
  ]);

  const [key, setKey] = useState("#actor");
  const handleSelect = (key: string | null) => {
    if (key !== null) {
      setKey(key);
    }
  };

  // Create wizard tabs
  let current_tab = <></>;
  if (key === "#actor") {
    /* Display the Assessment header info */
    current_tab = (
      <>
        <Row>{actors_select_div()}</Row>
      </>
    );
  } else if (key === "#submission") {
    /* Display the Assessment header info */
    current_tab = (
      <AssessmentInfo
        id={assessment?.id}
        name={assessment?.name || ""}
        actor={assessment?.actor.name || ""}
        type={assessment?.assessment_type?.name || ""}
        org={assessment?.organisation.name || ""}
        orgId={assessment?.organisation.id || ""}
        subject={assessment?.subject || { id: "", name: "", type: "" }}
        published={assessment?.published || false}
        onNameChange={handleNameChange}
        onPublishedChange={handlePublishedChange}
        onSubjectChange={handleSubjectChange}
      />
    );
  } else if (key === "#assessment" && evalResult) {
    current_tab = (
      <>
        {/* provide assessment status/statistics here... */}

        <Row>
          <Col>
            <Alert
              variant={
                evalResult.mandatoryFilled !== evalResult.totalMandatory
                  ? "secondary"
                  : assessment?.result?.compliance
                  ? "success"
                  : "danger"
              }
            >
              <Row>
                <Col>
                  <span>
                    <FaCheckCircle className="me-2" />
                    Compliance:
                    {evalResult.mandatoryFilled !==
                    evalResult.totalMandatory ? (
                      <span className="badge bg-secondary ms-2">UNKNOWN</span>
                    ) : assessment?.result?.compliance ? (
                      <span className="badge bg-success ms-2">PASS</span>
                    ) : (
                      <span className="badge bg-danger ms-2">FAIL</span>
                    )}
                  </span>
                </Col>
                <Col>
                  <span>
                    <FaChartLine className="me-2" />
                    Ranking:
                  </span>{" "}
                  {assessment?.result?.ranking}
                </Col>
                <Col></Col>
                <Col xs={2}>
                  <div className="mb-2">
                    <span>
                      Mandatory: {evalResult.mandatoryFilled} /{" "}
                      {evalResult.totalMandatory}
                    </span>
                    <ProgressBar
                      style={{ backgroundColor: "darkgrey", height: "0.6rem" }}
                      className="mt-1"
                    >
                      <ProgressBar
                        key="mandatory-pass"
                        variant="success"
                        now={
                          evalResult.totalMandatory
                            ? (evalResult.mandatory /
                                evalResult.totalMandatory) *
                              100
                            : 0
                        }
                      />
                      <ProgressBar
                        key="mandatory-fail"
                        variant="danger"
                        now={
                          evalResult.totalMandatory
                            ? ((evalResult.mandatoryFilled -
                                evalResult.mandatory) /
                                evalResult.totalMandatory) *
                              100
                            : 0
                        }
                      />
                    </ProgressBar>
                  </div>
                </Col>
                {evalResult.totalOptional > 0 && (
                  <Col xs={2}>
                    <div className="mb-2">
                      <span>
                        Optional: {evalResult.optionalFilled} /{" "}
                        {evalResult.totalOptional}
                      </span>
                      <ProgressBar
                        style={{
                          backgroundColor: "darkgrey",
                          height: "0.6rem",
                        }}
                        className="mt-1"
                      >
                        <ProgressBar
                          key="mandatory-pass"
                          striped
                          variant="success"
                          now={
                            evalResult.totalOptional
                              ? (evalResult.optional /
                                  evalResult.totalOptional) *
                                100
                              : 0
                          }
                        />
                        <ProgressBar
                          key="mandatory-fail"
                          striped
                          variant="danger"
                          now={
                            evalResult.totalOptional
                              ? ((evalResult.optionalFilled -
                                  evalResult.optional) /
                                  evalResult.totalOptional) *
                                100
                              : 0
                          }
                        />
                      </ProgressBar>
                    </div>
                  </Col>
                )}
              </Row>
            </Alert>
          </Col>
        </Row>
        <AssessmentTabs
          principles={assessment?.principles || []}
          onTestChange={handleCriterionChange}
        />
      </>
    );
  }

  return (
    <div className="mt-4">
      <h3 className="cat-view-heading">
        <FaCheckCircle className="me-2" />{" "}
        {(createMode ? "create" : "edit") + " assessment"}
        {assessment && assessment.id && (
          <span className="badge bg-secondary ms-2">id: {assessment?.id}</span>
        )}
      </h3>
      {/* when template data hasn't loaded yet */}
      <>
        <Card>
          <Card.Header>
            <Nav
              variant="tabs"
              className="assessment-card"
              defaultActiveKey="#actor"
              activeKey={key}
              onSelect={(k) => {
                handleSelect(k);
              }}
            >
              <Nav.Item>
                <Nav.Link href="#actor">
                  <span>
                    <PiNumberSquareOneFill size="25px" className="me-1" />
                  </span>
                  ACTOR
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  href="#submission"
                  {...{ disabled: !wizardTabActive }}
                >
                  <span>
                    <PiNumberSquareTwoFill size="25px" className="me-1" />
                  </span>
                  SUBMISSION
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link
                  href="#assessment"
                  {...{ disabled: !wizardTabActive }}
                >
                  <span>
                    <PiNumberSquareThreeFill size="25px" className="me-1" />
                  </span>
                  ASSESSMENT
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>{current_tab}</Card.Body>
        </Card>

        {/* Add SAVE button here and cancel */}
        <div className="text-end mt-2">
          <button
            type="button"
            className="btn btn-success px-5"
            onClick={() => {
              if (createMode) {
                handleCreateAssessment();
              } else {
                handleUpdateAssessment();
              }
            }}
          >
            Save
          </button>
          <Link className="btn btn-secondary ms-2 px-5" to="/assessments">
            Cancel
          </Link>
        </div>

        {/* Debug info here - display assessment json */}
        <div className="mt-5">
          <button
            type="button"
            className="btn btn-warning btn-sm"
            onClick={() => setDebug(!debug)}
          >
            Debug JSON
          </button>
          <br />
          {debug && (
            <pre className="p-2 bg-dark text-white">
              <code>{JSON.stringify(assessment, null, 2)}</code>
            </pre>
          )}
        </div>
      </>
    </div>
  );
};

export default AssessmentEdit;
