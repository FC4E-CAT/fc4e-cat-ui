import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { TemplateAPI, ValidationAPI } from '../api';
import { Assessment } from '../types';
import { useParams } from "react-router";
import { Tab, Row, Col, Nav } from 'react-bootstrap';
import { AssessmentInfo } from '../components/assessment/AssessmentInfo';
import { TestBinary } from '../components/tests/TestBinary';

type AssessmentEditProps = {
  createMode?: boolean;
}


/** AssessmentEdit page that holds the main body of an assessment */
const AssessmentEdit = ({ createMode = true }: AssessmentEditProps) => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [assessment, setAssesment] = useState<Assessment>();

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

  // save the template_doc into the assessment state variable
  useEffect(() => {
    if (qTemplate.data && qValidation.data) {
      const data = qTemplate.data.template_doc;
      data.organisation.id = qValidation.data.organisation_id;
      data.organisation.name = qValidation.data.organisation_name;
      setAssesment(data);
    }

  }, [qTemplate.data, qValidation]);


  

  return (
    <div className="mt-4">
      <h2> {(createMode ? "Create" : "Edit") + " Assessment"}</h2>
      <br/>
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
          />

          <hr/>

          <Tab.Container id="left-tabs-example" defaultActiveKey="first">
            <Row>
              <Col sm={3}>
                <Nav variant="pills" className="flex-column">
                  <Nav.Item>
                    <Nav.Link eventKey="first">Criterion 1
                    </Nav.Link>
                  </Nav.Item>
                </Nav>
              </Col>
              <Col sm={9}>
                <Tab.Content >
                  <Tab.Pane className="text-dark" eventKey="first">

                     {/* For the time being the component is used with hardcoded props to display its functionality
                         The props are going to be dynamically handled from json in next implementation
                     */}
                    <h3>Principle 1</h3>
                    <h4 className="border-bottom pb-2">Criterion 1</h4>
                    <TestBinary text="Do you regularly maintain the metadata for your object ?" value={0} />
      

                  </Tab.Pane>
                  <Tab.Pane className="text-dark" eventKey="second">Tests for Criterion 2</Tab.Pane>
                </Tab.Content>
              </Col>
            </Row>
          </Tab.Container>


          {/* Debug info here - display assessment json */}

          <div className="mt-5">
            <button type="button" className="btn btn-warning btn-sm"
            onClick={()=>setDebug(!debug)}
            >Debug JSON</button>
            <br />
            { debug &&
              <pre className="p-2 bg-dark text-white"><code>{JSON.stringify(assessment, null, 2)}</code></pre>
            }
            </div>





        </>
      }
    </div>
  );

}

export default AssessmentEdit;
