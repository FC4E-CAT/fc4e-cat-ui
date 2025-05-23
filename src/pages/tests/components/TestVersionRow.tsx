import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaBars, FaEdit } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { MotivationReference } from "@/types";
import { MotivationRefList } from "@/components/MotivationRefList";

interface TestVersionRowProps {
  id: string;
  label: string;
  description: string;
  last_touch?: string;
  type_algorithm_label?: string;
  version?: string;
  used_by_motivations?: MotivationReference[];
  onView?: (testId: string) => void;
  onEdit?: (testId: string) => void;
}

const TestVersionRow: React.FC<TestVersionRowProps> = ({
  id,
  version,
  label,
  description,
  last_touch,
  type_algorithm_label,
  used_by_motivations,
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
          <span
            className="badge bg-secondary px-2 py-1 text-center text-truncate"
            style={{ width: "fit-content" }}
          >
            {version ? `v${version}` : "old version"}
          </span>
          <span style={{ fontSize: "0.64rem" }} className="text-muted">
            {id}
          </span>
        </div>
      </td>
      <td className="align-middle">{label}</td>
      <td className="align-middle">{description}</td>
      <td className="align-middle">
        {last_touch ? (
          <small>{last_touch?.split("T")[0]}</small>
        ) : (
          type_algorithm_label && <span>{type_algorithm_label}</span>
        )}
      </td>
      <td>
        {used_by_motivations ? (
          <MotivationRefList motivations={used_by_motivations || []} />
        ) : null}
      </td>
      <td>
        <div className="d-flex flex-nowrap">
          {onView && (
            <OverlayTrigger placement="top" overlay={tooltipView}>
              <Button
                className="btn btn-light btn-sm m-1"
                onClick={() => onView(id)}
              >
                <FaBars />
              </Button>
            </OverlayTrigger>
          )}
          {onEdit && (
            <OverlayTrigger placement="top" overlay={tooltipEdit}>
              <Button
                className="btn btn-light btn-sm m-1"
                onClick={() => onEdit(id)}
              >
                <FaEdit />
              </Button>
            </OverlayTrigger>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TestVersionRow;
