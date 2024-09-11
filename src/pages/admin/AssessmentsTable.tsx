import React, { useState, useContext, useEffect } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import {
  useGetAdminAssessment,
  useGetAdminAssessmentById,
  useGetAssessmentTypes,
} from "@/api";
import { AuthContext } from "@/auth";
import { AssessmentAdminListItem } from "@/types";
import { Button, Form, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaFileExport } from "react-icons/fa";

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

  const [asmtNumID, setAsmtNumID] = useState<string>("");
  const qAssessment = useGetAdminAssessmentById({
    id: asmtNumID,
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

  useEffect(() => {
    if (qAssessment.data) {
      const jsonString = `data:text/json;chatset=utf-8,${encodeURIComponent(
        JSON.stringify(qAssessment.data.assessment_doc, null, 2),
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = `${qAssessment.data.assessment_doc.id}.json`;

      link.click();
    }
  }, [qAssessment]);

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
        <OverlayTrigger placement="top" overlay={tooltipExport}>
          <Button
            variant="light"
            size="sm"
            onClick={() => setAsmtNumID(row.id)}
          >
            <FaFileExport />
          </Button>
        </OverlayTrigger>
      ),
      width: "110px",
    },
  ];

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Assessments
            <p className="lead cat-view-lead">
              Manage all Assessments as administrator.
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right"></div>
      </div>
      <Form className="mb-2">
        <div className="row cat-view-search-block border-bottom">
          <div className="col col-lg-6">
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
          <div className="col col-lg-6">
            <div className="d-flex justify-content-center">
              <Form.Control
                id="searchField"
                name="filterText"
                aria-label="Search Input"
                placeholder="Search ..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
              />
              <Button variant="primary" onClick={handleClear} className="ms-4">
                Clear
              </Button>
            </div>
          </div>
        </div>
      </Form>
      <DataTable
        columns={columns}
        data={filteredData}
        defaultSortFieldId={1}
        highlightOnHover
        theme="default"
        customStyles={customStyles}
        pagination
      />
      <div className="row py-3 p-4">
        <div className="col"></div>
      </div>
    </div>
  );
};

export default AssessmentsTable;
