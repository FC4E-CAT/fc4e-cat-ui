import { useContext } from "react";
import { AuthContext } from "@/auth";
import { useParams } from "react-router";

import { useGetAssessment } from "@/api";
import { DebugJSON } from "./components/DebugJSON";
import { Button, Card, Col, Row } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import imgAssessmentPass from "@/assets/assessment-pass.png";
import imgAssessmentBadgePassed from "@/assets/badge-passed.png";
import imgAssessmentBadgeWip from "@/assets/badge-wip.png";
import imgAssessmentBadgeFailed from "@/assets/badge-failed.png";
import Accordion from "react-bootstrap/Accordion";
import {
  Assessment,
  AssessmentCriterionImperative,
  AssessmentStats,
} from "@/types";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import AssessmentPdf from "./AssessmentPdf";
import { useTranslation } from "react-i18next";
import { prettyPrintRanking } from "@/utils";

// dig through the assessment and collect the completion statistics
function gatherStats(assessment: Assessment | undefined): AssessmentStats {
  let total_principles = 0;
  let total_criteria = 0;
  let total_mandatory = 0;
  let total_optional = 0;
  let completed_mandatory = 0;
  let completed_optional = 0;

  if (assessment) {
    total_principles = assessment.principles.length;
    assessment.principles.forEach((pri) => {
      total_criteria += pri.criteria.length;
      pri.criteria.forEach((cri) => {
        if (cri.imperative == AssessmentCriterionImperative.MUST) {
          total_mandatory += 1;
          if (cri.metric.result !== null) completed_mandatory += 1;
        } else {
          total_optional += 1;
          if (cri.metric.result !== null) completed_optional += 1;
        }
      });
    });
  }

  return {
    total_principles: total_principles,
    total_criteria: total_criteria,
    total_mandatory: total_mandatory,
    total_optional: total_optional,
    completed_mandatory: completed_mandatory,
    completed_optional: completed_optional,
  };
}

/** AssessmentView page that displays the results of an assessment */
const AssessmentView = ({ isPublic }: { isPublic: boolean }) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const { keycloak, registered } = useContext(AuthContext)!;
  const { asmtId } = useParams();

  const asmtNumID = asmtId !== undefined ? asmtId : "";

  const qAssessment = useGetAssessment({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered,
    isPublic: isPublic,
  });

  const assessment = qAssessment.data?.assessment_doc;

  const stats = gatherStats(assessment);

  return (
    <div className={isPublic ? "container bg-light p-2 mb-5 rounded" : ""}>
      {assessment && (
        <div className="">
          <Row>
            <AssessmentPdf assessmentDoc={assessment} assessmentStats={stats} />
          </Row>
          <Row className="box-ribbon-report cat-view-heading-block border-bottom ">
            <Col>
              <h2 className="cat-view-heading text-muted  ">
                {assessment.name}
              </h2>
              <p className="lead cat-view-lead fs-6 ">
                <span className="text-gray-dark">
                  {t("compliance_policy")}: {assessment.assessment_type.name}{" "}
                </span>
              </p>
            </Col>
            <Col className="col col-lg-1 ">
              <span className="font-weight-500 text-gray-500 bold">
                {t("compliance")}
              </span>

              {}
              {assessment.result.compliance !== null ? (
                <p className="text-center">
                  <img
                    src={imgAssessmentPass}
                    className="text-center m-1"
                    width="60%"
                  />
                  {assessment.result.compliance == true ? (
                    <span className="fs-8 text-success bold">
                      <small>{t("passed")}</small>
                    </span>
                  ) : (
                    <span className="fs-8 text-danger bold">
                      <small>{t("failed")}</small>
                    </span>
                  )}
                </p>
              ) : (
                <p className="text-center">
                  <span className="fs-1 text-warning bold text-center">
                    {t("na")}
                  </span>
                </p>
              )}
            </Col>
            <Col className="col col-lg-1 text-center">
              <span className="font-weight-500 text-gray-500 bold">
                {t("ranking")}
              </span>

              {assessment.result.ranking !== null ? (
                <p className="text-center">
                  <span className="fs-1 bold text-center">
                    {prettyPrintRanking(assessment.result.ranking)}
                  </span>
                </p>
              ) : (
                <p className="text-center">
                  <span className="fs-1 text-warning bold text-center">
                    {t("na")}
                  </span>
                </p>
              )}
            </Col>
            <Col className="col-md-auto col col-lg-1 text-center">
              {assessment.published == true ? (
                <div className="ribbon-report ribbon-report-top-right">
                  <span className="bg-success">
                    {t("published").toUpperCase()}
                  </span>
                </div>
              ) : (
                <div className="ribbon-report ribbon-report-top-right">
                  <span className="bg-warning">{t("draft").toUpperCase()}</span>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col></Col>
          </Row>
          <Row className="bg-light">
            <Col className="col-md-auto col col-lg-3">
              {assessment.result.compliance !== null ? (
                assessment.result.compliance ? (
                  <img src={imgAssessmentBadgePassed} width="80%" />
                ) : (
                  <img src={imgAssessmentBadgeFailed} width="80%" />
                )
              ) : (
                <img src={imgAssessmentBadgeWip} width="80%" />
              )}
            </Col>

            <Col className="col-sm-9">
              <Row>
                <Col className="col-sm-6">
                  <Row>
                    <div className="card-title h5 py-3">
                      {t("fields.statistics")}
                    </div>
                    <Col className="text-center col-lg-2">
                      <span className="font-weight-500 fs-5 text-gray-500">
                        {t("principles")}:
                        <span className="fs-5  bold ms-2">
                          <strong>{stats.total_principles}</strong>
                        </span>
                      </span>
                      <br />
                      <span className="font-weight-500  fs-5 text-gray-500">
                        {t("criteria")}:
                        <span className="fs-5  bold ms-2">
                          <strong>{stats.total_criteria}</strong>
                        </span>
                      </span>
                    </Col>
                    <Col className="text-center col-lg-2"></Col>
                    <Col className="align-items-center col-lg-4">
                      <span className="font-weight-500  text-gray-500">
                        <strong> {t("mandatory")}</strong>
                      </span>
                      <p className="circle-70-grey">
                        <span className="fs-1 text-success bold">
                          {stats.completed_mandatory}
                        </span>
                        <span className="fs-6 text-success">
                          /{stats.total_mandatory}
                        </span>
                      </p>
                    </Col>
                    <Col className="col-md-auto col col-lg-4  align-items-center">
                      <span className="font-weight-500  text-gray-500">
                        <strong> {t("optional")}</strong>
                      </span>
                      <p className="circle-70-grey">
                        <span className="fs-1 text-warning bold">
                          {stats.completed_optional}
                        </span>
                        <span className="fs-6 text-warning">
                          /{stats.total_optional}
                        </span>
                      </p>
                    </Col>
                  </Row>
                </Col>
                <Col className="col-sm-6 py-3">
                  <Card>
                    <Card.Body>
                      <h5>{t("fields.details")}</h5>

                      <p className="media-body pb-2 mb-0 small lh-125 border-bottom border-gray">
                        <strong className="text-gray-dark">Actor:</strong>
                        <span className="px-2">{assessment.actor.name}</span>
                      </p>
                      <p className="media-body pb-2 mb-0 small lh-125 border-bottom border-gray">
                        <strong className="text-gray-dark">
                          {t("organisation")}:
                        </strong>
                        <span className="px-2">
                          {assessment.organisation.name}
                        </span>
                      </p>
                      <p className="media-body pb-2 mb-0 small lh-125 border-bottom border-gray">
                        <strong className="text-gray-dark">Subject:</strong>
                        <span className="px-2">
                          {assessment.subject.name} / ({assessment.subject.type}
                          )
                        </span>
                      </p>
                      <p className="media-body pb-2 mb-0 small lh-125">
                        <strong className="text-gray-dark">
                          {t("fields.latest_update")}:
                        </strong>
                        <span className="px-2">
                          <small>{assessment.timestamp.split(" ")[0]}</small>
                        </span>
                      </p>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className="cat-view-heading-block border-bottom">
            {assessment.principles.map((pri) => (
              <div key={pri.id}>
                <div className="m-3">
                  <h6 className="mb-0">
                    {pri.id} - {pri.name}
                  </h6>
                  <small className="text-muted">{pri.description}</small>
                </div>

                <div className="m-3">
                  <Accordion defaultActiveKey="0">
                    {pri.criteria.map((cri) => {
                      return (
                        <Accordion.Item eventKey={cri.id} key={cri.id}>
                          <Accordion.Header>
                            <div className="col-md-10 d-flex justify-content-between">
                              <div className="float-start">
                                {cri.id} - {cri.name}
                              </div>
                              <div>
                                {cri.imperative === "must" ? (
                                  <span className="ms-2 badge rounded-pill text-bg-light text-success">
                                    {cri.imperative}
                                  </span>
                                ) : (
                                  <span className="ms-2 badge rounded-pill text-bg-light text-warning">
                                    {cri.imperative}
                                  </span>
                                )}
                                {cri.metric.result === 1 ? (
                                  <span className="ms-5 align-middle ">
                                    <small className="ms-2">
                                      <strong>
                                        <span className="text-success">
                                          {t("passed")}
                                        </span>
                                      </strong>
                                    </small>
                                  </span>
                                ) : cri.metric.result === 0 ? (
                                  <span className="ms-5 align-middle ">
                                    <span className="badge badge-pill bg-danger me-1 flex-1"></span>
                                    <small className="ms-2">
                                      <strong>
                                        <span className="text-danger">
                                          {t("failed")}
                                        </span>
                                      </strong>
                                    </small>
                                  </span>
                                ) : (
                                  <span className="ms-5 align-middle">
                                    <small className="ms-2">
                                      <strong>
                                        <span className="text-warning">
                                          {t("na")}
                                        </span>
                                      </strong>
                                    </small>
                                  </span>
                                )}
                              </div>
                            </div>
                          </Accordion.Header>
                          <Accordion.Body>
                            <div>
                              <small className="text-muted">
                                {cri.description}
                              </small>
                            </div>
                            <div className="m-1">
                              {cri.metric.tests.map((test) => {
                                const params = test.params
                                  .split("|")
                                  .filter((item) => item !== "evidence");
                                return (
                                  <div key={test.id} className="mb-4">
                                    <span className="badge rounded-pill text-bg-light text-info">
                                      {test.id} - {test.name}
                                    </span>
                                    <br />
                                    <strong>Q.</strong>
                                    <span className="text-secondary p-2">
                                      {test.text.split("|")[0]}
                                    </span>
                                    <br />
                                    <strong>A.</strong>
                                    {[
                                      "binary",
                                      "Binary-Binary",
                                      "Binary-Manual",
                                      "Binary-Manual-Evidence",
                                    ].includes(test.type) ? (
                                      test.result === 1 ? (
                                        <span className="text-primary p-2">
                                          <strong>
                                            {t("yes").toUpperCase()}
                                          </strong>
                                        </span>
                                      ) : test.result === 0 ? (
                                        <span className="text-primary p-2">
                                          <strong>
                                            {t("no").toUpperCase()}
                                          </strong>
                                        </span>
                                      ) : (
                                        <span className="text-warning p-2">
                                          <strong>
                                            {t("na").toUpperCase()}
                                          </strong>
                                        </span>
                                      )
                                    ) : (
                                      <span className="text-primary p-2">
                                        {params.map((item, indx) => {
                                          return indx === params.length - 1 ? (
                                            <span className="me-4">
                                              <strong>{item}:</strong>
                                              {test.value || t("na")}
                                            </span>
                                          ) : (
                                            <span className="me-4">
                                              <strong>{item}:</strong> {t("na")}
                                            </span>
                                          );
                                        })}
                                      </span>
                                    )}

                                    <br />

                                    {test.evidence_url &&
                                      test.evidence_url?.length > 0 && (
                                        <div>
                                          {test.evidence_url.map((ev) => (
                                            <div key={ev.url}>
                                              {" "}
                                              <a href={ev.url}>
                                                <span className="p-2">
                                                  <FaArrowUpRightFromSquare />
                                                </span>
                                              </a>
                                              {ev.description && (
                                                <a
                                                  href={ev.url}
                                                  className="plain"
                                                >
                                                  <span>{ev.description}</span>
                                                </a>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      )}
                                  </div>
                                );
                              })}
                            </div>
                          </Accordion.Body>
                        </Accordion.Item>
                      );
                    })}
                  </Accordion>
                </div>
              </div>
            ))}
            {/* Assessemt Principles for loop */}
          </Row>
          {/* Row of Principles closes*/}
          <Button
            variant="secondary my-4"
            onClick={() => {
              navigate(-1);
            }}
          >
            {t("buttons.back")}
          </Button>
        </div>
      )}
      {/* Debug info here - display assessment json */}
      <DebugJSON assessment={assessment} />
    </div>
  );
};

export default AssessmentView;
