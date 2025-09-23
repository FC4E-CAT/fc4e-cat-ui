import React, { useContext, useEffect, useState } from "react";
import {
  useGetAllMetricTypes,
  useUpdateMetricTypeStatus,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import type { RegistryResource } from "@/types";
import toast from "react-hot-toast";
import SettingsLayout, { type SettingsItem } from "@/components/SettingsLayout";

interface MetricTypeResource extends RegistryResource {
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

const MetricTypesSettings: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [metricTypes, setMetricTypes] = useState<MetricTypeResource[]>([]);
  const [enabledTypes, setEnabledTypes] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const {
    data: metricTypesData,
    fetchNextPage: mtFetchNextPage,
    hasNextPage: mtHasNextPage,
    isLoading,
    error,
  } = useGetAllMetricTypes({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const updateMetricTypeStatus = useUpdateMetricTypeStatus(
    keycloak?.token || "",
  );

  useEffect(() => {
    if (metricTypesData?.pages && !loading) {
      return;
    }

    if (metricTypesData?.pages) {
      let allMetricTypes: MetricTypeResource[] = [];

      metricTypesData.pages.forEach((page) => {
        allMetricTypes = [...allMetricTypes, ...page.content];
      });

      setMetricTypes(allMetricTypes);

      const initialEnabledState: { [key: string]: boolean } = {};
      allMetricTypes.forEach((type) => {
        initialEnabledState[type.id] = type?.enabled ?? true;
      });
      setEnabledTypes(initialEnabledState);
      setLoading(false);

      if (mtHasNextPage) {
        mtFetchNextPage();
      }
    }
  }, [metricTypesData, mtHasNextPage, mtFetchNextPage, loading]);

  const handleToggleType = async (typeId: string) => {
    const newEnabledState = !enabledTypes[typeId];

    try {
      setEnabledTypes((prev) => ({
        ...prev,
        [typeId]: newEnabledState,
      }));

      await updateMetricTypeStatus.mutateAsync({
        id: typeId,
        enabled: newEnabledState,
      });

      toast.success(
        `Metric type ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledTypes((prev) => ({
        ...prev,
        [typeId]: !newEnabledState,
      }));

      toast.error("Failed to update metric type status. Please try again.");
      console.error("Error updating metric type status:", error);
    }
  };

  // Convert metric types to SettingsItem format
  const settingsItems: SettingsItem[] = metricTypes.map((type) => ({
    id: type.id,
    label: type.label,
    description: type.description,
    enabled: type.enabled,
    used_by_published_motivations: type.used_by_published_motivations,
  }));

  return (
    <SettingsLayout
      title="Metric Types Settings"
      description="Configure which metric types are available for metrics"
      items={settingsItems}
      enabledItems={enabledTypes}
      isLoading={isLoading || loading}
      error={error}
      onToggleItem={handleToggleType}
      itemTypeName="metric types"
    />
  );
};

export default MetricTypesSettings;
