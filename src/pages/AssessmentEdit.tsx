import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { TemplateAPI, ValidationAPI } from '../api';
import { Assessment, AssessmentSubject, AssessmentTest, CriterionImperative, Criterion, } from '../types';
import { useParams } from "react-router";
import { Row, Col, Alert, ProgressBar, Card, Nav } from 'react-bootstrap';
import { AssessmentInfo } from '../components/assessment/AssessmentInfo';
import { FaChartLine, FaCheckCircle } from 'react-icons/fa';
import { PiNumberSquareOneFill, PiNumberSquareTwoFill, PiNumberSquareThreeFill } from "react-icons/pi"
import { evalAssessment, evalMetric } from '../utils/Assessment';
import AssessmentTabs from '../components/assessment/AssessmentTabs';
import { ActorCard } from "../components";
import schemesImg from '../assets/thumb_scheme.png'
import authImg from '../assets/thumb_auth.png'
import serviceImg from '../assets/thumb_service.png'
import manageImg from '../assets/thumb_manage.png'
import { useCreateAssessment, useGetAssessment, useUpdateAssessment } from '../api/services/Assessment';
import { Link } from 'react-router-dom';

type AssessmentEditProps = {
  createMode?: boolean;
}


/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({ createMode = true }: AssessmentEditProps) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();
  const [templateId, setTemplateID] = useState<number>();
  const [debug, setDebug] = useState<boolean>(false);

  const { valID, asmtID } = useParams()

  // for the time being get the only one assessment template supported
  // with templateId: 1 (pid policy) and actorId: 6 (for pid owner)
  // this will be replaced in time with dynamic code


  const qValidation = ValidationAPI.useGetValidationDetails(
    { validation_id: valID!, token: keycloak?.token, isRegistered: registered }
  );

  const qTemplate = TemplateAPI.useGetTemplate(
    1, qValidation.data?.actor_id, keycloak?.token, registered)

  const asmtNumID = asmtID !== undefined ? asmtID : ""

  const qAssessment = useGetAssessment(
    { id: asmtNumID, token: keycloak?.token, isRegistered: registered }
  );

  const mutationCreateAssessment = useCreateAssessment(keycloak?.token)
  const mutationUpdateAssessment = useUpdateAssessment(keycloak?.token, asmtID)

  function handleCreateAssessment() {
    if (templateId && valID && assessment) {
      mutationCreateAssessment.mutate({
        'validation_id': parseInt(valID),
        'template_id': templateId,
        'assessment_doc': assessment
      })
    }
  }

  function handleUpdateAssessment() {
    if (assessment && asmtID) {
      mutationUpdateAssessment.mutate({
        'assessment_doc': assessment
      })
    }
  }

  // load the assessment content
  useEffect(() => {

    // if assessment hasn't been set yet
    if (!assessment) {
      // if on creative mode load template
      if (createMode && qTemplate.data && qValidation.data) {
        const data = qTemplate.data.template_doc;
        data.organisation.id = qValidation.data.organisation_id;
        data.organisation.name = qValidation.data.organisation_name;
        setAssessment(data);
        setTemplateID(qTemplate.data.id);
        // if not on create mode load assessment itself
      } else if (createMode === false && qAssessment.data) {
        const data = qAssessment.data.assessment_doc;
        setAssessment(data);
      }
    }


  }, [qTemplate.data, qValidation, assessment, createMode, qAssessment.data]);


  function handleNameChange(name: string) {
    if (assessment) {
      setAssessment({
        ...assessment,
        "name": name
      })
    }
  }

  function handleSubjectChange(subject: AssessmentSubject) {
    if (assessment) {
      setAssessment({
        ...assessment,
        "subject": subject
      })
    }
  }

  function handlePublishedChange(published: boolean) {
    if (assessment) {
      setAssessment({
        ...assessment,
        "published": published
      })
    }
  }

  function handleCriterionChange(principleID: string, criterionID: string, newTest: AssessmentTest) {
    // update criterion change
    let mandatory: (number | null)[] = [];
    let optional: (number | null)[] = [];

    if (assessment) {

      const newPrinciples = assessment.principles.map(principle => {
        if (principle.id === principleID) {
          const newCriteria = principle.criteria.map(criterion => {
            let resultCriterion: Criterion;
            if (criterion.id === criterionID) {
              const newTests = criterion.metric.tests.map(test => {
                if (test.id === newTest.id) {
                  return newTest;
                }
                return test;
              })
              let newMetric = { ...criterion.metric, "tests": newTests };
              let { result, value } = evalMetric(newMetric);
              newMetric = { ...newMetric, "result": result, "value": value }
              // create a new criterion object with updates due to changes
              resultCriterion = { ...criterion, "metric": newMetric };
            } else {
              // use the old object with no changes
              resultCriterion = criterion;
            }


            return resultCriterion;
          })

          return { ...principle, "criteria": newCriteria };
        }
        return principle;
      })

      let compliance: boolean | null;
      let ranking: number | null;

      const newAssessment = {
        ...assessment,
        "principles": newPrinciples
      }
      // update criteria result reference tables
      newAssessment.principles.forEach(principle => {
        principle.criteria.forEach(criterion => {
          if (criterion.imperative === CriterionImperative.Should) {
            mandatory.push(criterion.metric.result);
          } else {
            optional.push(criterion.metric.result);
          }
        })
      })

      console.log(mandatory, optional)

      if (mandatory.some((result) => result === null)) {
        compliance = null
      } else {
        compliance = mandatory.every((result) => result === 1)
      }


      ranking = optional.reduce((sum, result) => {
        if (sum === null || result === null) return null;
        return sum + result;
      }, 0)



      setAssessment({
        ...newAssessment,
        "result": { "compliance": compliance, "ranking": ranking }
      })


    }
  }

  // evaluate the assessment  
  let evalResult = evalAssessment(assessment);

  const [key, setKey] = useState("#options");
  const handleSelect = (key: string | null) => {
    if (key !== null) {
      setKey(key);
    }
  };

  const cardprops = [
    {
      title: "Schemes",
      link: "/validations",
      link_text: "View Schemes",
      image: schemesImg,
      description: "This is a wild card",
    },
    {
      title: "Authorities",
      link: "/test",
      link_text: "View Authorities",
      image: authImg,
      description: "This is a wild card"
    },
    {
      title: "Services",
      link: "/test",
      link_text: "View Services",
      image: serviceImg,
      description: "This is a wild card"
    },
    {
      title: "Managers",
      link: "/test",
      link_text: "View Managers",
      image: manageImg,
      description: "This is a wild card"
    }
  ];

  let current_tab = <></>
  if (key === "#options") {
    current_tab = <>
      <h6>Read about different actors in the ecosystem before starting.</h6>
      <div className="row g-4 mt-2">
        {cardprops.map((c, index) => (
          <div key={index} className="col">
            <ActorCard key={index} {...c} />
          </div>
        ))}
      </div>
    </>;
  }
  else if (key === "#submission" && assessment) {
    /* Display the Assessment header info */
    current_tab =
        <AssessmentInfo
        id={assessment.id}
        name={assessment.name}
        actor={assessment.actor.name}
        type={assessment.assessment_type.name}
        org={assessment.organisation.name}
        orgId={assessment.organisation.id}
        subject={assessment.subject}
        published={assessment.published}
        onNameChange={handleNameChange}
        onPublishedChange={handlePublishedChange}
        onSubjectChange={handleSubjectChange}
      />
  }
  else if (key === "#assessment" && assessment && evalResult) {
    current_tab = <>
    {/* provide assessment status/statistics here... */}

<Row>
  <Col>
    <Alert variant={
      evalResult.mandatoryFilled !== evalResult.totalMandatory
        ? "secondary"
        : assessment.result.compliance ? "success" : "danger"
    }
    >
      <Row>
        <Col>
          <span><FaCheckCircle className="me-2" />
            Compliance:
            {evalResult.mandatoryFilled !== evalResult.totalMandatory
              ? <span className="badge bg-secondary ms-2">UNKNOWN</span>
              : assessment.result.compliance
                ? <span className="badge bg-success ms-2">PASS</span>
                : <span className="badge bg-danger ms-2">FAIL</span>
            }

          </span>
        </Col>
        <Col>
          <span><FaChartLine className="me-2" />Ranking:</span> {assessment.result.ranking}
        </Col>
        <Col>
        </Col>
        <Col xs={2}>
          <div className="mb-2">
            <span>Mandatory: {evalResult.mandatoryFilled} / {evalResult.totalMandatory}</span>
            <ProgressBar style={{ backgroundColor: "darkgrey", height: "0.6rem" }} className="mt-1">
              <ProgressBar key="mandatory-pass" variant="success" now={evalResult.totalMandatory ? (evalResult.mandatory / evalResult.totalMandatory * 100) : 0} />
              <ProgressBar key="mandatory-fail" variant="danger" now={evalResult.totalMandatory ? (evalResult.mandatoryFilled - evalResult.mandatory) / evalResult.totalMandatory * 100 : 0} />
            </ProgressBar>

          </div>
        </Col>
        {(evalResult.totalOptional > 0) &&
          <Col xs={2}>
            <div className="mb-2">
              <span>Optional: {evalResult.optionalFilled} / {evalResult.totalOptional}</span>
              <ProgressBar style={{ backgroundColor: "darkgrey", height: "0.6rem" }} className="mt-1">
                <ProgressBar key="mandatory-pass" striped variant="success" now={evalResult.totalOptional ? (evalResult.optional / evalResult.totalOptional * 100) : 0} />
                <ProgressBar key="mandatory-fail" striped variant="danger" now={evalResult.totalOptional ? (evalResult.optionalFilled - evalResult.optional) / evalResult.totalOptional * 100 : 0} />
              </ProgressBar>
            </div>
          </Col>
        }
      </Row>

    </Alert>
  </Col>
</Row>
    <AssessmentTabs principles={assessment.principles} onTestChange={handleCriterionChange} />
    </>
  }

  return (
    <div className="mt-4">
      <h3 className='cat-view-heading'><FaCheckCircle className="me-2" /> {(createMode ? "create" : "edit") + " assessment"}
        {assessment && assessment.id && <span className="badge bg-secondary ms-2">id: {assessment?.id}</span>}
      </h3>
      {/* when template data hasn't loaded yet */}
      {(createMode && (qTemplate.isLoading || qValidation.isLoading)) || !assessment
        ? <p>Loading Assessment Body...</p>
        :
        <>
          <Card>
            <Card.Header>
              <Nav variant="tabs" className="assessment-card" defaultActiveKey="#options" activeKey={key}
                onSelect={(k) => { handleSelect(k); }}>
                <Nav.Item>
                  <Nav.Link href="#options"><span><PiNumberSquareOneFill size="25px" className="me-1"/></span>OPTIONS</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#submission"><span><PiNumberSquareTwoFill size="25px" className="me-1"/></span>SUBMISSION</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                  <Nav.Link href="#assessment"><span><PiNumberSquareThreeFill size="25px" className="me-1"/></span>ASSESSMENT</Nav.Link>
                </Nav.Item>
              </Nav>
            </Card.Header>
            <Card.Body>
              {current_tab}
            </Card.Body>
          </Card>

          {/* Add create/update button here and cancel */}

          <div className="text-end mt-2">
            {createMode &&

              <button type="button" className="btn btn-success px-5" onClick={handleCreateAssessment}
                disabled={
                  assessment.result.compliance === null
                    ? true
                    : false
                }
              >
                Create
              </button>
            }
            {!createMode &&
              <button type="button" className="btn btn-success px-5" onClick={handleUpdateAssessment}
                disabled={
                  assessment.result.compliance === null
                    ? true
                    : false
                }
              >
                Update
              </button>
            }
            <Link className="btn btn-secondary ms-2 px-5" to="/assessments">Cancel</Link>
          </div>

          {/* Debug info here - display assessment json */}
          <div className="mt-5">
            <button type="button" className="btn btn-warning btn-sm"
              onClick={() => setDebug(!debug)}
            >Debug JSON</button>
            <br />
            {debug &&
              <pre className="p-2 bg-dark text-white"><code>{JSON.stringify(assessment, null, 2)}</code></pre>
            }
          </div>





        </>
      }
    </div>
  );

}

export default AssessmentEdit;
