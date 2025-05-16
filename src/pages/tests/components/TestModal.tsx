import {
  useCreateTest,
  useGetAllTestMethods,
  useGetTest,
  useUpdateTest,
  useCreateTestVersion,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { AlertInfo, RegistryResource } from "@/types";
import { TestInput, TestParam } from "@/types/tests";
import { useContext, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import TestModalContainer from "./TestModalContainer";

interface TestModalProps {
  id: string;
  show: boolean;
  isEditing?: boolean;
  isVersioning?: boolean;
  onHide: () => void;
}

function TestModal(props: TestModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const [testMethods, setTestMethods] = useState<RegistryResource[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [test, setTest] = useState<TestInput>({
    label: "",
    tes: "",
    description: "",
    test_method_id: "",
    label_test_definition: "",
    param_type: "onscreen",
    test_params: "",
    test_question: "",
    tool_tip: "",
  });

  const [params, setParams] = useState<TestParam[]>([]);
  const [hasEvidence, setHasEvidence] = useState<boolean>(false);

  const addNewParam = () => {
    const id = params.length > 0 ? params[params.length - 1].id + 1 : 1;
    setParams([...params, { id: id, name: "", text: "", tooltip: "" }]);
  };

  const { data } = useGetTest({
    id: props.id,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    if (props.id && data) {
      // split params
      const paramNames = data?.test_params?.split("|") || [];
      const paramTexts = data?.test_question?.split("|") || [];
      const paramTips = data?.tool_tip?.split("|") || [];
      const params: TestParam[] = [];

      // Check if evidence exists in the loaded parameters
      const evidenceIndex = paramNames?.indexOf("evidence");
      const evidenceExists = evidenceIndex !== -1;
      setHasEvidence(evidenceExists);

      // Add all parameters except evidence to the params array
      for (let i = 0; i < paramNames.length; i++) {
        if (paramNames[i] !== "evidence") {
          params.push({
            id: i,
            name: paramNames[i],
            text: paramTexts[i],
            tooltip: paramTips[i],
          });
        }
      }

      console.log("data - TestModal", data);

      setTest(data);
      setParams(params);
    }
  }, [data, props.id]);

  const updateParamTestDef = () => {
    let names = "";
    let text = "";
    let tips = "";
    const subParams = params.filter((item) => item.name !== "evidence");

    // iterate over params (minus evidence) and update test def
    subParams.map((item) => {
      names === ""
        ? (names = item.name)
        : item?.name && (names = names + "|" + item.name);
      text === ""
        ? (text = item.text)
        : item?.text && (text = text + "|" + item.text);
      tips === ""
        ? (tips = item.tooltip)
        : item?.tooltip && (tips = tips + "|" + item.tooltip);
    });

    // Add evidence parameter if toggle is on
    if (hasEvidence) {
      names = names === "" ? "evidence" : names + "|evidence";
    }

    setTest((test) => ({
      ...test,
      test_question: text,
      test_params: names,
      tool_tip: tips,
    }));
  };

  const updateParam = (id: number, field: keyof TestParam, value: string) => {
    setParams((prevParams) =>
      prevParams.map((param) =>
        param.id === id ? { ...param, [field]: value } : param,
      ),
    );
  };

  const removeParam = (id: number) => {
    setParams(params.filter((item) => item.id !== id));
  };

  const {
    data: testMethodsData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
  } = useGetAllTestMethods({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    setShowErrors(false);
    if (props.id === "") {
      setTest({
        label: "",
        tes: "",
        description: "",
        test_method_id: "",
        label_test_definition: "",
        param_type: "onscreen",
        test_params: "",
        test_question: "",
        tool_tip: "",
      });
      setParams([]);
    }
  }, [props.show, props.id]);

  useEffect(() => {
    // gather all test methods
    let tmpTestMethods: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the metric types array
    if (testMethodsData?.pages) {
      testMethodsData.pages.map((page) => {
        tmpTestMethods = [...tmpTestMethods, ...page.content];
      });
      if (tmHasNextPage) {
        tmFetchNextPage();
      }
    }

    tmpTestMethods = tmpTestMethods?.filter(
      (testMethod) =>
        testMethod?.label !== "String-Auto" &&
        testMethod?.label !== "String-Manual",
    );

    setTestMethods(tmpTestMethods);
  }, [testMethodsData, tmHasNextPage, tmFetchNextPage]);

  function handleValidate() {
    setShowErrors(true);
    return test.tes !== "" && test.label !== "";
  }

  const mutateCreate = useCreateTest(keycloak?.token || "", test);

  const mutateUpdate = useUpdateTest(keycloak?.token || "", props.id, test);

  const mutateCreateVersion = useCreateTestVersion({
    token: keycloak?.token || "",
    id: props.id,
    test,
  });

  function handleCreate() {
    updateParamTestDef();
    const promise = mutateCreate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_tests.toast_create_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_tests.toast_create_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleUpdate() {
    updateParamTestDef();
    const promise = mutateUpdate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_tests.toast_update_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_tests.toast_update_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleCreateNewVersion() {
    updateParamTestDef();
    const promise = mutateCreateVersion
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_tests.toast_create_version_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_tests.toast_create_version_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  const areParamsDisabled =
    test.test_method_id === "" || test.test_method_id == null;

  return (
    <TestModalContainer
      id={props.id}
      show={props.show}
      isEditing={props.isEditing}
      isVersioning={props.isVersioning}
      onHide={props.onHide}
      testMethods={testMethods}
      showErrors={showErrors}
      test={test}
      params={params}
      hasEvidence={hasEvidence}
      areParamsDisabled={areParamsDisabled}
      setTest={setTest}
      setHasEvidence={setHasEvidence}
      addNewParam={addNewParam}
      updateParam={updateParam}
      removeParam={removeParam}
      handleValidate={handleValidate}
      handleCreate={handleCreate}
      handleUpdate={handleUpdate}
      handleCreateNewVersion={handleCreateNewVersion}
    />
  );
}

export default TestModal;
