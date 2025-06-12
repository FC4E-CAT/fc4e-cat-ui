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
import { useParams, useLocation, useNavigate } from "react-router-dom";
import TestModalContainer from "./TestModalContainer";

function CreateTest() {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { keycloak, registered } = useContext(AuthContext)!;

  const navigate = useNavigate();

  const location = useLocation();
  const { testId } = useParams();
  const isEditing = location.pathname.includes("/edit-test/");
  const isVersioning = location.pathname.includes("/create-version-test/");

  const { t } = useTranslation();

  const [testMethods, setTestMethods] = useState<RegistryResource[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("all");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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

  const addNewParams = (numberOfParams = 1) => {
    const tmpParams = Array.from(
      { length: numberOfParams },
      (_, i) => i + 1,
    )?.map((i) => ({
      id: i,
      name: "",
      text: "",
      tooltip: "",
    }));

    setParams(tmpParams);
  };

  // Only fetch test data if we're editing or creating a version
  const { data } = useGetTest({
    id: ((isEditing || isVersioning) && testId) || "",
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // Watch for changes in test_method_id to update the selected method
  useEffect(() => {
    if (!testId && test.test_method_id) {
      const method = testMethods.find((m) => m.id === test.test_method_id);
      if (method) {
        addNewParams(method?.num_params);
      }
    }
  }, [test.test_method_id, testMethods, testId, data]);

  useEffect(() => {
    if (testId && data) {
      // split params
      const paramNames = data?.test_params?.split("|") || [];
      const paramTexts = data?.test_question?.split("|") || [];
      const paramTips = data?.tool_tip?.split("|") || [];
      const tmpParams: TestParam[] = [];

      // Check if evidence exists in the loaded parameters
      const evidenceIndex = paramNames?.indexOf("evidence");
      const evidenceExists = evidenceIndex !== -1;
      setHasEvidence(evidenceExists);

      // Add all parameters except evidence to the params array
      for (let i = 0; i < paramNames.length; i++) {
        if (paramNames[i] !== "evidence") {
          tmpParams.push({
            id: i,
            name: paramNames[i],
            text: paramTexts[i],
            tooltip: paramTips[i],
          });
        }
      }

      setTest(data);
      setParams(tmpParams);
    }
  }, [data, testId]);

  const updateParamTestDef = () => {
    let names = "";
    let text = "";
    let tips = "";
    const subParams = params.filter((item) => item.name !== "evidence");

    // iterate over params (minus evidence) and update test def
    subParams.forEach((item) => {
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

  const getSearchString = () => {
    if (filterType === "manual") {
      return "Manual";
    } else if (filterType === "automated") {
      return "Auto";
    }
    return "";
  };

  const {
    data: testMethodsData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
    refetch: refetchTestMethods,
  } = useGetAllTestMethods({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: getSearchString(),
    enabled: true,
  });

  useEffect(() => {
    if (testMethods?.length > 0 && !test.test_method_id) {
      setTest((prevTest) => ({
        ...prevTest,
        test_method_id: testMethods[0]?.id || "",
      }));
    }
  }, [test.test_method_id, testMethods]);

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
        testMethod?.label !== "String-Manual" &&
        testMethod?.label !== "Binary-Auto",
    );

    setTestMethods(tmpTestMethods);
  }, [testMethodsData, tmHasNextPage, tmFetchNextPage]);

  function handleValidate() {
    setShowErrors(true);
    return test.tes !== "" && test.label !== "";
  }

  const mutateCreate = useCreateTest(keycloak?.token || "", test);

  const mutateUpdate = useUpdateTest(keycloak?.token || "", testId || "", test);

  const mutateCreateVersion = useCreateTestVersion({
    token: keycloak?.token || "",
    id: testId || "",
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
        alert.current = {
          message: t("page_tests.toast_create_success"),
        };
        // Navigate back to tests list after successful creation
        setTimeout(() => {
          navigate("/admin/tests");
        }, 1500);
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
        alert.current = {
          message: t("page_tests.toast_update_success"),
        };
        // Navigate back to tests list after successful update
        setTimeout(() => {
          navigate("/admin/tests");
        }, 1500);
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
        alert.current = {
          message: t("page_tests.toast_create_version_success"),
        };
        // Navigate back to tests list after successful version creation
        setTimeout(() => {
          navigate("/admin/tests");
        }, 1500);
      });
    toast.promise(promise, {
      loading: t("page_tests.toast_create_version_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  const areParamsDisabled =
    test.test_method_id === "" || test.test_method_id == null;

  // Add handlers for search and filter functionality with debounce
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setIsSearching(true);

    // Clear previous timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounce (300ms)
    searchTimeoutRef.current = setTimeout(() => {
      const filteredMethods =
        testMethodsData?.pages
          .flatMap((page) => page.content)
          .filter((method) =>
            method.label.toLowerCase().includes(value.toLowerCase()),
          ) || [];
      setTestMethods(filteredMethods);
      setIsSearching(false);
    }, 300);
  };

  const handleFilterChange = (value: string) => {
    setSearchTerm("");
    setFilterType(value);
    setIsSearching(true);
    refetchTestMethods().finally(() => {
      setIsSearching(false);
    });
  };

  return (
    <TestModalContainer
      id={testId}
      isEditing={isEditing}
      isVersioning={isVersioning}
      testMethods={testMethods}
      showErrors={showErrors}
      test={test}
      params={params}
      hasEvidence={hasEvidence}
      areParamsDisabled={areParamsDisabled}
      searchTerm={searchTerm}
      filterType={filterType}
      isSearching={isSearching}
      setTest={setTest}
      setHasEvidence={setHasEvidence}
      updateParam={updateParam}
      handleValidate={handleValidate}
      handleCreate={handleCreate}
      handleUpdate={handleUpdate}
      handleCreateNewVersion={handleCreateNewVersion}
      handleSearchChange={handleSearchChange}
      handleFilterChange={handleFilterChange}
    />
  );
}

export default CreateTest;
