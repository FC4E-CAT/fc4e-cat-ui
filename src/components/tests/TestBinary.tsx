/**
 * Component to display and edit a specific binary test
 */

// import { useState } from "react"
import { Form } from "react-bootstrap"
import { EvidenceURLS } from "../EvidenceURLS"
import { AssessmentTest } from "../../types"


interface AssessmentTestProps {
    test: AssessmentTest
    principleId: string,
    criterionId: string,
    onTestChange(principleId:string, criterionId:string, newTest: AssessmentTest): void
}



export const TestBinary = (props:AssessmentTestProps) => {

    // const [value, setValue] = useState<number>(test.value)

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        let result: 0|1 = 0
        if (event.target.value === "1") result = 1
        const newTest = {...props.test,"value": result}
        
        props.onTestChange(props.principleId,props.criterionId,newTest);
    };


    function onURLChange(newURLS:string[]){
        const newTest = {...props.test,"evidence_url":newURLS}
        props.onTestChange(props.principleId,props.criterionId,newTest);
    }

    return (
        <div className="mt-4">
            <h5>Test {props.test.id}: {props.test.name} </h5>
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
                    onChange={handleValueChange}
                />
                <Form.Check
                    inline
                    label="No"
                    value="0"
                    name="test-input-group"
                    type="radio"
                    id="test-check-no"
                    onChange={handleValueChange}
                />
                </div>
                
                <EvidenceURLS 
                    urls={props.test.evidence_url}
                    onListChange={onURLChange}
                />

                <div className="text-muted mt-2 border-top align-right">
                    <small><em>Test Result: </em>
                    { props.test.value !== null
                    ? <strong>{props.test.value}</strong>
                    : <span><strong>Unknown</strong> - Please answer the question above</span>
                    }
                    </small>
                </div>
            </Form>
           
        </div>

    );
}