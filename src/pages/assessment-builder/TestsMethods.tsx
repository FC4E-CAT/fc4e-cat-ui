import { useContext, useMemo, useState } from "react";
import styles from "./AssessmentBuilder.module.css";
import { AuthContext } from "@/auth";
import { useGetAllTestMethods } from "@/api/services/registry";
import type { RegistryResource } from "@/types";
import usePublish from "@/custom-hooks/usePubSub/usePublish";
import {
  LoadTestMethod,
  TestMethodId,
} from "@/custom-hooks/usePubSub/events/assessmentBuilder";
import useSubscribe from "@/custom-hooks/usePubSub/useSubscribe";
import { TestIcon } from "@/components";

function TestsMethods() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [selectedTestMethodId, setSelectedTestMethodId] =
    useState("pid_graph:8D79984F");
  const [filterType, setFilterType] = useState("all");

  const { publish: sendTestMethodId } = usePublish(TestMethodId.type);

  const getSearchString = () => {
    if (filterType === "manual") {
      return "Manual";
    } else if (filterType === "automated") {
      return "Auto";
    }
    return "";
  };

  const { data: testMethodsData } = useGetAllTestMethods({
    size: 100,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: getSearchString(),
    enabled: true,
  });

  // Extract test methods from the paginated data structure
  const testMethods: RegistryResource[] = useMemo(
    () => testMethodsData?.pages?.flatMap((page) => page.content) || [],
    [testMethodsData?.pages],
  );

  useSubscribe<string>(
    LoadTestMethod.type,
    (testMethodLabel) => {
      const testMethodId = testMethods.find(
        (method) =>
          method.label?.toLowerCase() === testMethodLabel?.toLowerCase(),
      )?.id;
      setSelectedTestMethodId(testMethodId || "pid_graph:8D79984F");
    },
    [testMethods, setSelectedTestMethodId],
  );

  const filteredTestMethods = testMethods.filter((method) => {
    const matchesSearch =
      method?.friendly_label?.toLowerCase() || method.label.toLowerCase();

    if (filterType === "all") return matchesSearch;
    if (filterType === "manual")
      return matchesSearch && method?.label?.toLowerCase().includes("manual");
    if (filterType === "automated")
      return matchesSearch && !method?.label?.toLowerCase().includes("manual");

    return matchesSearch;
  });

  return (
    <div className="mb-3">
      <h4>Select a Test Method</h4>
      {/* Search and Filter */}
      <div className="mb-1">
        {/* Compact Filter Options */}
        <div className="d-flex gap-1 justify-content-center my-2">
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="filterAll"
              name="filterType"
              value="all"
              checked={filterType === "all"}
              onChange={() => setFilterType("all")}
            />
            <label className="fw-medium small" htmlFor="filterAll">
              All
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="filterManual"
              name="filterType"
              value="manual"
              checked={filterType === "manual"}
              onChange={() => setFilterType("manual")}
            />
            <label className="fw-medium small" htmlFor="filterManual">
              Manual
            </label>
          </div>
          <div className="form-check form-check-inline">
            <input
              className="form-check-input"
              type="radio"
              id="filterAuto"
              name="filterType"
              value="automated"
              checked={filterType === "automated"}
              onChange={() => setFilterType("automated")}
            />
            <label className="fw-medium small" htmlFor="filterAuto">
              Auto
            </label>
          </div>
        </div>
      </div>

      {/* Test Methods List - Compact */}
      <div className={styles["test-methods-list"]}>
        {filteredTestMethods?.map((method) => (
          <div
            key={method.id}
            className={`${styles["test-method-item"]} ${
              selectedTestMethodId === method.id ? styles["selected"] : ""
            }`}
            onClick={() => {
              setSelectedTestMethodId(method.id);
              sendTestMethodId(
                TestMethodId.type,
                method.id || "pid_graph:8D79984F",
              );
            }}
          >
            <div className={styles["method-name"]}>
              <TestIcon test={method.label} />
              <span className="ms-2">
                {method?.friendly_label || method.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default TestsMethods;
