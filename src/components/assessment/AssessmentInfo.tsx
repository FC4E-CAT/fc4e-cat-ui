/**
 * Component to display and edit the assessment info 
 */

import { InputGroup, Form, Col, Row } from "react-bootstrap"
import { AssessmentSubject } from "../../types"
import { FaCog, FaLock } from "react-icons/fa"

interface AssessmentInfoProps {
    id?: string
    name: string
    actor: string
    type: string
    org: string
    orgId: string
    subject: AssessmentSubject
    published: boolean
    onNameChange(name: string): void
    onSubjectChange(subject: AssessmentSubject): void
    onPublishedChange(published: boolean): void
}



export const AssessmentInfo = (props: AssessmentInfoProps) => {
    
    function handleSubjectChange(fieldName: string, value: string) {
        return {
            ...props.subject,
            [fieldName]:value
        }
    }

    return (
        <div className="px-4 pb-2 pt-3 yellow-gradient mb-4 ">
            {props.id && <div><strong>Assesment id:</strong> {props.id}</div>}
            <Row>
                {props.id &&
                    <Col>
                        <InputGroup className="mb-3">
                            <InputGroup.Text id="label-info-name">
                                Id:
                            </InputGroup.Text>
                            <Form.Control id="input-info-name" placeholder={props.id} aria-describedby="label-info-name" readOnly />
                        </InputGroup>
                    </Col>
                }
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="label-info-name">
                            Name:
                        </InputGroup.Text>
                        <Form.Control 
                            id="input-info-name" 
                            value={props.name}
                            onChange={(e)=>{props.onNameChange(e.target.value)}}
                            aria-describedby="label-info-name" 
                        />
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="label-info-type">
                            Type:
                        </InputGroup.Text>
                        <Form.Control id="input-info-type" placeholder={props.type} aria-describedby="label-info-type" readOnly />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="label-info-actor">
                            Actor:
                        </InputGroup.Text>
                        <Form.Control id="input-info-actor" placeholder={props.actor} aria-describedby="label-info-actor" readOnly />
                    </InputGroup>
                </Col>
                <Col xs={6}>
                    <InputGroup className="mb-3">
                        <InputGroup.Text id="label-info-org">
                            Organisation:
                        </InputGroup.Text>
                        <Form.Control id="input-info-org" placeholder={props.org} aria-describedby="label-info-org" readOnly />
                        <InputGroup.Text className="text-white bg-secondary"><span className="me-2">id: </span><strong>{props.orgId}</strong></InputGroup.Text>
                    </InputGroup>
                </Col>
            </Row>
            <Row className="mt-2">
                <span><FaCog color="orange" className="me-2"/>Subject of assessment <em>(Object, Entity or Service)</em>:</span>
            </Row>
            <Row className="m-2">
                <Col>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-subject-type">
                            Subject Type:
                        </InputGroup.Text>
                        <Form.Control 
                            id="input-info-subject-type" 
                            value={props.subject.type}
                            onChange={(e)=>{props.onSubjectChange(handleSubjectChange("type",e.target.value))}}
                            aria-describedby="label-info-subject-type"
                        />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-subject-id">
                            Subject Id:
                        </InputGroup.Text>
                        <Form.Control 
                            id="input-info-subject-id" 
                            value={props.subject.id}
                            onChange={(e)=>{props.onSubjectChange(handleSubjectChange("id",e.target.value))}} 
                            aria-describedby="label-info-subject-id"
                        />
                    </InputGroup>
                </Col>
                <Col xs={6}>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-subject-name">
                            Subject Name:
                        </InputGroup.Text>
                        <Form.Control 
                            id="input-info-subject-name" 
                            value={props.subject.name}
                            onChange={(e)=>{props.onSubjectChange(handleSubjectChange("name",e.target.value))}}
                            aria-describedby="label-info-subject-name"
                        />
                    </InputGroup>
                </Col>
            </Row>
            

            
            <Row className="mt-2">
                <span><FaLock color="crimson" className="me-2"/>You can choose to make the assessment public <em>(It is private by default)</em>:</span>
            </Row>
            <Row className="m-2">
                <Col>
                    
                    <Form.Check 
                        id="input-info-published"
                        label="This Assessment is Public and Licensed with CC 4.0 BY"
                        checked={props.published}
                        onChange={(e)=>{props.onPublishedChange(e.target.checked)}} 
                        className={`${props.published ? 'text-success' : 'text-muted'}`}
                        
                    />
                    
                </Col>
            </Row>

        </div>

    );
}