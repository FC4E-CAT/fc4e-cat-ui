import React, { useContext } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useGetAdminAssessment } from "@/api";
import { AuthContext } from "@/auth";
import { AssessmentAdminListItem } from "@/types";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
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

  const { data, isLoading, error } = useGetAdminAssessment({
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

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
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: subTypeHeader,
      selector: (row) => `${row.subject_type} / ${row.subject_name}`,
      sortable: true,
      width: "200px",
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
      width: "150px",
    },
    {
      name: "Actions",
      cell: () => (
        <div className="btn-group">
          <OverlayTrigger placement="top" overlay={tooltipView}>
            <Button
              variant="light"
              size="sm"
              onClick={() => (window.location.href = ``)}
            >
              <FaEye />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipExport}>
            <Button
              variant="light"
              size="sm"
              onClick={() => (window.location.href = ``)}
            >
              <FaFileExport />
            </Button>
          </OverlayTrigger>
        </div>
      ),
    },
  ];

  if (error) {
    return <div>Error loading assessments: {error.message}</div>;
  }

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <>
      <h4 className="cat-view-heading">
        <FaCheckCircle className="me-2" />
        All Assessments
      </h4>
      <DataTable
        columns={columns}
        data={data}
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
