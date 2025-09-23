import type { LastRun } from "@/types";
import { Alert, Col, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface AutoTestDetailsProps {
  variant?: string;
  details: LastRun;
}

export const AutoTestDetails = (props: AutoTestDetailsProps) => {
  const { t } = useTranslation();

  const fmtDate = props.details.timestamp
    ? new Date(props.details.timestamp)
        .toLocaleString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: false,
          timeZone: "UTC",
        })
        .replace(/,\s*/, " ") + " (UTC)"
    : "";
  return (
    <Alert variant={props.variant ? props.variant : "light"}>
      <Row>
        <Col>
          <small>
            <strong>{t("automated_test_details")}:</strong>
          </small>
        </Col>
        <Col xs="auto">
          <small>
            {t("last_run")}: {fmtDate}
          </small>
        </Col>
      </Row>
      <div className="mt-1">
        <small>{props.details.message}</small>
      </div>
    </Alert>
  );
};
