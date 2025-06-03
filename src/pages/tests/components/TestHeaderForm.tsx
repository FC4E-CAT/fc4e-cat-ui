import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import { TestInput } from "@/types/tests";

interface TestHeaderFormProps {
  isEditing?: boolean;
  isVersioning?: boolean;
  showErrors: boolean;
  test: TestInput;
  setTest: (value: TestInput) => void;
}

function TestHeaderForm(props: TestHeaderFormProps) {
  const { isEditing, isVersioning, test, showErrors, setTest } = props;
  const { t } = useTranslation();

  return (
    <div className="test-header-form">
      <div className="row gx-4 gy-0">
        <div className="col-md-6">
          <div className="form-group">
            <label
              htmlFor="input-test-tes"
              className="d-flex align-items-center form-group-label"
            >
              <span className="fw-medium">{t("fields.tes").toUpperCase()}</span>
              <span className="ms-1 text-danger">*</span>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-tes">{t("page_tests.tip_tes")}</Tooltip>
                }
              >
                <span className="ms-1">
                  <FaInfoCircle style={{ marginBottom: "3px" }} />
                </span>
              </OverlayTrigger>
            </label>
            <input
              className={`form-control ${showErrors && test.tes === "" ? "is-invalid" : ""}`}
              type="text"
              id="input-test-tes"
              disabled={isEditing || isVersioning}
              onChange={(e) => {
                setTest({
                  ...test,
                  tes: e.target.value,
                });
              }}
              value={test.tes}
            />
            {showErrors && test.tes === "" && (
              <div className="invalid-feedback">{t("required")}</div>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="form-group">
            <label
              htmlFor="input-test-label"
              className="d-flex align-items-center form-group-label"
            >
              <span className="fw-medium">{t("fields.label")}</span>
              <span className="ms-1 text-danger">*</span>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-label">
                    {t("page_tests.tip_label")}
                  </Tooltip>
                }
              >
                <span className="ms-1">
                  <FaInfoCircle style={{ marginBottom: "3px" }} />
                </span>
              </OverlayTrigger>
            </label>
            <input
              type="text"
              id="input-test-label"
              value={test.label}
              onChange={(e) => {
                setTest({
                  ...test,
                  label: e.target.value,
                });
              }}
              className={`form-control ${showErrors && test.label === "" ? "is-invalid" : ""}`}
            />
            {showErrors && test.label === "" && (
              <div className="invalid-feedback">{t("required")}</div>
            )}
          </div>
        </div>

        <div className="col-12">
          <div className="form-group">
            <label
              htmlFor="input-test-description"
              className="d-flex align-items-center form-group-label"
            >
              <span className="fw-medium">{t("fields.description")}</span>
              <OverlayTrigger
                placement="top"
                overlay={
                  <Tooltip id="tooltip-description">
                    {t("page_tests.tip_description")}
                  </Tooltip>
                }
              >
                <span className="ms-1">
                  <FaInfoCircle style={{ marginBottom: "3px" }} />
                </span>
              </OverlayTrigger>
            </label>
            <textarea
              id="input-test-description"
              rows={2}
              value={test.description}
              onChange={(e) => {
                setTest({
                  ...test,
                  description: e.target.value,
                });
              }}
              className={`form-control ${
                showErrors && test.description === "" ? "is-invalid" : ""
              }`}
              style={{ minHeight: "60px" }}
            />
            {showErrors && test.description === "" && (
              <div className="invalid-feedback">{t("required")}</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TestHeaderForm;
