import React, { useContext, useEffect, useState } from "react";
import {
  useGetAllTestMethods,
  useUpdateTestMethodStatus,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { RegistryResource } from "@/types";
import toast from "react-hot-toast";
import SettingsLayout, { SettingsItem } from "@/components/SettingsLayout";

interface TestMethodResource extends RegistryResource {
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

const TestMethodsSettings: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [testMethods, setTestMethods] = useState<TestMethodResource[]>([]);
  const [enabledMethods, setEnabledMethods] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const {
    data: testMethodsData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
    isLoading,
    error,
  } = useGetAllTestMethods({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  const updateTestMethodStatus = useUpdateTestMethodStatus(
    keycloak?.token || "",
  );

  useEffect(() => {
    if (testMethodsData?.pages && !loading) {
      return;
    }

    if (testMethodsData?.pages) {
      let allTestMethods: TestMethodResource[] = [];

      testMethodsData.pages.forEach((page) => {
        allTestMethods = [...allTestMethods, ...page.content];
      });

      setTestMethods(allTestMethods);

      const initialEnabledState: { [key: string]: boolean } = {};
      allTestMethods.forEach((method) => {
        initialEnabledState[method.id] = method?.enabled ?? true;
      });
      setEnabledMethods(initialEnabledState);
      setLoading(false);

      if (tmHasNextPage) {
        tmFetchNextPage();
      }
    }
  }, [testMethodsData, tmHasNextPage, tmFetchNextPage, loading]);

  const handleToggleMethod = async (methodId: string) => {
    const newEnabledState = !enabledMethods[methodId];

    try {
      setEnabledMethods((prev) => ({
        ...prev,
        [methodId]: newEnabledState,
      }));

      await updateTestMethodStatus.mutateAsync({
        id: methodId,
        enabled: newEnabledState,
      });

      toast.success(
        `Test method ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledMethods((prev) => ({
        ...prev,
        [methodId]: !newEnabledState,
      }));

      toast.error("Failed to update test method status. Please try again.");
      console.error("Error updating test method status:", error);
    }
  };

  // Convert test methods to SettingsItem format
  const settingsItems: SettingsItem[] = testMethods.map((method) => ({
    id: method.id,
    label: method.label,
    description: method.description,
    enabled: method?.enabled,
    used_by_published_motivations: method?.used_by_published_motivations,
  }));

  return (
    <SettingsLayout
      title="Test Methods Settings"
      description="Configure which test methods users can select"
      items={settingsItems}
      enabledItems={enabledMethods}
      isLoading={isLoading || loading}
      error={error}
      onToggleItem={handleToggleMethod}
      itemTypeName="test methods"
    />
  );
};

export default TestMethodsSettings;
