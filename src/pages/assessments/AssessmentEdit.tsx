import { useEffect, useRef, useState, useContext, useCallback } from "react";

import { AuthContext } from "@/auth";
import {
  useGetProfile,
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
  ActorOrganisationMapping,
  AlertInfo,
} from "@/types";
import { useParams } from "react-router";
import { Card, Nav, Tab, Button } from "react-bootstrap";
import { AssessmentInfo, CriteriaTabs } from "@/pages/assessments/components";
import { FaCheckCircle } from "react-icons/fa";
import { evalAssessment, evalMetric } from "@/utils";

import {
  useCreateAssessment,
  useGetAssessment,
  useUpdateAssessment,
} from "@/api";
import { Link, useNavigate } from "react-router-dom";
import { AssessmentEvalStats } from "./components/AssessmentEvalStats";
import { DebugJSON } from "./components/DebugJSON";
import { AssessmentSelectActor } from "./components/AssessmentSelectActor";

import { toast } from "react-hot-toast";

const allowedActors = {
  PID_AUTHORITY: 2,
  PID_SERVICE_PROVIDER: 3,
  PID_MANAGER: 5,
  PID_OWNER: 6,
  PID_SCHEME: 9,
};

type AssessmentEditProps = {
  createMode?: boolean;
};

/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({ createMode = true }: AssessmentEditProps) => {
  const [activeTab, setActiveTab] = useState(1);
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const [templateId, setTemplateID] = useState<number>();
  const [actor, setActor] = useState<{ id: number; name: string }>();
  const [organisation, setOrganisation] = useState<{
    id: string;
    name: string;
  }>();
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const [templateData, setTemplateData] = useState<Assessment>();
  const { valID, asmtID } = useParams();

  const navigate = useNavigate();
  // const [actorId, setActorId] = useState<number>();
  // for the time being get the only one assessment template supported
  // with templateId: 1 (pid policy) and actorId: 6 (for pid owner)
  // this will be replaced in time with dynamic code

  // signal used in the third step of the wizard in order to trigger
  // a refresh in the criteria sub-tab component and select the first
  // criterion as an active sub-tab
  const [resetCriterionTab, setResetCriterionTab] = useState(false);

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

  const qProfile = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

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
          Object.values(allowedActors).includes(v["actor_id"]),
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

  function handleResetCriterionTabComplete() {
    setResetCriterionTab(false);
  }

  function handleCreateAssessment() {
    if (templateId && vldid && assessment) {
      const promise = mutationCreateAssessment
        .mutateAsync({
          validation_id: parseInt(vldid),
          template_id: templateId,
          assessment_doc: assessment,
        })
        .catch((err) => {
          alert.current = {
            message: "Error during assessment creation.",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Assessment succesfully created.",
          };
        });
      toast.promise(promise, {
        loading: "Creating",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  // handle tab changes in wizard
  function handleChangeTab(tabKey: number) {
    // if user selects the last step in the wizard (assessment)
    // triger the reset criterion tab signal so as to select the first
    // available criterion as the active sub-tab inside assessment
    if (tabKey == 3) {
      setResetCriterionTab(true);
    }
    // set the active tab in the wizard
    setActiveTab(tabKey);
  }

  function handleNextTab() {
    if (activeTab < 3) {
      handleChangeTab(activeTab + 1);
    }
  }

  function handlePrevTab() {
    if (activeTab > 1) {
      handleChangeTab(activeTab - 1);
    }
  }

  function handleUpdateAssessment(exit: boolean) {
    if (assessment && asmtID) {
      const promise = mutationUpdateAssessment
        .mutateAsync({
          assessment_doc: assessment,
        })
        .catch((err) => {
          alert.current = {
            message: "Error during assessment updating.",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Assessment succesfully updated.",
          };
          if (exit) {
            navigate("/assessments");
          }
        });
      toast.promise(promise, {
        loading: "Updating",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
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

  function handleSelectActor(
    valId: string,
    actorName: string,
    actorId: number,
    orgName: string,
    orgId: string,
  ) {
    setVldid(valId);
    handleActorChange(actorName, actorId, orgName, orgId);
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
    setAssessment((prev_assessment) => ({
      ...templateData!,
      ...prev_assessment!,
      actor: {
        name: actor?.name || templateData?.actor.name || "",
        id: actor?.id || templateData?.actor.id || 0,
      },
      organisation: {
        name: organisation?.name || templateData?.organisation.name || "",
        id: organisation?.id || templateData?.organisation.id || "",
      },
      principles: templateData?.principles || prev_assessment?.principles || [],
    }));
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

  return (
    <>
      <h3 className="cat-view-heading">
        <FaCheckCircle className="me-2" />{" "}
        {(createMode ? "create" : "edit") + " assessment"}
        {assessment && assessment.id && (
          <span className="badge bg-secondary ms-2">id: {assessment?.id}</span>
        )}
      </h3>
      <Tab.Container
        id="assessment-wizard"
        activeKey={"step-" + activeTab.toString()}
        onSelect={(key) => {
          if (key) {
            handleChangeTab(parseInt(key.replace("step-", "")) || 1);
          }
        }}
      >
        <Card className="mb-3 mt-3">
          <Card.Header>
            <Nav variant="pills">
              <Nav.Item className="bg-light border rounded me-2">
                <Nav.Link eventKey="step-1">
                  <span className="badge text-black bg-light me-2">
                    Step 1.
                  </span>{" "}
                  Actor
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className={`bg-light border rounded me-2 ${
                  !wizardTabActive ? "opacity-25" : ""
                }`}
              >
                <Nav.Link eventKey="step-2" disabled={!wizardTabActive}>
                  <span className="badge text-black bg-light me-2">
                    Step 2.
                  </span>{" "}
                  Submission
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className={`bg-light border rounded me-2 ${
                  !wizardTabActive ? "opacity-25" : ""
                }`}
              >
                <Nav.Link eventKey="step-3" disabled={!wizardTabActive}>
                  <span className="badge text-black bg-light me-2">
                    Step 3.
                  </span>{" "}
                  Assessment
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content className="p-2">
              <Tab.Pane className="text-black" eventKey="step-1">
                <AssessmentSelectActor
                  actorsOrgsMap={actorsOrgsMap}
                  actorId={actor?.id}
                  asmtID={asmtID}
                  validationID={validationID}
                  orgName={organisation?.name}
                  templateDataActorId={templateData?.actor.id}
                  templateDataOrgName={templateData?.organisation.name}
                  onSelectActor={handleSelectActor}
                />
              </Tab.Pane>
              <Tab.Pane className="text-black" eventKey="step-2">
                <AssessmentInfo
                  id={assessment?.id}
                  name={assessment?.name || ""}
                  actor={
                    assessment?.actor ||
                    templateData?.actor || { id: 0, name: "" }
                  }
                  type={assessment?.assessment_type?.name || ""}
                  org={assessment?.organisation.name || ""}
                  orgId={assessment?.organisation.id || ""}
                  subject={
                    assessment?.subject ||
                    templateData?.subject || { id: "", name: "", type: "" }
                  }
                  profile={qProfile.data}
                  published={assessment?.published || false}
                  onNameChange={handleNameChange}
                  onPublishedChange={handlePublishedChange}
                  onSubjectChange={handleSubjectChange}
                />
              </Tab.Pane>
              <Tab.Pane className="text-black" eventKey="step-3">
                {evalResult && assessment?.result && (
                  <AssessmentEvalStats
                    evalResult={evalResult}
                    assessmentResult={assessment.result}
                  />
                )}
                <CriteriaTabs
                  principles={assessment?.principles || []}
                  resetActiveTab={resetCriterionTab}
                  onTestChange={handleCriterionChange}
                  onResetActiveTab={handleResetCriterionTabComplete}
                />
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
          <Card.Footer className="d-flex justify-content-between p-2">
            <div>
              <Button
                id="prev-button"
                disabled={activeTab < 2}
                className={`me-2 px-5 border-black ${
                  activeTab < 2 ? "opacity-25" : ""
                }`}
                variant="light"
                onClick={handlePrevTab}
              >
                ← Prev
              </Button>

              <Button
                id="next-button"
                disabled={activeTab > 2 || !wizardTabActive}
                className={`me-2 px-5 border-black ${
                  activeTab > 2 || !wizardTabActive ? "opacity-25" : ""
                }`}
                variant="light"
                onClick={handleNextTab}
              >
                Next →
              </Button>
            </div>
            {/* Add SAVE button here and cancel */}
            <div>
              {createMode ? (
                <Button
                  disabled={!wizardTabActive}
                  className="ms-5 btn btn-success px-5"
                  onClick={() => {
                    handleCreateAssessment();
                  }}
                >
                  Create
                </Button>
              ) : (
                <>
                  <Button
                    disabled={!wizardTabActive}
                    className="ms-2 btn btn-success px-5"
                    onClick={() => {
                      handleUpdateAssessment(false);
                    }}
                  >
                    Save
                  </Button>

                  <Button
                    disabled={
                      !(
                        assessment &&
                        assessment.result &&
                        assessment.result.compliance !== null
                      )
                    }
                    className="ms-2 btn btn-success px-5"
                    onClick={() => {
                      handleUpdateAssessment(true);
                    }}
                  >
                    Submit
                  </Button>
                </>
              )}
              <Link
                className="btn btn-secondary ms-5 px-4"
                to={createMode ? "/assess" : "/assessments"}
              >
                Close
              </Link>
            </div>
          </Card.Footer>
        </Card>
      </Tab.Container>
      {/* Debug info here - display assessment json */}
      <DebugJSON assessment={assessment} />
    </>
  );
};

export default AssessmentEdit;
