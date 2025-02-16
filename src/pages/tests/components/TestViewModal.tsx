import {
    useGetAllTestMethods,
    useGetTest,
  } from "@/api/services/registry";
  import { AuthContext } from "@/auth";
  import { RegistryResource, RegistryTest } from "@/types";
  import { TestDefinitionInput, TestHeaderInput, TestParam } from "@/types/tests";
  import { useContext, useEffect, useState } from "react";
  import {
    Modal,
    Button,
   
  } from "react-bootstrap";
  import { useTranslation } from "react-i18next";
  import {FaFile} from "react-icons/fa";
  
  interface TestViewModalProps {
    id: string;
    show: boolean;
    onHide: () => void;
  }
  /**
   * Modal component for creating a test
   */
  export function TestViewModal(props: TestViewModalProps) {
   
    const { t } = useTranslation();
    const { keycloak, registered } = useContext(AuthContext)!;
    const [testMethods, setTestMethods] = useState<RegistryResource[]>([]);
    const [testHeader, setTestHeader] = useState<TestHeaderInput>({
      label: "",
      tes: "",
      description: "",
    });
  
    const [testDefinition, setTestDefinition] = useState<TestDefinitionInput>({
      test_method_id: "",
      label: "",
      param_type: "onscreen",
      test_params: "",
      test_question: "",
      tool_tip: "",
    });
    const [params, setParams] = useState<TestParam[]>([]);
  
  
  
    const { data } = useGetTest({
      id: props.id,
      token: keycloak?.token || "",
      isRegistered: registered,
    });
  
    useEffect(() => {
      if (props.id && data) {
        // split params
        const paramNames = data.test_definition.test_params.split("|");
        const paramTexts = data.test_definition.test_question.split("|");
        const paramTips = data.test_definition.tool_tip.split("|");
        const params: TestParam[] = [];
        if (
          paramNames.length == paramTexts.length &&
          paramNames.length == paramTips.length
        ) {
          for (let i = 0; i < paramNames.length; i++) {
            params.push({
              id: i,
              name: paramNames[i],
              text: paramTexts[i],
              tooltip: paramTips[i],
            });
          }
        }
        setTestHeader(data.test);
        setTestDefinition(data.test_definition);
        setParams(params);
      }
    }, [data, props.id]);
    
   
  
    return (
      <Modal
        show={props.show}
        onHide={props.onHide}
        size="lg"
        aria-labelledby="contained-modal-title-vcenter"
        centered
      >
        <Modal.Header className="" closeButton>
          <Modal.Title id="contained-modal-title-vcenter">
             <FaFile className="me-2" /> {t("page_tests.view_test")}
        </Modal.Title>
        </Modal.Header>
        <Modal.Body>    
        <div className="cat-view-heading-block row">
          <div className="col">
            <h6 className="text-muted cat-view-heading ">
              {testHeader.tes} - {testHeader.label} /{" "}
              {testDefinition.test_method_id}
              {data}
            </h6>
            <p className="cat-view-lead">{testHeader.description}</p>
          </div>
          <div className="col-md-auto  cat-heading-right"></div>
        </div>
        </Modal.Body>
             <Modal.Footer className="">
        <Button className="btn-secondary btn-sm" onClick={props.onHide}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    );
  }
  