import React, { useState, useContext } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useGetAdminAssessment, useGetAssessmentTypes } from "@/api";
import { AuthContext } from "@/auth";
import { AssessmentAdminListItem } from "@/types";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaEye, FaFileExport, FaCheckCircle } from "react-icons/fa";

const tooltipView = <Tooltip id="tooltip">View Assessment</Tooltip>;
const tooltipExport = <Tooltip id="tooltip">Export Assessment</Tooltip>;

// Custom styles for the table
const customStyles = {
  headCells: {
    style: {
      color: "#202124",
      fontSize: "16px",
      backgroundColor: "#F4F6F8",
    },
  },
  rows: {
    style: {
      fontSize: "14px",
    },
  },
};

const AssessmentsTable: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;

  const { data } = useGetAdminAssessment({
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

  const { data: typeOptions } = useGetAssessmentTypes({
    token: keycloak?.token || "",
    isRegistered: registered || true,
  });

  const [filterText, setFilterText] = useState("");
  const [filterType, setFilterType] = useState("");

  const handleClear = () => {
    setFilterText("");
    setFilterType("");
  };

  const filteredData =
    data?.filter((assessment: AssessmentAdminListItem) => {
      const matchesText =
        assessment.name.toLowerCase().includes(filterText.toLowerCase()) ||
        assessment.user_id.toLowerCase().includes(filterText.toLowerCase()) ||
        assessment.subject_name
          .toLowerCase()
          .includes(filterText.toLowerCase()) ||
        assessment.organisation
          .toLowerCase()
          .includes(filterText.toLowerCase());

      const matchesType = filterType
        ? assessment.type.toLowerCase() === filterType.toLowerCase()
        : true;

      return matchesText && matchesType;
    }) || [];

  const subTypeHeader = (
    <>
      Subject
      <br />
      Type / Name
    </>
  );

  const nameCreatedOnHeader = (
    <div className="row">
      NName
      <div className="row">
        <span
          style={{
            color: "gray",
            display: "block",
            lineHeight: "1",
            fontSize: "14px",
          }}
        >
          Created On
        </span>
      </div>
    </div>
  );

  const columns: TableColumn<AssessmentAdminListItem>[] = [
    { name: "ID", selector: (row) => row.id, sortable: true, width: "100px" },
    {
      name: nameCreatedOnHeader,
      cell: (row) => (
        <div>
          <div>{row.name}</div>
          <div style={{ fontSize: "12px", color: "#6c757d" }}>
            {new Date(row.created_on).toLocaleDateString()}
          </div>
        </div>
      ),
      sortable: true,
      width: "200px",
    },
    {
      name: "User ID",
      selector: (row) => row.user_id.substring(0, 10),
      sortable: true,
      wrap: true,
      width: "120px",
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: subTypeHeader,
      selector: (row) => `${row.subject_type} / ${row.subject_name}`,
      sortable: true,
      width: "150px",
    },
    {
      name: "Organisation",
      selector: (row) => row.organisation,
      sortable: true,
      wrap: true,
      width: "300px",
    },
    {
      name: "Compliance",
      selector: (row) => (row.compliance ? "Yes" : "No"),
      sortable: true,
      width: "140px",
    },
    {
      name: "Actions",
      cell: (row) => (
        <div>
          <OverlayTrigger placement="top" overlay={tooltipView}>
            <Button
              variant="light"
              size="sm"
              onClick={() => (window.location.href = ``)}
              style={{ marginRight: "10px" }}
            >
              <FaEye />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipExport}>
            <Button
              variant="light"
              size="sm"
              onClick={() => exportAssessment(row)}
            >
              <FaFileExport />
            </Button>
          </OverlayTrigger>
        </div>
      ),
      width: "100px",
    },
  ];

  const exportAssessment = (assessment: AssessmentAdminListItem) => {
    const dataStr =
      "data:text/json;charset=utf-8," +
      encodeURIComponent(JSON.stringify(assessment, null, 2));
    const downloadAnchorNode = document.createElement("a");
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute(
      "download",
      `assessment_${assessment.id}.json`,
    );
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  return (
    <>
      <h4>
        <FaCheckCircle className="me-2" />
        <strong className="align-middle">All Assessments</strong>
      </h4>
      <div className="row mb-3 mt-3">
        <div className="col-4">
          <Form.Select
            id="typeFilter"
            name="typeFilter"
            aria-label="Type Filter"
            onChange={(e) => setFilterType(e.target.value)}
            value={filterType}
          >
            <option value="">All Types</option>
            {typeOptions?.map((option) => (
              <option key={option.id} value={option.name}>
                {option.name}
              </option>
            ))}
          </Form.Select>
        </div>
        <div className="col-7">
          <Form.Control
            id="searchField"
            name="filterText"
            aria-label="Search Input"
            placeholder="Search ..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="col-1">
          <Button variant="primary" onClick={handleClear}>
            Clear
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={filteredData}
        defaultSortFieldId={1}
        highlightOnHover
        theme="default"
        customStyles={customStyles}
        pagination
      />
    </>
  );
};

export default AssessmentsTable;
