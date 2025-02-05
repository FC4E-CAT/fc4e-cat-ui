import { useEffect, useRef, useState, useContext, useCallback } from "react";
import Markdown from "react-markdown";
import { AuthContext } from "@/auth";
import {
  useGetAsmtEligibility,
  useGetMotivationTemplate,
  useGetProfile,
} from "@/api";
import {
  Assessment,
  AssessmentSubject,
  AssessmentTest,
  AssessmentCriterionImperative,
  AlertInfo,
  AssessmentEditMode,
  ActorOrgAsmtType,
  AssessmentCriterion,
} from "@/types";
import { useParams } from "react-router";
import {
  Card,
  Nav,
  Tab,
  Button,
  Form,
  Alert,
  Offcanvas,
} from "react-bootstrap";
import { AssessmentInfo, CriteriaTabs } from "@/pages/assessments/components";
import {
  FaCheckCircle,
  FaComment,
  FaDownload,
  FaExclamationCircle,
  FaFileImport,
  FaHandPointRight,
  FaLock,
  FaShare,
  FaTimesCircle,
  FaUsers,
} from "react-icons/fa";
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
import { ShareModal } from "./components/ShareModal";
import { Comments } from "./components/Comments";
import FormCheckInput from "react-bootstrap/esm/FormCheckInput";
import { useTranslation } from "react-i18next";

type AssessmentEditProps = {
  mode: AssessmentEditMode;
};

interface ShareModalConfig {
  show: boolean;
  name: string;
  id: string;
}

type Guide = {
  id: string;
  title: string;
  text: string;
  show: boolean;
};

/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({
  mode = AssessmentEditMode.Create,
}: AssessmentEditProps) => {
  const { t } = useTranslation();
  const [reqFields, setReqFields] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState(1);
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const [actor, setActor] = useState<{ id: string; name: string }>();
  const [organisation, setOrganisation] = useState<{
    id: string;
    name: string;
  }>();
  const [asmtType, setAsmtType] = useState<{
    id: string;
    name: string;
  }>();
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const [templateData, setTemplateData] = useState<Assessment>();
  const { asmtId } = useParams();

  // guidance state
  const [guide, setGuide] = useState<Guide>({
    id: "",
    title: "",
    text: "",
    show: false,
  });

  // Share Modal
  const [shareModalConfig, setShareModalConfig] = useState<ShareModalConfig>({
    show: false,
    name: "",
    id: "",
  });
  // comments state
  const [commentsShow, setCommentsShow] = useState(false);

  const handleGuideClose = () =>
    setGuide({ id: "", title: "", text: "", show: false });

  const handleGuide = (id: string, title: string, text: string) => {
    if (id == guide.id) {
      setGuide({ id: "", title: "", text: "", show: false });
    } else {
      setGuide({
        id: id,
        text: text,
        title: title,
        show: true,
      });
    }
  };

  const navigate = useNavigate();

  const [resetCriterionTab, setResetCriterionTab] = useState(false);
  const [importInfo, setImportInfo] = useState<Assessment>();

  const qTemplate = useGetMotivationTemplate(
    asmtType?.id || "",
    actor?.id || "",
    keycloak?.token || "",
    registered,
  );

  const qProfile = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const asmtNumID = asmtId !== undefined ? asmtId : "";

  const qAssessment = useGetAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered,
    isPublic: false,
  });

  const [shared, setShared] = useState<boolean>(false);
  const [importError, setImportError] = useState<string>("");
  const [page] = useState<number>(1);
  const [actorMap, setActorMap] = useState<ActorOrgAsmtType[]>([]);
  const { data, fetchNextPage, hasNextPage } = useGetAsmtEligibility({
    size: 10,
    page: page,
    sortBy: "asc",
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // Control the disabled tabs on wizard
  const [wizardTabActive, setWizardTabActive] = useState<boolean>(false);

  const extraTab = mode === AssessmentEditMode.Import ? 1 : 0;
  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#actor") {
      setActiveTab(1 + extraTab);
    } else if (hash === "#submission") {
      setActiveTab(2 + extraTab);
    } else if (hash === "#assessment") {
      setActiveTab(3 + extraTab);
      setResetCriterionTab(true);
    }
  }, [extraTab]);

  // TODO: Get all available pages in an infinite scroll not all sequentially.
  useEffect(() => {
    // gather all actor/org/type mappings in one array
    let actorMappings: ActorOrgAsmtType[] = [];

    // iterate over backend pages and gather all items in the actorMappings array
    if (data?.pages) {
      data.pages.map((page) => {
        actorMappings = [...actorMappings, ...page.content];
      });
      if (hasNextPage) {
        fetchNextPage();
      }
    }

    setActorMap(actorMappings);
  }, [data, hasNextPage, fetchNextPage]);

  const mutationCreateAssessment = useCreateAssessment(keycloak?.token || "");

  const mutationUpdateAssessment = useUpdateAssessment(
    keycloak?.token || "",
    asmtId,
  );

  function handleResetCriterionTabComplete() {
    setResetCriterionTab(false);
  }

  // function that checks if the required fields are empty
  function checkRequiredFields(assessment: Assessment): boolean {
    const result: string[] = [];
    if (assessment.name === "") result.push("name");
    if (assessment.subject.name === "") result.push("subject_name");
    if (assessment.subject.id === "") result.push("subject_id");
    if (assessment.subject.type === "") result.push("subject_type");
    if (assessment.actor.name === "") result.push("actor");
    setReqFields(result);
    if (result.length > 0) {
      setActiveTab(2);
      return false;
    }
    return true;
  }

  function handleCreateAssessment() {
    if (assessment && checkRequiredFields(assessment)) {
      const promise = mutationCreateAssessment
        .mutateAsync({
          assessment_doc: assessment,
        })
        .catch((err) => {
          alert.current = {
            message: `${t("page_assessment_edit.toast_create_fail")}:\n${err.response.data.message}`,
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_assessment_edit.toast_create_success"),
          };
        });
      toast.promise(promise, {
        loading: t("page_assessment_edit.toast_create_progress"),
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
    if (
      (mode === AssessmentEditMode.Import && activeTab < 4) ||
      activeTab < 3
    ) {
      handleChangeTab(activeTab + 1);
    }
  }

  function handlePrevTab() {
    if (activeTab > 1) {
      handleChangeTab(activeTab - 1);
    }
  }

  function handleUpdateAssessment(exit: boolean) {
    if (assessment && asmtId && checkRequiredFields(assessment)) {
      const promise = mutationUpdateAssessment
        .mutateAsync({
          assessment_doc: assessment,
        })
        .catch((err) => {
          alert.current = {
            message: `${t("page_assessment_edit.toast_update_fail")}:\n${err.response.data.message}`,
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_assessment_edit.toast_update_success"),
          };
          if (exit) {
            navigate("/assessments");
          }
        });
      toast.promise(promise, {
        loading: t("page_assessment_edit.toast_update_progress"),
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
    actorId: string,
    actorName: string,
    orgId: string,
    orgName: string,
    asmtTypeId: string,
    asmtTypeName: string,
  ) {
    handleActorChange(
      actorId,
      actorName,
      orgId,
      orgName,
      asmtTypeId,
      asmtTypeName,
    );
  }

  // take care of window location hash when tabs change
  useEffect(() => {
    if (activeTab - extraTab === 1) {
      window.location.hash = "#actor";
    } else if (activeTab - extraTab === 2) {
      window.location.hash = "#submission";
    } else if (activeTab - extraTab === 3) {
      window.location.hash = "#assessment";
    }
  }, [activeTab, extraTab]);

  // This is the callback to run upon Actor-Organisation option selection
  const handleActorChange = useCallback(
    (
      actor_id: string,
      actor_name: string,
      organisation_id: string,
      organisation_name: string,
      asmtTypeId: string,
      asmtTypeName: string,
    ) => {
      if (assessment) {
        setAssessment({
          ...assessment,
          actor: {
            id: actor_id,
            name: actor_name,
          },
          organisation: {
            id: organisation_id,
            name: organisation_name,
          },
          assessment_type: {
            id: asmtTypeId,
            name: asmtTypeName,
            description: assessment.assessment_type.description,
          },
        });
        setActor({ id: actor_id, name: actor_name });
        setOrganisation({ id: organisation_id, name: organisation_name });
        setAsmtType({ id: asmtTypeId, name: asmtTypeName });
      } else {
        setActor({ id: actor_id, name: actor_name });
        setOrganisation({ id: organisation_id, name: organisation_name });
        setAsmtType({ id: asmtTypeId, name: asmtTypeName });
      }
    },
    [assessment],
  );

  useEffect(() => {
    if (mode === AssessmentEditMode.Import) {
      setAssessment((prev_assessment) => ({
        ...prev_assessment!,
        actor: {
          name: actor?.name || templateData?.actor.name || "",
          id: actor?.id || templateData?.actor.id || "",
        },
        organisation: {
          name: organisation?.name || templateData?.organisation.name || "",
          id: organisation?.id || templateData?.organisation.id || "",
        },
      }));
    } else {
      setAssessment((prev_assessment) => ({
        ...templateData!,
        ...prev_assessment!,
        actor: {
          name: actor?.name || templateData?.actor.name || "",
          id: actor?.id || templateData?.actor.id || "",
        },
        organisation: {
          name: organisation?.name || templateData?.organisation.name || "",
          id: organisation?.id || templateData?.organisation.id || "",
        },
        assessment_type: {
          name: asmtType?.name || templateData?.assessment_type.name || "",
          id: asmtType?.id || templateData?.assessment_type.id || "",
          description: templateData?.assessment_type.description || "",
        },
        principles:
          templateData?.principles || prev_assessment?.principles || [],
      }));
    }

    setWizardTabActive(
      (actor?.id && organisation?.id) ||
        (templateData?.actor.id && templateData?.organisation.id)
        ? true
        : false,
    );
  }, [actor, organisation, templateData, mode, asmtType]);

  // Handle the resetting of assessment templates
  useEffect(() => {
    if (mode !== AssessmentEditMode.Edit && qTemplate.data) {
      const data = qTemplate.data;

      // setAssessment(data);
      setTemplateData(data);
      // if not on create mode load assessment itself
    } else if (mode === AssessmentEditMode.Edit && qAssessment.data) {
      const data = qAssessment.data.assessment_doc;
      setShared(qAssessment.data.shared_to_user);
      setShareModalConfig({
        id: qAssessment.data.assessment_doc.id,
        name: qAssessment.data.assessment_doc.name,
        show: false,
      });
      setTemplateData(data);
    }
  }, [qTemplate.data, mode, qAssessment.data]);

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();

      reader.onload = () => {
        try {
          setImportError("");
          setImportInfo(undefined);
          const contents = JSON.parse(reader.result as string);
          setImportInfo(contents);
          setAssessment({ ...contents, id: undefined, timestamp: "" });
        } catch (error) {
          if (error instanceof Error) {
            setImportError(error.message);
          } else {
            console.log(error);
          }
        }
      };
      reader.readAsText(file);
    }
  };

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
            let resultCriterion: AssessmentCriterion;
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
          if (
            criterion.imperative === AssessmentCriterionImperative.Must ||
            criterion.imperative === AssessmentCriterionImperative.MUST
          ) {
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

      // get how many optional items have passed
      const optionalPass: number = optional.reduce(
        (sum: number, current: number | null) => {
          if (current && current > 0) {
            return sum + 1;
          }
          return sum;
        },
        0,
      );

      // if there any optional items available, ranking is equal to the percentage of optional passed / total optional
      // else ranking is 0
      const ranking =
        optional.length > 0 ? (optionalPass / optional.length) * 100 : 0;

      setAssessment({
        ...newAssessment,
        result: { compliance: compliance, ranking: ranking },
      });
    }
  }

  // evaluate the assessment
  const evalResult = evalAssessment(assessment);

  let importDone = true;
  if (mode === AssessmentEditMode.Import) {
    importDone = Boolean(importInfo?.actor?.id);
  }

  const nextEnabled =
    mode === AssessmentEditMode.Import
      ? importDone
        ? activeTab === 1 || (wizardTabActive && activeTab <= 3)
        : false
      : wizardTabActive && activeTab < 3;

  return (
    <>
      <ShareModal
        show={shareModalConfig.show}
        name={shareModalConfig.name}
        id={shareModalConfig.id}
        onHide={() => {
          setShareModalConfig({ ...shareModalConfig, show: false });
        }}
      />
      <Offcanvas
        show={guide.show}
        onHide={handleGuideClose}
        scroll={true}
        placement="end"
        backdrop={false}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>{guide.title}</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Markdown>{guide.text}</Markdown>
        </Offcanvas.Body>
      </Offcanvas>
      {/* This is a second offcanvas element to host assessment comments */}
      <Offcanvas
        show={commentsShow}
        onHide={() => {
          setCommentsShow(false);
        }}
        scroll={true}
        placement="end"
        backdrop={false}
      >
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>
            {t("page_assessment_edit.comments")}
          </Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body id="cat-comments-area">
          <Comments id={assessment?.id || ""} />
        </Offcanvas.Body>
      </Offcanvas>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            {`${mode} assessment`}
            <p className="lead cat-view-lead">
              {t("page_assessment_edit.subtitle")}
              {assessment && assessment.id && (
                <>
                  <br />
                  <span className="text-info">
                    <small>{` ${t("page_assessment_edit.with_id")} ${assessment.id}`}</small>
                  </span>
                </>
              )}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          {mode === AssessmentEditMode.Edit && (
            <>
              {shared ? (
                <button className="btn btn-secondary">
                  {`${t("page_assessment_edit.shared_with_me")} `}{" "}
                  <FaUsers className="ms-1" />
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => {
                    setShareModalConfig({ ...shareModalConfig, show: true });
                  }}
                >
                  <FaShare />
                  {` ${t("buttons.share")}`}
                </button>
              )}
              <button
                className="btn btn-warning ms-2"
                onClick={() => setCommentsShow(!commentsShow)}
              >
                <FaComment />
                {` ${t("page_assessment_edit.comments")}`}
              </button>
            </>
          )}
        </div>
      </div>
      <Tab.Container
        id="assessment-wizard"
        activeKey={"step-" + activeTab.toString()}
        onSelect={(key) => {
          if (key) {
            handleChangeTab(parseInt(key.replace("step-", "")) || 1);
            handleGuideClose();
          }
        }}
      >
        <Card className="mb-3 mt-3">
          <Card.Header>
            <Nav variant="pills">
              {mode === AssessmentEditMode.Import && (
                <Nav.Item className="bg-light border rounded me-2">
                  <Nav.Link eventKey="step-1">
                    <span className="badge text-black bg-light me-2">
                      {` ${t("page_assessment_edit.step")} 1.`}
                    </span>{" "}
                    {t("page_assessment_edit.import_file")}
                  </Nav.Link>
                </Nav.Item>
              )}
              <Nav.Item
                className={`bg-light border rounded me-2 ${
                  !importDone ? "opacity-25" : ""
                }`}
              >
                <Nav.Link
                  eventKey={`step-${1 + extraTab}`}
                  disabled={!importDone}
                >
                  <span className="badge text-black bg-light me-2">
                    {`${t("page_assessment_edit.step")} ${1 + extraTab}.`}
                  </span>{" "}
                  {t("actor")}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className={`bg-light border rounded me-2 ${
                  !wizardTabActive ? "opacity-25" : ""
                }`}
              >
                <Nav.Link
                  eventKey={`step-${2 + extraTab}`}
                  disabled={!wizardTabActive}
                >
                  <span className="badge text-black bg-light me-2">
                    {`${t("page_assessment_edit.step")} ${2 + extraTab}.`}
                  </span>{" "}
                  {t("submission")}
                  {reqFields.length > 0 && (
                    <FaExclamationCircle className="ms-2 text-danger rounded-circle bg-white" />
                  )}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item
                className={`bg-light border rounded me-2 ${
                  !wizardTabActive ? "opacity-25" : ""
                }`}
              >
                <Nav.Link
                  eventKey={`step-${3 + extraTab}`}
                  disabled={!wizardTabActive}
                >
                  <span className="badge text-black bg-light me-2">
                    {`${t("page_assessment_edit.step")} ${3 + extraTab}.`}
                  </span>{" "}
                  {t("assessment")}
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>
          <Card.Body>
            <Tab.Content className="p-2">
              {mode === AssessmentEditMode.Import && (
                <Tab.Pane className="text-black" eventKey={"step-1"}>
                  <div>
                    <div>
                      {`${t("page_assessment_edit.imp1")} `}
                      <em className="text-underline">export</em>{" "}
                      {` ${t("page_assessment_edit.imp2")} `}
                      <em className="text-underline">import</em>{" "}
                      {`${t("page_assessment_edit.imp3")} `}
                      <code className="text-muted mx-2">*.json</code>{" "}
                      {`${t("page_assessment_edit.imp4")}`}
                    </div>

                    <div>
                      <em className="ms-4 text-muted mb-3">
                        <small>
                          <FaHandPointRight />{" "}
                          {` ${t("page_assessment_edit.imp5")} `}
                          <Link to="/assessments">
                            {t("page_assessment_edit.imp6")}
                          </Link>
                          {` ${t("page_assessment_edit.imp7")} `}
                          <FaDownload className="text-muted" />
                          {` ${t("page_assessment_edit.imp8")}`}
                        </small>
                      </em>
                    </div>

                    <div className="mt-1">{t("page_assessment_edit.imp9")}</div>

                    <div className="mt-4">
                      {" "}
                      <FaFileImport className="me-2" />{" "}
                      <strong className="align-middle">
                        {t("page_assessment_edit.imp10")}
                      </strong>{" "}
                    </div>

                    <Form.Group controlId="formFile" className="mb-3">
                      <Form.Control
                        type="file"
                        accept=".json"
                        onChange={handleImport}
                      />
                    </Form.Group>
                    {importDone && importInfo !== undefined && (
                      <>
                        <Alert variant="success">
                          <div>
                            <FaCheckCircle className="me-2" />
                            <strong className="align-middle">
                              {t("page_assessment_edit.valid_import")}
                            </strong>
                          </div>
                          <hr />
                          {importInfo.assessment_type && (
                            <div>
                              <small>
                                <strong>
                                  {t(
                                    "page_assessment_edit.type_assessment",
                                  ).toLowerCase()}
                                  :
                                </strong>{" "}
                                {importInfo?.assessment_type?.name} - [id:{" "}
                                {importInfo?.assessment_type?.id}]
                              </small>
                            </div>
                          )}
                          {importInfo.timestamp && (
                            <div>
                              <small>
                                <strong>
                                  {t("fields.timestamp").toLowerCase()}:
                                </strong>{" "}
                                {importInfo.timestamp}
                              </small>
                            </div>
                          )}
                          {importInfo.id && (
                            <div>
                              <small>
                                <strong>{t("fields.id").toLowerCase()}:</strong>{" "}
                                {importInfo.id}
                              </small>
                            </div>
                          )}
                          {importInfo.name && (
                            <div>
                              <small>
                                <strong>
                                  {t("fields.name").toLowerCase()}:
                                </strong>{" "}
                                {importInfo.name}
                              </small>
                            </div>
                          )}
                          {importInfo.actor && (
                            <div>
                              <small>
                                <strong>
                                  {t("fields.actor").toLowerCase()}:
                                </strong>{" "}
                                {importInfo.actor.name} - [
                                {t("fields.id").toLowerCase()}:{" "}
                                {importInfo.actor.id}]
                              </small>
                            </div>
                          )}
                          {importInfo.organisation && (
                            <div>
                              <small>
                                <strong>
                                  {t("fields.organisation").toLowerCase()}:
                                </strong>{" "}
                                {importInfo?.organisation?.name} - [id:{" "}
                                {importInfo?.organisation?.id}]
                              </small>
                            </div>
                          )}
                        </Alert>
                        <div>{t("page_assessment_edit.next_step_actor")}</div>
                      </>
                    )}
                    {!importError &&
                      !importDone &&
                      importInfo !== undefined && (
                        <>
                          <Alert variant="danger">
                            <div>
                              <FaTimesCircle className="me-2" />
                              <span className="align-middle">
                                <strong className="me-2">
                                  {t("page_assessment_edit.invalid")}
                                </strong>
                                - {t("page_assessment_edit.reimport")}
                              </span>
                            </div>
                          </Alert>
                        </>
                      )}
                    {importError && (
                      <>
                        <Alert variant="danger">
                          <div>
                            <FaTimesCircle className="me-2" />
                            <span className="align-middle">
                              <strong className="me-2">
                                {t("page_assessment_edit.invalid_json")}
                              </strong>
                              {importError}
                            </span>
                          </div>
                        </Alert>
                      </>
                    )}
                  </div>
                </Tab.Pane>
              )}
              <Tab.Pane
                className="text-black"
                eventKey={`step-${1 + extraTab}`}
              >
                {shared ? (
                  <div>
                    <div>
                      <FaLock />
                      {` ${t("page_assessment_edit.share1")}`}
                      <strong>{t("page_assessment_edit.share2")}</strong>
                      {` ${t("page_assessment_edit.share3")}:`}
                    </div>
                    <div className="border p-2 m-2 text-muted">
                      <FormCheckInput
                        checked
                        type="radio"
                        disabled={true}
                        className="mx-2"
                      />
                      {`${assessment?.actor.name} at ${assessment?.organisation.name} - ${assessment?.assessment_type.name}`}
                    </div>
                  </div>
                ) : (
                  <AssessmentSelectActor
                    actorMap={actorMap}
                    actorId={actor?.id}
                    asmtId={asmtId}
                    orgId={organisation?.id}
                    asmtTypeId={asmtType?.id}
                    importAsmtTypeId={importInfo?.assessment_type?.id}
                    importActorId={importInfo?.actor?.id}
                    templateDataActorId={templateData?.actor.id}
                    templateDataOrgId={templateData?.organisation.id}
                    templateDataAsmtTypeId={templateData?.assessment_type.id}
                    onSelectActor={handleSelectActor}
                  />
                )}
              </Tab.Pane>
              <Tab.Pane
                className="text-black"
                eventKey={`step-${2 + extraTab}`}
              >
                <AssessmentInfo
                  id={assessment?.id}
                  name={assessment?.name || ""}
                  actor={
                    assessment?.actor ||
                    templateData?.actor || { id: "", name: "" }
                  }
                  type={assessment?.assessment_type?.name || ""}
                  org={assessment?.organisation?.name || ""}
                  orgId={assessment?.organisation?.id || ""}
                  subject={
                    assessment?.subject ||
                    templateData?.subject || { id: "", name: "", type: "" }
                  }
                  profile={qProfile.data}
                  published={assessment?.published || false}
                  onNameChange={handleNameChange}
                  onPublishedChange={handlePublishedChange}
                  onSubjectChange={handleSubjectChange}
                  reqFields={reqFields}
                />
              </Tab.Pane>
              <Tab.Pane
                className="text-black"
                eventKey={`step-${3 + extraTab}`}
              >
                {evalResult && assessment?.result && (
                  <AssessmentEvalStats
                    evalResult={evalResult}
                    assessmentResult={assessment.result}
                  />
                )}
                <div
                  className="row bg-secondary"
                  style={{ height: "1px" }}
                ></div>
                <CriteriaTabs
                  principles={assessment?.principles || []}
                  resetActiveTab={resetCriterionTab}
                  onTestChange={handleCriterionChange}
                  onResetActiveTab={handleResetCriterionTabComplete}
                  handleGuide={handleGuide}
                  handleGuideClose={handleGuideClose}
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
                {`← ${t("buttons.prev")}`}
              </Button>

              <Button
                id="next-button"
                disabled={!nextEnabled}
                className={`me-2 px-5 border-black ${
                  !nextEnabled ? "opacity-25" : ""
                }`}
                variant="light"
                onClick={handleNextTab}
              >
                {`${t("buttons.next")} →`}
              </Button>
            </div>
            {/* Add SAVE button here and cancel */}
            <div>
              {mode !== AssessmentEditMode.Edit ? (
                <Button
                  id="create_assessment_button"
                  disabled={!wizardTabActive}
                  className="ms-5 btn btn-success px-5"
                  onClick={() => {
                    handleCreateAssessment();
                  }}
                >
                  {t("buttons.create")}
                </Button>
              ) : (
                <>
                  <Button
                    id="save_assessment_button"
                    disabled={!wizardTabActive}
                    className="ms-2 btn btn-success px-5"
                    onClick={() => {
                      handleUpdateAssessment(false);
                    }}
                  >
                    {t("buttons.save")}
                  </Button>

                  <Button
                    id="submit_assessment_button"
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
                    {t("buttons.submit")}
                  </Button>
                </>
              )}
              <Link
                className="btn btn-secondary ms-5 px-4"
                to={
                  mode === AssessmentEditMode.Create
                    ? "/assess"
                    : "/assessments"
                }
              >
                {t("buttons.close")}
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
