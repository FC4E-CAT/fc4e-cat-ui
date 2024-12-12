import { Metric } from "@/types";
import { useTranslation } from "react-i18next";

export function CriterionProgress({ metric }: { metric: Metric }) {
  const tests = metric.tests;
  let filled = 0;
  const testMarkers = [];
  const { t } = useTranslation();

  for (const item of tests) {
    if (item.result !== null) {
      if (item.result === 0) {
        testMarkers.push(
          <span
            key={item.id}
            className="badge badge-pill bg-danger me-1 flex-1"
          >
            {" "}
          </span>,
        );
      }
      if (item.result === 1) {
        testMarkers.push(
          <span
            key={item.id}
            className="badge badge-pill bg-success me-1 flex-1"
          >
            {" "}
          </span>,
        );
      }
      filled = filled + 1;
    } else {
      testMarkers.push(
        <span
          key={item.id}
          className="badge badge-pill bg-secondary me-1 flex-1"
        >
          {" "}
        </span>,
      );
    }
  }

  return (
    <div>
      {testMarkers}
      <small className="ms-2">
        <strong>
          {metric.result === null ? (
            <span className="text-secondary">
              {t("page_assessment_edit.progress")}
            </span>
          ) : (
            <>
              {metric.result === 1 ? (
                <span className="text-success">{t("pass")}</span>
              ) : (
                <span className="text-danger">{t("fail")}</span>
              )}
            </>
          )}
        </strong>
      </small>
    </div>
  );
}
