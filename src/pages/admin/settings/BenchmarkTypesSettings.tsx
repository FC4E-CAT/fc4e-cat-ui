import React, { useContext, useEffect, useState } from "react";
import {
  useGetAllBenchmarkTypes,
  useUpdateBenchmarkTypeStatus,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import type { RegistryResource } from "@/types";
import toast from "react-hot-toast";
import SettingsLayout, { type SettingsItem } from "@/components/SettingsLayout";

interface BenchmarkTypeResource extends RegistryResource {
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

const BenchmarkTypesSettings: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [benchmarkTypes, setBenchmarkTypes] = useState<BenchmarkTypeResource[]>(
    [],
  );
  const [enabledTypes, setEnabledTypes] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const {
    data: benchmarkTypesData,
    fetchNextPage: btFetchNextPage,
    hasNextPage: btHasNextPage,
    isLoading,
    error,
  } = useGetAllBenchmarkTypes({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const updateBenchmarkTypeStatus = useUpdateBenchmarkTypeStatus(
    keycloak?.token || "",
  );

  useEffect(() => {
    if (benchmarkTypesData?.pages && !loading) {
      return;
    }

    if (benchmarkTypesData?.pages) {
      let allBenchmarkTypes: BenchmarkTypeResource[] = [];

      benchmarkTypesData.pages.forEach((page) => {
        allBenchmarkTypes = [...allBenchmarkTypes, ...page.content];
      });

      setBenchmarkTypes(allBenchmarkTypes);

      const initialEnabledState: { [key: string]: boolean } = {};
      allBenchmarkTypes.forEach((type) => {
        initialEnabledState[type.id] = type?.enabled ?? true;
      });
      setEnabledTypes(initialEnabledState);
      setLoading(false);

      if (btHasNextPage) {
        btFetchNextPage();
      }
    }
  }, [benchmarkTypesData, btHasNextPage, btFetchNextPage, loading]);

  const handleToggleType = async (typeId: string) => {
    const newEnabledState = !enabledTypes[typeId];

    try {
      setEnabledTypes((prev) => ({
        ...prev,
        [typeId]: newEnabledState,
      }));

      await updateBenchmarkTypeStatus.mutateAsync({
        id: typeId,
        enabled: newEnabledState,
      });

      toast.success(
        `Benchmark type ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledTypes((prev) => ({
        ...prev,
        [typeId]: !newEnabledState,
      }));

      toast.error("Failed to update benchmark type status. Please try again.");
      console.error("Error updating benchmark type status:", error);
    }
  };

  // Convert benchmark types to SettingsItem format
  const settingsItems: SettingsItem[] = benchmarkTypes.map((type) => ({
    id: type.id,
    label: type.label,
    description: type.description,
    enabled: type.enabled,
    used_by_published_motivations: type.used_by_published_motivations,
  }));

  return (
    <SettingsLayout
      title="Benchmark Types Settings"
      description="Configure which benchmark types are available for metrics"
      items={settingsItems}
      enabledItems={enabledTypes}
      isLoading={isLoading || loading}
      error={error}
      onToggleItem={handleToggleType}
      itemTypeName="benchmark types"
    />
  );
};

export default BenchmarkTypesSettings;
