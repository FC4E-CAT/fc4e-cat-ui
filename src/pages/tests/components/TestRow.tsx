import React from "react";
import { Button, OverlayTrigger, Tooltip } from "react-bootstrap";
import {
  FaBars,
  FaChevronDown,
  FaChevronUp,
  FaCodeBranch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";
import { FaClipboardQuestion } from "react-icons/fa6";
import { useTranslation } from "react-i18next";
import { RegistryTest } from "@/types/tests";
import { idToColor } from "@/utils/admin";
import { MotivationRefList } from "@/components/MotivationRefList";

interface TestRowProps {
  test: RegistryTest;
  isExpanded: boolean;
  toggleExpand: (testId: string) => void;
  onView: (testId: string) => void;
  onEdit: (testId: string) => void;
  onCreateVersion: (testId: string) => void;
  onDelete: (testId: string, name: string) => void;
}

const TestRow: React.FC<TestRowProps> = ({
  test,
  isExpanded,
  toggleExpand,
  onView,
  onEdit,
  onCreateVersion,
  onDelete,
}) => {
  const { t } = useTranslation();
  const hasVersions = test.test_versions && test.test_versions.length > 0;

  const tooltipView = (
    <Tooltip id="tip-view">{t("page_tests.tip_view")}</Tooltip>
  );
  const tooltipEdit = (
    <Tooltip id="tip-edit">{t("page_tests.tip_edit")}</Tooltip>
  );
  const tooltipDelete = (
    <Tooltip id="tip-delete">{t("page_tests.tip_delete")}</Tooltip>
  );

  const tooltipCreateVersion = (
    <Tooltip id="tip-create-version">
      {t("page_tests.tip_create_version")}
    </Tooltip>
  );

  const hasMotivations = (test: RegistryTest): boolean => {
    console.log("test", test);
    return Boolean(
      test?.used_by_motivations && test.used_by_motivations?.length > 0,
    );
  };

  return (
    <tr key={test.test.id} className={isExpanded ? "opened-table-row" : ""}>
      <td
        className={
          isExpanded ? "align-middle opened-table-row" : "align-middle"
        }
      >
        <div className="d-flex justify-content-start">
          {hasVersions && (
            <div
              className="me-2 d-flex align-items-center"
              style={{ cursor: "pointer", width: "1rem" }}
              onClick={() => toggleExpand(test.test.id)}
            >
              {isExpanded ? <FaChevronDown /> : <FaChevronUp />}
            </div>
          )}
          <div>
            <FaClipboardQuestion
              size={"2.5rem"}
              style={{ color: idToColor(test.test.id) }}
            />
          </div>
          <div className="ms-2 d-flex flex-column justify-content-between">
            <div>
              {test.test.tes}{" "}
              {hasVersions && test.is_latest_version !== false && (
                <span className="ms-2 badge bg-success">
                  latest
                  {test.test.version ? ` v${test.test.version}` : ""}
                </span>
              )}
            </div>

            <div>
              <span style={{ fontSize: "0.64rem" }} className="text-muted">
                {test.test.id}
              </span>
            </div>
          </div>
        </div>
      </td>
      <td
        className={
          hasVersions && isExpanded
            ? "align-middle opened-table-row"
            : "align-middle"
        }
      >
        {test.test.label}
      </td>
      <td
        className={
          hasVersions && isExpanded
            ? "align-middle opened-table-row"
            : "align-middle"
        }
      >
        {test.test.description}
      </td>
      <td
        className={
          hasVersions && isExpanded
            ? "align-middle opened-table-row"
            : "align-middle"
        }
      >
        <small>{test.test.last_touch?.split("T")[0]}</small>
      </td>
      <td className={hasVersions && isExpanded ? "opened-table-row" : ""}>
        <MotivationRefList motivations={test.used_by_motivations || []} />
      </td>
      <td className={hasVersions && isExpanded ? "opened-table-row" : ""}>
        <div className="d-flex flex-nowrap">
          <OverlayTrigger placement="top" overlay={tooltipView}>
            <Button
              className="btn btn-light btn-sm m-1"
              onClick={() => onView(test.test.id)}
            >
              <FaBars />
            </Button>
          </OverlayTrigger>
          <OverlayTrigger placement="top" overlay={tooltipEdit}>
            <Button
              className="btn btn-light btn-sm m-1"
              onClick={() => onEdit(test.test.id)}
            >
              <FaEdit />
            </Button>
          </OverlayTrigger>

          <OverlayTrigger placement="top" overlay={tooltipCreateVersion}>
            <Button
              className="btn btn-light btn-sm m-1"
              onClick={() => onCreateVersion(test.test.id)}
            >
              <FaCodeBranch />
            </Button>
          </OverlayTrigger>

          {!hasMotivations(test) && (
            <OverlayTrigger placement="top" overlay={tooltipDelete}>
              <Button
                className="btn btn-light btn-sm m-1"
                onClick={() =>
                  onDelete(
                    test.test.id,
                    `${test.test.label} - ${test.test.tes}`,
                  )
                }
              >
                <FaTrash />
              </Button>
            </OverlayTrigger>
          )}
        </div>
      </td>
    </tr>
  );
};

export default TestRow;
