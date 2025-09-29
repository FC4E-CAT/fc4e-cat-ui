import { useContext, useState, useEffect } from "react";
import { AuthContext } from "@/auth";
import {
  useGetReportDefinitions,
  useGenerateReport,
  type ReportResponse,
} from "@/api/services/reports";
import toast from "react-hot-toast";
import Reports from "./Reports";

function ReportsContainer() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [selectedReportDefinition, setSelectedReportDefinition] =
    useState<string>("");
  const [reportData, setReportData] = useState<ReportResponse | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const {
    data: reportDefinitions,
    isLoading: isLoadingDefinitions,
    error: definitionsError,
  } = useGetReportDefinitions({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const generateReportMutation = useGenerateReport(keycloak?.token || "");

  useEffect(() => {
    if (
      reportDefinitions &&
      reportDefinitions.length > 0 &&
      !selectedReportDefinition
    ) {
      setSelectedReportDefinition(reportDefinitions[0].id);
    }
  }, [reportDefinitions, selectedReportDefinition]);

  useEffect(() => {
    if (selectedReportDefinition && !reportData && isInitialLoad) {
      handleGenerateReportForDefinition(selectedReportDefinition);
    }
  }, [selectedReportDefinition, reportData, isInitialLoad]);

  const handleReportDefinitionChange = (definitionId: string) => {
    setSelectedReportDefinition(definitionId);
    setReportData(null);
    setIsInitialLoad(false);

    if (definitionId) {
      handleGenerateReportForDefinition(definitionId);
    }
  };

  const handleGenerateReportForDefinition = async (definitionId: string) => {
    if (!isInitialLoad) {
      setIsGenerating(true);
    }

    try {
      const result = await generateReportMutation.mutateAsync({
        reportDefinitionId: definitionId,
      });
      setReportData(result);

      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (error) {
      toast.error("Failed to generate report");
      console.error("Error generating report:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Reports
      reportDefinitions={reportDefinitions || []}
      selectedReportDefinition={selectedReportDefinition}
      reportData={reportData}
      isLoadingDefinitions={isLoadingDefinitions}
      isGenerating={isGenerating}
      definitionsError={definitionsError}
      onReportDefinitionChange={handleReportDefinitionChange}
    />
  );
}

export default ReportsContainer;
