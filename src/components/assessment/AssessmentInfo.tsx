/**
 * Component to display and edit the assessment info 
 */

import { InputGroup, Form, Col, Row } from "react-bootstrap"

interface AssessmentInfoProps {
    id?: string
    name: string
    actor: string
    type: string
    org: string
    orgId: string
}

export const AssessmentInfo = (props: AssessmentInfoProps) => {
    return (
        <div>
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
                        <Form.Control id="input-info-name" aria-describedby="label-info-name" />
                    </InputGroup>
                </Col>
            </Row>

            <Row>
                <Col>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-type">
                            Type:
                        </InputGroup.Text>
                        <Form.Control id="input-info-type" placeholder={props.type} aria-describedby="label-info-type" readOnly />
                    </InputGroup>
                </Col>
                <Col>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-actor">
                            Actor:
                        </InputGroup.Text>
                        <Form.Control id="input-info-actor" placeholder={props.actor} aria-describedby="label-info-actor" readOnly />
                    </InputGroup>
                </Col>
                <Col xs={6}>
                    <InputGroup className="mb-3" size="sm">
                        <InputGroup.Text id="label-info-org">
                            Organisation:
                        </InputGroup.Text>
                        <Form.Control id="input-info-org" placeholder={props.org} aria-describedby="label-info-org" readOnly />
                        <InputGroup.Text className="text-white bg-secondary"><span className="me-2">id: </span><strong>{props.orgId}</strong></InputGroup.Text>
                    </InputGroup>


                </Col>

            </Row>

        </div>

    );
}