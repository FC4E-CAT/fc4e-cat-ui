import React, { useContext, useEffect, useState } from "react";
import {
  useGetAllAlgorithms,
  useUpdateAlgorithmStatus,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { RegistryResource } from "@/types";
import toast from "react-hot-toast";
import SettingsLayout, { SettingsItem } from "@/components/SettingsLayout";

interface AlgorithmResource extends RegistryResource {
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

const AlgorithmsSettings: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [algorithms, setAlgorithms] = useState<AlgorithmResource[]>([]);
  const [enabledAlgorithms, setEnabledAlgorithms] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const {
    data: algorithmsData,
    fetchNextPage: algoFetchNextPage,
    hasNextPage: algoHasNextPage,
    isLoading,
    error,
  } = useGetAllAlgorithms({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const updateAlgorithmStatus = useUpdateAlgorithmStatus(keycloak?.token || "");

  useEffect(() => {
    if (algorithmsData?.pages && !loading) {
      return;
    }

    if (algorithmsData?.pages) {
      let allAlgorithms: AlgorithmResource[] = [];

      algorithmsData.pages.forEach((page) => {
        allAlgorithms = [...allAlgorithms, ...page.content];
      });

      setAlgorithms(allAlgorithms);

      const initialEnabledState: { [key: string]: boolean } = {};
      allAlgorithms.forEach((algorithm) => {
        initialEnabledState[algorithm.id] = algorithm?.enabled ?? true;
      });
      setEnabledAlgorithms(initialEnabledState);
      setLoading(false);

      if (algoHasNextPage) {
        algoFetchNextPage();
      }
    }
  }, [algorithmsData, algoHasNextPage, algoFetchNextPage, loading]);

  const handleToggleAlgorithm = async (algorithmId: string) => {
    const newEnabledState = !enabledAlgorithms[algorithmId];

    try {
      setEnabledAlgorithms((prev) => ({
        ...prev,
        [algorithmId]: newEnabledState,
      }));

      await updateAlgorithmStatus.mutateAsync({
        id: algorithmId,
        enabled: newEnabledState,
      });

      toast.success(
        `Algorithm ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledAlgorithms((prev) => ({
        ...prev,
        [algorithmId]: !newEnabledState,
      }));

      toast.error("Failed to update algorithm status. Please try again.");
      console.error("Error updating algorithm status:", error);
    }
  };

  // Convert algorithms to SettingsItem format
  const settingsItems: SettingsItem[] = algorithms.map((algorithm) => ({
    id: algorithm.id,
    label: algorithm.label,
    description: algorithm.description,
    enabled: algorithm.enabled,
    used_by_published_motivations: algorithm.used_by_published_motivations,
  }));

  return (
    <SettingsLayout
      title="Algorithms Settings"
      description="Configure which algorithms are available for metrics"
      items={settingsItems}
      enabledItems={enabledAlgorithms}
      isLoading={isLoading || loading}
      error={error}
      onToggleItem={handleToggleAlgorithm}
      itemTypeName="algorithms"
    />
  );
};

export default AlgorithmsSettings;
