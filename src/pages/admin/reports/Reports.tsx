import { useCallback, useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Table,
  Spinner,
  Alert,
  Button,
  OverlayTrigger,
  Tooltip,
  Dropdown,
  Badge,
} from "react-bootstrap";
import { FaDownload, FaTimes } from "react-icons/fa";
import { HiOutlineFilter } from "react-icons/hi";
import type {
  ReportResponse,
  ReportDefinition,
  ReportFilter,
} from "@/api/services/reports";
import styles from "./Reports.module.css";

interface ReportsProps {
  reportDefinitions: ReportDefinition[];
  selectedReportDefinition: string;
  reportData: ReportResponse | null;
  isLoadingDefinitions: boolean;
  isGenerating: boolean;
  isExporting: boolean;
  definitionsError: unknown;
  reportFilters: ReportFilter[];
  selectedFilters: Record<string, string[]>;
  appliedFilters: Record<string, string[]>;
  onReportDefinitionChange: (definitionId: string) => void;
  onFilterChange: (
    filterName: string,
    valueId: string,
    checked: boolean,
  ) => void;
  onApplyFilters: () => void;
  onClearAllFilters: () => void;
  onExportReport: () => void;
}

function Reports({
  reportDefinitions,
  selectedReportDefinition,
  reportData,
  isLoadingDefinitions,
  isGenerating,
  isExporting,
  definitionsError,
  reportFilters,
  selectedFilters,
  appliedFilters,
  onReportDefinitionChange,
  onFilterChange,
  onApplyFilters,
  onClearAllFilters,
  onExportReport,
}: ReportsProps) {
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const getAppliedFilterCount = useCallback(() => {
    return Object.values(appliedFilters).reduce(
      (total, values) => total + values.length,
      0,
    );
  }, [appliedFilters]);

  const appliedFilterCount = getAppliedFilterCount();

  const getStatusClass = (cellValue: string) => {
    const value = cellValue.toLowerCase().trim();

    if (!value) {
      return styles["status-na"];
    }

    if (value === "pass") {
      return styles["status-pass"];
    } else if (value === "fail") {
      return styles["status-fail"];
    } else if (value === "in progress" || value === "in-progress") {
      return styles["status-in-progress"];
    } else if (value === "n/a" || value === "na") {
      return styles["status-na"];
    }
    // Default to N/A for unknown values
    else {
      return styles["status-na"];
    }
  };

  const getDisplayValue = (cellValue: string) => {
    const value = cellValue.trim();
    if (!value) {
      return "N/A";
    }
    const lowerValue = value.toLowerCase();
    const knownStatuses = ["pass", "fail", "in progress", "n/a"];
    if (!knownStatuses.includes(lowerValue)) {
      return "N/A";
    }
    return cellValue;
  };

  if (isLoadingDefinitions) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading report definitions...</p>
        </div>
      </Container>
    );
  }

  if (definitionsError) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          Error loading report definitions. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom mb-3">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Reports
            <p className="lead cat-view-lead mb-0">Generate and view reports</p>
          </h2>
        </div>
      </div>

      <div className="mb-4 px-2">
        <div className={styles["form-container"]}>
          <Form.Group>
            <Form.Label className="fw-semibold fs-5 mb-1">
              Select a Report
            </Form.Label>
            <div className="d-flex align-items-center">
              <Form.Select
                value={selectedReportDefinition}
                onChange={(e) => onReportDefinitionChange(e.target.value)}
                disabled={isGenerating}
                className="me-3"
              >
                {reportDefinitions.map((definition) => (
                  <option key={definition.id} value={definition.id}>
                    {definition.label}
                  </option>
                ))}
              </Form.Select>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tip-export-pdf">
                    Export report as CSV file
                  </Tooltip>
                }
              >
                <Button
                  className={styles["export-button"]}
                  disabled={isGenerating || isExporting || !reportData}
                  onClick={onExportReport}
                  size="sm"
                  variant="secondary"
                >
                  {isExporting ? (
                    <Spinner as="span" size="sm" />
                  ) : (
                    <FaDownload />
                  )}
                </Button>
              </OverlayTrigger>
            </div>
          </Form.Group>
        </div>
      </div>

      {isGenerating && (
        <Row className="my-5">
          <Col className="d-flex justify-content-center align-items-center">
            <Spinner animation="border" className="me-2" />
            <h5 className="mt-1">Generating report...</h5>
          </Col>
        </Row>
      )}

      {reportData && (
        <div className="px-2">
          <div>
            <div className={styles["table-container"]}>
              <div className="p-3 pb-0">
                <h6>{reportData.description}</h6>
              </div>

              <div className="px-3">
                <span className="badge bg-info me-2">
                  Rows: {reportData.rows_dimension}
                </span>
                <span className="badge bg-info me-2">
                  Columns: {reportData.columns_dimension}
                </span>
                <span className="badge bg-info">
                  Value Type: {reportData.value_type}
                </span>
              </div>

              <div className={styles["table-responsive"]}>
                <Table className={styles["report-table"]}>
                  <thead>
                    <tr>
                      <th className={styles["filter-header"]}>
                        <div className={styles["dropdown-menu-wrapper"]}>
                          <Dropdown
                            show={showFilterDropdown}
                            onToggle={() =>
                              setShowFilterDropdown(!showFilterDropdown)
                            }
                            style={{
                              zIndex: 10,
                              position: "absolute",
                              transform: "none",
                              height: "1000px",
                            }}
                          >
                            <Dropdown.Toggle
                              as="div"
                              className={styles["filter-toggle"]}
                              onClick={() =>
                                setShowFilterDropdown(!showFilterDropdown)
                              }
                            >
                              <HiOutlineFilter
                                className={styles["filter-icon"]}
                              />
                              {appliedFilterCount > 0 && (
                                <Badge
                                  bg="primary"
                                  className={styles["filter-badge"]}
                                >
                                  {appliedFilterCount}
                                </Badge>
                              )}
                            </Dropdown.Toggle>

                            <Dropdown.Menu className={styles["filter-menu"]}>
                              <div className={styles["filter-header-text"]}>
                                <span>Filters</span>

                                <Button
                                  variant="primary"
                                  size="sm"
                                  onClick={() => {
                                    onApplyFilters();
                                    setShowFilterDropdown(false);
                                  }}
                                  className={styles["apply-filters-button"]}
                                >
                                  Apply Filters
                                </Button>
                              </div>

                              <div className={styles["dropdown-content"]}>
                                {reportFilters.map((filter) => (
                                  <div
                                    key={filter.definition.name}
                                    className={styles["filter-group"]}
                                  >
                                    <div
                                      className={styles["filter-group-title"]}
                                    >
                                      {filter.definition.name
                                        .replace("_", " ")
                                        .toUpperCase()}
                                    </div>
                                    {filter.values.map((value) => (
                                      <Form.Check
                                        className={styles["filter-checkbox"]}
                                        key={value.id}
                                        id={`filter-${filter.definition.name}-${value.id}`}
                                        label={value.label}
                                        checked={
                                          selectedFilters[
                                            filter.definition.name
                                          ]?.includes(value.id) || false
                                        }
                                        onChange={(e) =>
                                          onFilterChange(
                                            filter.definition.name,
                                            value.id,
                                            e.target.checked,
                                          )
                                        }
                                        type="checkbox"
                                      />
                                    ))}
                                  </div>
                                ))}
                              </div>
                            </Dropdown.Menu>
                          </Dropdown>
                        </div>
                        {appliedFilterCount > 0 && (
                          <Button
                            variant="link"
                            size="sm"
                            onClick={onClearAllFilters}
                            className={styles["clear-filters"]}
                          >
                            <FaTimes /> Clear All
                          </Button>
                        )}
                      </th>
                      {reportData.columns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.length === 0 ||
                    reportData.data.length === 0 ? (
                      <tr>
                        <td
                          colSpan={reportData.columns.length + 1}
                          className={styles["no-data-message"]}
                        >
                          <div className="text-center py-4">
                            <div className="text-muted">
                              <h6>No data available</h6>
                              <p className="mb-0">
                                {appliedFilterCount > 0
                                  ? "No results match the selected filters. Try adjusting your filter criteria."
                                  : "No data available for this report configuration."}
                              </p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      reportData.rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                          <td className={styles["row-header"]}>{row}</td>
                          {reportData.data[rowIndex]?.map(
                            (cellValue, cellIndex) => (
                              <td key={cellIndex}>
                                <span
                                  className={`${styles["status-badge"]} ${getStatusClass(cellValue)}`}
                                >
                                  {getDisplayValue(cellValue)}
                                </span>
                              </td>
                            ),
                          )}
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;
