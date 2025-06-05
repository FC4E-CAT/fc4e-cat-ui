import { OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { TestParam } from "@/types/tests";

interface TestMethodAndParamsProps {
  showErrors: boolean;
  params: TestParam[];
  hasEvidence: boolean;
  areParamsDisabled: boolean;
  setHasEvidence: (value: boolean) => void;
  updateParam: (id: number, field: keyof TestParam, value: string) => void;
}

function TestMethodAndParams(props: TestMethodAndParamsProps) {
  const {
    params,
    hasEvidence,
    areParamsDisabled,
    setHasEvidence,
    updateParam,
  } = props;

  return (
    <div className="mb-2">
      {params?.length > 0 &&
        params.map((param, index) => (
          <div key={`param-group-${param.id}`} className="mb-1">
            <div className="col-md-6 w-100">
              <div className="mb-1">
                <label
                  htmlFor="input-test-param-name"
                  className="d-flex align-items-center form-group-label"
                >
                  <span className="fw-medium">Parameter Name</span>
                  <span className="ms-1 text-danger">*</span>
                </label>
                <input
                  type="text"
                  id={`param-${param.id}-name`}
                  value={param?.name || ""}
                  onChange={(e) => {
                    updateParam(param.id, "name", e.target.value);
                  }}
                  className="form-control"
                  disabled={areParamsDisabled}
                />
              </div>

              <div className="mb-1">
                <label
                  htmlFor="input-test-param-question"
                  className="d-flex align-items-center form-group-label"
                >
                  <span className="fw-medium">Question</span>
                  <span className="ms-1 text-danger">*</span>
                </label>
                <textarea
                  id={`param-${param.id}-text`}
                  rows={2}
                  value={param?.text || ""}
                  onChange={(e) => {
                    updateParam(param.id, "text", e.target.value);
                  }}
                  className="form-control"
                  disabled={areParamsDisabled}
                />
              </div>

              <div className="mb-1">
                <label
                  htmlFor="input-test-param-help-text"
                  className="d-flex align-items-center form-group-label"
                >
                  <span className="fw-medium">Help Text</span>
                  <span className="ms-1 text-danger">*</span>
                </label>
                <textarea
                  id={`param-${param.id}-tooltip`}
                  rows={2}
                  value={param?.tooltip || ""}
                  onChange={(e) => {
                    updateParam(param.id, "tooltip", e.target.value);
                  }}
                  className="form-control"
                  disabled={areParamsDisabled}
                />
              </div>
            </div>
            {index + 1 < params.length && <hr className="my-3" />}
          </div>
        ))}
      <div className="d-flex align-items-center gap-3 mt-3">
        <div className="d-flex align-items-center">
          <span className="fw-medium form-group-label">Evidence parameter</span>
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="evidence-tooltip">
                Please provide an evidence of via a public source or URL to
                validate the information with an official reference.
              </Tooltip>
            }
          >
            <span className="ms-1">
              <FaInfoCircle className="mb-1" />
            </span>
          </OverlayTrigger>
        </div>
        {areParamsDisabled ? (
          <OverlayTrigger
            placement="top"
            overlay={
              <Tooltip id="evidence-toggle-tooltip">
                You must select a test method before adding an evidence
                parameter
              </Tooltip>
            }
          >
            <Form.Check
              aria-label="evidence-toggle"
              checked={hasEvidence}
              id="evidence-toggle"
              disabled={areParamsDisabled}
              onChange={(e) => {
                if (!areParamsDisabled) {
                  setHasEvidence(e.target.checked);
                }
              }}
              type="switch"
            />
          </OverlayTrigger>
        ) : (
          <Form.Check
            aria-label="evidence-toggle"
            checked={hasEvidence}
            id="evidence-toggle"
            onChange={(e) => {
              setHasEvidence(e.target.checked);
            }}
            type="switch"
          />
        )}
      </div>
    </div>
  );
}

export default TestMethodAndParams;
