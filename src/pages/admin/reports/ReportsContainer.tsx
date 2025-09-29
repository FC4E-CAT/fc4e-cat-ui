import { useContext, useState, useEffect, useCallback } from "react";
import { AuthContext } from "@/auth";
import {
  useGetReportDefinitions,
  useGenerateReport,
  useGetReportFilters,
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
  }, [
    selectedReportDefinition,
    reportData,
    isInitialLoad,
    handleGenerateReportForDefinition,
  ]);

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

  return (
    <Reports
      reportDefinitions={reportDefinitions || []}
      selectedReportDefinition={selectedReportDefinition}
      reportData={reportData}
      isLoadingDefinitions={isLoadingDefinitions}
      isGenerating={isGenerating}
      definitionsError={definitionsError}
      reportFilters={reportFilters || []}
      selectedFilters={selectedFilters}
      appliedFilters={appliedFilters}
      onReportDefinitionChange={handleReportDefinitionChange}
      onFilterChange={handleFilterChange}
      onApplyFilters={handleApplyFilters}
      onClearAllFilters={handleClearAllFilters}
    />
  );
}

export default ReportsContainer;
