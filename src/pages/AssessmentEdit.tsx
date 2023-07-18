import { useEffect, useState, useContext } from 'react';
import { AuthContext } from '../auth/AuthContext';
import { TemplateAPI } from '../api';
import { Assessment } from '../types';

/** AssessmentEdit page that holds the main body of an assessment */
function AssessmentEdit() {
    const { keycloak, registered } = useContext(AuthContext)!;
    const [assessment,setAssesment] = useState<Assessment>();

    // for the time being get the only one assessment template supported
    // with templateId: 1 (pid policy) and actorId: 6 (for pid owner)
    // this will be replaced in time with dynamic code
    const {data, isLoading } =  TemplateAPI.useGetTemplate(
      1, 6, keycloak?.token, registered)
  
    // save the template_doc into the assessment state variable
    useEffect(() => {
        if (data) {
          setAssesment(data?.template_doc);
        }
       
      }, [data]);

    return (
      <div className="mt-4">
        <h2>Create Assessment</h2>
        { isLoading 
          ? <p>Loading Assessment Body...</p> 
          : <code>{JSON.stringify(assessment)}</code>
        }
      </div>
    );
 
}

export default AssessmentEdit;
