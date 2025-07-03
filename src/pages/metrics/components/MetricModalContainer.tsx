import { useState } from "react";
import { RegistryMetric } from "@/types";
import { MetricModal } from "./MetricModal";
import { MetricEditModal } from "./MetricEditModal";

interface MetricModalContainerProps {
  metric: RegistryMetric | null;
  show: boolean;
  onHide: () => void;
  mode?: "view" | "edit" | "create" | "version";
}

export function MetricModalContainer({
  metric,
  show,
  onHide,
  mode = "view",
}: MetricModalContainerProps) {
  const [currentMode, setCurrentMode] = useState<string>(mode);

  const handleEdit = () => {
    setCurrentMode("edit");
  };

  const handleCreateVersion = () => {
    setCurrentMode("version");
  };

  const handleClose = () => {
    setCurrentMode("view");
    onHide();
  };

  if (currentMode === "edit") {
    return (
      <MetricEditModal
        metric={metric}
        show={show}
        isEditing={true}
        isVersioning={false}
        onHide={handleClose}
      />
    );
  }

  if (currentMode === "version") {
    return (
      <MetricEditModal
        metric={metric}
        show={show}
        isEditing={false}
        isVersioning={true}
        onHide={handleClose}
      />
    );
  }

  if (currentMode === "create") {
    return (
      <MetricEditModal
        metric={null}
        show={show}
        isEditing={false}
        isVersioning={false}
        onHide={handleClose}
      />
    );
  }

  return (
    <MetricModal
      metric={metric}
      show={show}
      onHide={handleClose}
      onEdit={handleEdit}
      onCreateVersion={handleCreateVersion}
    />
  );
}
