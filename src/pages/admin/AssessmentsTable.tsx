import React, { useContext } from "react";
import DataTable, { TableColumn } from "react-data-table-component";
import { useGetAdminAssessment } from "@/api";
import { AuthContext } from "@/auth";
import { AssessmentAdminListItem } from "@/types";
import { FaCheckCircle } from "react-icons/fa";

const AssessmentsTable: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;

  const { data, isLoading, error } = useGetAdminAssessment({
    token: keycloak?.token || "",
    isRegistered: registered || false,
  });

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

  const columns: TableColumn<AssessmentAdminListItem>[] = [
    { name: "Name", selector: (row) => row.name, sortable: true },
    // { name: "Id", selector: (row) => row.id, sortable: true },
    {
      name: "User ID",
      selector: (row) => row.user_id,
      sortable: true,
      wrap: true,
    },
    { name: "Type", selector: (row) => row.type, sortable: true },
    {
      name: "Subject Type",
      selector: (row) => row.subject_type,
      sortable: true,
    },
    {
      name: "Subject Name",
      selector: (row) => row.subject_name,
      sortable: true,
    },
    {
      name: "Organisation",
      selector: (row) => row.organisation,
      sortable: true,
      wrap: true,
      width: "200px",
    },
    {
      name: "Compliance",
      selector: (row) => (row.compliance ? "Yes" : "No"),
      sortable: true,
    },
    {
      name: "Ranking",
      selector: (row) => row.ranking?.toString() || "N/A",
      sortable: true,
      width: "110px",
    },
    {
      name: "Created On",
      selector: (row) => new Date(row.created_on).toLocaleDateString(),
      sortable: true,
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
        data={data.content}
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
