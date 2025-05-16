import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaBars, FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { RegistryTest } from "@/types/tests";
import { MotivationRefList } from "@/components/MotivationRefList";

interface TestVersionRowProps {
  version: RegistryTest;
  onView: (testId: string) => void;
  onEdit: (testId: string) => void;
}

const TestVersionRow: React.FC<TestVersionRowProps> = ({
  version,
  onView,
  onEdit,
}) => {
  const { t } = useTranslation();

  const tooltipView = (
    <Tooltip id="tip-view">{t("page_tests.tip_view")}</Tooltip>
  );
  const tooltipEdit = (
    <Tooltip id="tip-edit">{t("page_tests.tip_edit")}</Tooltip>
  );

  return (
    <tr className="version-row">
      <td className="align-middle">
        <div className="d-flex flex-column gap-2 ps-4">
          <span className="w-25 badge bg-secondary px-2 py-1 text-center text-truncate">
            {version.test.version ? `v${version.test.version}` : "old version"}
          </span>
          <span style={{ fontSize: "0.64rem" }} className="text-muted">
            {version.test.id}
          </span>
        </div>
      </td>
      <td className="align-middle">{version.test.label}</td>
      <td className="align-middle">{version.test.description}</td>
      <td className="align-middle">
        <small>{version.test.last_touch?.split("T")[0]}</small>
      </td>
      <td>
        {version?.used_by_motivations ? (
          <MotivationRefList motivations={version.used_by_motivations || []} />
        ) : null}
      </td>
      <td>
        <div className="d-flex flex-nowrap">
          <OverlayTrigger placement="top" overlay={tooltipView}>
            <Button
              className="btn btn-light btn-sm m-1"
              onClick={() => onView(version.test.id)}
            >
              <FaBars />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipEdit}>
            <Button
              className="btn btn-light btn-sm m-1"
              onClick={() => onEdit(version.test.id)}
            >
              <FaEdit />
            </Button>
          </OverlayTrigger>
        </div>
      </td>
    </tr>
  );
};

export default TestVersionRow;
