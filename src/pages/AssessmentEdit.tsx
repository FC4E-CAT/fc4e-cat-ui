import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { TemplateAPI, ValidationAPI } from '../api';
import { Assessment, AssessmentSubject, Principle, AssessmentTest } from '../types';
import { useParams } from "react-router";
import { Tab, Row, Col, Nav, Alert, ListGroup } from 'react-bootstrap';
import { AssessmentInfo } from '../components/assessment/AssessmentInfo';
import { TestBinary } from '../components/tests/TestBinary';
import { FaCheckCircle, FaFileContract } from 'react-icons/fa';

type AssessmentEditProps = {
  createMode?: boolean;
}

type AssessmentTabsProps = {
  principles: Principle[],
  onTestChange(principleId: string, criterionId: string, newTest: AssessmentTest): void
}

/** AssessmentTabs holds the tabs and test content for different criteria */
const AssessmentTabs = (props: AssessmentTabsProps) => {

  const navs: JSX.Element[] = []
  const tabs: JSX.Element[] = []

  let firstCriterionId = ""

  props.principles.forEach(principle => {



    // push principle lable to navigation list
    navs.push(<span className="mb-2" key={principle.id}>{principle.name}</span>)

    principle.criteria.forEach(criterion => {
      // grab first criterion id to make it by default active
      if (!firstCriterionId) {
        firstCriterionId = criterion.id
      }
      navs.push(<Nav.Item key={criterion.id}><Nav.Link eventKey={criterion.id}>{criterion.name}</Nav.Link></Nav.Item>)

      // tests for each criterion
      let testList: JSX.Element[] = [];

      // store state of test results
      criterion.metric.tests.forEach(test => {
        if (test.type === "binary") {
          testList.push(
            <ListGroup.Item key={test.id}>
              <TestBinary
                test={test}
                onTestChange={props.onTestChange}
                criterionId={criterion.id}
                principleId={principle.id}
              />
            </ListGroup.Item>)
        }
      })

      // add criterion content
      tabs.push(
        <Tab.Pane key={criterion.id} className="text-dark" eventKey={criterion.id}>
          {/* add a principle info box before criterion content */}
          <Alert variant="light">
            <h6>Principle {principle.id}: {principle.name}</h6>
            <small className="text-small">{principle.description}</small>
          </Alert>
          <div className="ms-2">
            <h5>Criterion {criterion.id}: {criterion.name} <span className="badge bg-sm">May</span></h5>
            <p>{criterion.description}</p>
            <ListGroup>
              {testList}
            </ListGroup>
          </div>
        </Tab.Pane>
      )
    })

  })

  return (
    <Tab.Container id="left-tabs-example" defaultActiveKey={firstCriterionId}>
      <Row>
        <Col sm={3}>
          <Nav variant="pills" className="flex-column">
            {navs}
          </Nav>
        </Col>
        <Col sm={9}>
          <Tab.Content >
            {tabs}
          </Tab.Content>
        </Col>
      </Row>
    </Tab.Container>
  )
}



/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({ createMode = true }: AssessmentEditProps) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssessment] = useState<Assessment>();

  const [debug, setDebug] = useState<boolean>(false);

  const { valID } = useParams()


  // for the time being get the only one assessment template supported
  // with templateId: 1 (pid policy) and actorId: 6 (for pid owner)
  // this will be replaced in time with dynamic code
  const qTemplate = TemplateAPI.useGetTemplate(
    1, 6, keycloak?.token, registered)

  const qValidation = ValidationAPI.useGetValidationDetails(
    { validation_id: valID!, token: keycloak?.token, isRegistered: registered }
  );

  // save the template_doc into the assessment state variable - this needs to be fired only once when the assessment is not yet prepared
  useEffect(() => {
    if (!assessment && qTemplate.data && qValidation.data) {
      const data = qTemplate.data.template_doc;
      data.organisation.id = qValidation.data.organisation_id;
      data.organisation.name = qValidation.data.organisation_name;
      setAssessment(data);
    }

  }, [qTemplate.data, qValidation, assessment]);


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
    if (assessment) {
      setAssessment({
        ...assessment,
        "principles": assessment.principles.map(principle =>
          principle.id === principleID
            ? {
              ...principle,
              "criteria": principle.criteria.map(criterion =>
                criterion.id === criterionID
                  ? {
                    ...criterion,
                    "metric": {
                      ...criterion.metric,
                      "tests": criterion.metric.tests.map(test =>
                      test.id === newTest.id
                        ? newTest : test)
                      }
                  } : criterion)
            } : principle)
      })
    }
  }



  return (
    <div className="mt-4">
      <h3 className='cat-view-heading'><FaCheckCircle /> {(createMode ? "create" : "edit") + " assessment"}</h3>
      {/* when template data hasn't loaded yet */}
      {qTemplate.isLoading || qValidation.isLoading || !assessment
        ? <p>Loading Assessment Body...</p>
        :
        <>
          {/* Display the Assessment header info */}
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

          

          <AssessmentTabs principles={assessment.principles} onTestChange={handleCriterionChange} />

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
