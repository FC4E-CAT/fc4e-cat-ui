/**
 * Component to display and edit the assessment info 
 */

import { useState } from "react"
import { Form } from "react-bootstrap"
import { EvidenceURLS } from "../EvidenceURLS"

interface TestBinaryProps {
    text: string
    value: number
}

export const TestBinary = (props: TestBinaryProps) => {

    const [value, setValue] = useState<number>(props.value)

    const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setValue(Number(value));
    };

    return (
        <div className="mt-4">
            <Form>
                <div className="border rounded p-4 shadow-sm">
                <h5 className="mb-4"><strong className="me-2">Question: </strong>{props.text}</h5>
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
                
                <EvidenceURLS urls={[]} />

                <div className="text-muted mt-2 border-top align-right"><span><em>Test Result: </em><strong>{value}</strong></span></div>
            </Form>
           
        </div>

    );
}