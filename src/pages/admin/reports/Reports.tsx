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
} from "react-bootstrap";
import { FaDownload } from "react-icons/fa";
import type { ReportResponse, ReportDefinition } from "@/api/services/reports";
import styles from "./Reports.module.css";

interface ReportsProps {
  reportDefinitions: ReportDefinition[];
  selectedReportDefinition: string;
  reportData: ReportResponse | null;
  isLoadingDefinitions: boolean;
  isGenerating: boolean;
  definitionsError: unknown;
  onReportDefinitionChange: (definitionId: string) => void;
}

function Reports({
  reportDefinitions,
  selectedReportDefinition,
  reportData,
  isLoadingDefinitions,
  isGenerating,
  definitionsError,
  onReportDefinitionChange,
}: ReportsProps) {
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
                  <Tooltip id="tip-export-pdf">Export report as PDF</Tooltip>
                }
              >
                <Button
                  className={styles["export-button"]}
                  disabled={isGenerating || !reportData}
                  onClick={() => {}}
                  size="sm"
                  variant="secondary"
                >
                  <FaDownload />
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
        <Row className="px-2">
          <Col>
            <div className={styles["table-container"]}>
              <div className="p-3 pb-0">
                <h5>{reportData.description}</h5>
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
                      <th></th>
                      {reportData.columns.map((column, index) => (
                        <th key={index}>{column}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.rows.map((row, rowIndex) => (
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
                    ))}
                  </tbody>
                </Table>
              </div>
            </div>
          </Col>
        </Row>
      )}
    </div>
  );
}

export default Reports;
