import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "@/auth";
import {
  useGetReportDefinitions,
  useGenerateReport,
  useGetReportFilters,
  useExportReport,
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
  const [selectedFilters, setSelectedFilters] = useState<
    Record<string, string[]>
  >({});
  const [appliedFilters, setAppliedFilters] = useState<
    Record<string, string[]>
  >({});

  const {
    data: reportDefinitions,
    isLoading: isLoadingDefinitions,
    error: definitionsError,
  } = useGetReportDefinitions({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const { data: reportFilters } = useGetReportFilters({
    reportDefinitionId: selectedReportDefinition,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const generateReportMutation = useGenerateReport(keycloak?.token || "");
  const exportReportMutation = useExportReport(keycloak?.token || "");

  const handleGenerateReportForDefinition = useCallback(
    async (definitionId: string, filters?: Record<string, string[]>) => {
      if (!isInitialLoad) {
        setIsGenerating(true);
      }

      try {
        const filterParams: Record<string, string[]> = {};
        const filtersToUse = filters || selectedFilters;

        Object.entries(filtersToUse).forEach(([filterName, filterValues]) => {
          if (filterValues.length > 0) {
            filterParams[filterName] = filterValues;
          }
        });

        const result = await generateReportMutation.mutateAsync({
          reportId: definitionId,
          reportRequest: {
            filters: filterParams,
          },
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
    },
    [isInitialLoad, selectedFilters, generateReportMutation],
  );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedReportDefinition, reportData, isInitialLoad]);

  const handleReportDefinitionChange = (definitionId: string) => {
    setSelectedReportDefinition(definitionId);
    setReportData(null);
    setIsInitialLoad(false);

    if (definitionId) {
      handleGenerateReportForDefinition(definitionId, {});
      setSelectedFilters({});
      setAppliedFilters({});
    }
  };

  const handleFilterChange = (
    filterName: string,
    valueId: string,
    checked: boolean,
  ) => {
    setSelectedFilters((prev) => {
      const current = prev[filterName] || [];
      const newFilters = checked
        ? { ...prev, [filterName]: [...current, valueId] }
        : { ...prev, [filterName]: current.filter((id) => id !== valueId) };

      return newFilters;
    });
  };

  const handleApplyFilters = () => {
    if (selectedReportDefinition) {
      setAppliedFilters(selectedFilters);
      handleGenerateReportForDefinition(
        selectedReportDefinition,
        selectedFilters,
      );
    }
  };

  const handleClearAllFilters = () => {
    setSelectedFilters({});
    setAppliedFilters({});
    // Regenerate report without filters
    if (selectedReportDefinition) {
      handleGenerateReportForDefinition(selectedReportDefinition, {});
    }
  };

  const handleExportReport = async () => {
    if (!selectedReportDefinition || !reportData) {
      toast.error("No report data available for export");
      return;
    }

    // Reset any previous mutation state
    exportReportMutation.reset();

    try {
      const response = await exportReportMutation.mutateAsync({
        reportId: selectedReportDefinition,
        reportData: reportData,
      });

      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers["content-disposition"];

      let filename = `CAT_report_${reportData.rows_dimension}_${reportData.columns_dimension}.csv`;

      if (contentDisposition) {
        filename = contentDisposition
          ?.split("filename=")[1]
          ?.split(";")[0]
          ?.replace(/"/g, "")
          ?.trim();
      }

      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast.success("Report exported successfully");
    } catch (error) {
      console.error("Error exporting report:", error);
      toast.error("Failed to export report");
    }
  };

  return (
    <Reports
      reportDefinitions={reportDefinitions || []}
      selectedReportDefinition={selectedReportDefinition}
      reportData={reportData}
      isLoadingDefinitions={isLoadingDefinitions}
      isGenerating={isGenerating}
      isExporting={exportReportMutation.isPending}
      definitionsError={definitionsError}
      reportFilters={reportFilters || []}
      selectedFilters={selectedFilters}
      appliedFilters={appliedFilters}
      onReportDefinitionChange={handleReportDefinitionChange}
      onFilterChange={handleFilterChange}
      onApplyFilters={handleApplyFilters}
      onClearAllFilters={handleClearAllFilters}
      onExportReport={handleExportReport}
    />
  );
}

export default ReportsContainer;
