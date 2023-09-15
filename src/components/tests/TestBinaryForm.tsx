/**
 * Component to display and edit a specific binary test
 */

// import { useState } from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { EvidenceURLS } from "../EvidenceURLS"
import { AssessmentTest, TestBinary } from "@/types"
import { useState } from "react"
import { FaCaretLeft, FaCaretRight, FaRegQuestionCircle } from "react-icons/fa"


interface AssessmentTestProps {
    test: TestBinary
    principleId: string,
    criterionId: string,
    onTestChange(principleId: string, criterionId: string, newTest: AssessmentTest): void
}



export const TestBinaryForm = (props: AssessmentTestProps) => {

    const [showHelp, setShowHelp] = useState(false);

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let result: 0 | 1 = 0;
        let value: boolean = false;
        if (event.target.value === "1") {
            value = true;
            result = 1;
        }
        const newTest = { ...props.test, "result": result, "value": value };

        props.onTestChange(props.principleId, props.criterionId, newTest);
    };


    function onURLChange(newURLS: string[]) {
        const newTest = { ...props.test, "evidence_url": newURLS };
        props.onTestChange(props.principleId, props.criterionId, newTest);
    }

    return (
       
            <div className="mt-4">
                <Row>
                    <Col><h5>Test {props.test.id}: {props.test.name} </h5></Col>
                    <Col xs={3} className="text-end" >
                        <Button className="mb-2" variant="light" size="sm" onClick={()=>{setShowHelp(!showHelp)}}>
                            {showHelp 
                             ? <span><FaCaretRight/><FaRegQuestionCircle /></span>
                             : <span><FaCaretLeft /><FaRegQuestionCircle /></span>
                            }
                        </Button>
                    </Col>
                </Row>
                
                <Row>
                    <Col>
                <Form>
                    <div className="border rounded p-4 shadow-sm">
                        <h5 className="mb-4"><strong className="me-2">Question: </strong>{props.test.text}</h5>
                        <span className="h5 me-4"><strong>Answer: </strong></span>
                        <Form.Check
                            inline
                            label="Yes"
                            value="1"
                            name="test-input-group"
                            type="radio"
                            id="test-check-yes"
                            checked={props.test.value === true}
                            onChange={handleValueChange}
                        />
                        <Form.Check
                            inline
                            label="No"
                            value="0"
                            name="test-input-group"
                            type="radio"
                            id="test-check-no"
                            checked={props.test.value === false}
                            onChange={handleValueChange}
                        />
                    </div>

                    {props.test.evidence_url !== undefined &&
                        <EvidenceURLS
                            urls={props.test.evidence_url}
                            onListChange={onURLChange}
                        />
                    }

                    <div className="text-muted mt-2 border-top align-right">
                        <small><em>Test Result: </em>
                            {props.test.result !== null
                                ? <strong>{props.test.result}</strong>
                                : <span><strong>Unknown</strong> - Please answer the question above</span>
                            }
                        </small>
                    </div>
                </Form>
                </Col>

                {/* Show guidance */}
                {showHelp && props.test.guidance &&
                <Col className="border-start px-4 mb-2 ms-2">
                  <h3>Guidance {props.test.guidance.id}</h3>
                  <p style={{whiteSpace:'pre-line'}}>
                    {props.test.guidance.description}
                  </p>
                </Col>
                }
                
            </Row>

            </div>
           


    );
}