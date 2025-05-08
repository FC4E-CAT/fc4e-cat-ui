import React, { Fragment } from "react";
import { Alert, Table } from "react-bootstrap";
import {
  FaArrowDown,
  FaArrowUp,
  FaArrowsAltV,
  FaExclamationTriangle,
} from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { RegistryTest } from "@/types/tests";
import TestRow from "./TestRow";
import TestVersionRow from "./TestVersionRow";

interface TestTableProps {
  tests: RegistryTest[];
  isLoading: boolean;
  sortBy: string;
  sortOrder: string;
  expandedTests: { [key: string]: boolean };
  onSortChange: (field: string) => void;
  onToggleExpand: (testId: string) => void;
  onViewTest: (testId: string) => void;
  onEditTest: (testId: string) => void;
  onCreateVersion: (testId: string) => void;
  onDeleteTest: (testId: string, name: string) => void;
}

const TestTable: React.FC<TestTableProps> = ({
  tests,
  isLoading,
  sortBy,
  sortOrder,
  expandedTests,
  onSortChange,
  onToggleExpand,
  onViewTest,
  onEditTest,
  onCreateVersion,
  onDeleteTest,
}) => {
  const { t } = useTranslation();

  const SortMarker = (field: string, sortField: string, sortOrder: string) => {
    if (field === sortField) {
      if (sortOrder === "DESC") return <FaArrowUp />;
      else if (sortOrder === "ASC") return <FaArrowDown />;
    }
    return <FaArrowsAltV className="text-secondary opacity-50" />;
  };

  if (!isLoading && tests.length === 0) {
    return (
      <Alert variant="warning" className="text-center mx-auto">
        <h3>
          <FaExclamationTriangle />
        </h3>
        <h5>{t("no_data")}</h5>
      </Alert>
    );
  }

  return (
    <Table hover>
      <thead>
        <tr className="table-light">
          <th style={{ width: "220px" }}>
            <span
              onClick={() => onSortChange("TES")}
              className="cat-cursor-pointer"
            >
              {t("fields.tes").toUpperCase()}{" "}
              {SortMarker("TES", sortBy, sortOrder)}
            </span>
          </th>
          <th>
            <span
              onClick={() => onSortChange("labelTest")}
              className="cat-cursor-pointer"
            >
              {t("fields.label")} {SortMarker("labelTest", sortBy, sortOrder)}
            </span>
          </th>
          <th className="w-50">
            <span>{t("fields.description")}</span>
          </th>
          <th>
            <span
              onClick={() => onSortChange("lastTouch")}
              className="cat-cursor-pointer text-nowrap"
            >
              {t("fields.modified")}{" "}
              {SortMarker("lastTouch", sortBy, sortOrder)}
            </span>
          </th>
          <th>
            <span>{t("motivations")}</span>
          </th>
          <th></th>
        </tr>
      </thead>
      {tests.length > 0 && (
        <tbody>
          {tests.map((item) => {
            const isExpanded = expandedTests[item.test.id] || false;
            const hasVersions =
              item.test_versions && item.test_versions.length > 0;

            return (
              <Fragment key={`fragment-${item.test.id}`}>
                <TestRow
                  test={item}
                  isExpanded={isExpanded}
                  toggleExpand={onToggleExpand}
                  onView={onViewTest}
                  onEdit={onEditTest}
                  onCreateVersion={onCreateVersion}
                  onDelete={onDeleteTest}
                />
                {isExpanded &&
                  hasVersions &&
                  item.test_versions?.map((version) => (
                    <TestVersionRow
                      key={`version-${version.test.id}`}
                      version={version}
                      onView={onViewTest}
                      onEdit={onEditTest}
                    />
                  ))}
              </Fragment>
            );
          })}
        </tbody>
      )}
    </Table>
  );
};

export default TestTable;
