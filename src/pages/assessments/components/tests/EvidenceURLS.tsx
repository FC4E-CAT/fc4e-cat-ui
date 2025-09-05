import type { EvidenceURL } from "@/types";
import { useState } from "react";
import { InputGroup, Form, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { TestToolTip } from "./TestToolTip";

interface EvidenceURLSProps {
  urls: EvidenceURL[];
  onListChange(newURLs: EvidenceURL[]): void;
  noTitle?: boolean;
  isPreviewMode?: boolean;
}

export const EvidenceURLS = (props: EvidenceURLSProps) => {
  const [urlList, setUrlList] = useState<EvidenceURL[]>(props.urls);
  const [evidenceInfo, setEvidenceInfo] = useState<EvidenceURL>({
    url: "",
    description: "",
  });
  const [hasError, setHasError] = useState(false);
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  const { t } = useTranslation();
  const handleRemoveURL = (index: number) => {
    const updatedUrls = urlList.filter((_, i) => i !== index);
    setUrlList(updatedUrls);
    props.onListChange(updatedUrls);
  };

  const handleAddURL = () => {
    const isUrlValid =
      evidenceInfo.url.trim() && urlRegex.test(evidenceInfo.url);
    const isDescriptionValid = evidenceInfo.description?.trim();

    if (isUrlValid && isDescriptionValid) {
      const updatedURLs = [...urlList, evidenceInfo];
      setUrlList(updatedURLs);
      props.onListChange(updatedURLs);
      setEvidenceInfo({ url: "", description: "" });
      setHasError(false);
    } else {
      setHasError(true);
    }
  };

  return (
    <div className="mt-1">
      {!props.noTitle && (
        <small>
          <strong>{t("page_assessment_edit.evidence")}:</strong>
        </small>
      )}

      <span className="fw-light-500 text-sm text-secondary">
        <strong>Can you provide public evidence of such a declaration?</strong>
        <span className="ms-2">
          <TestToolTip
            tipId="evidence-id"
            tipText="A document, web page, or publication describing the intention"
          />
        </span>
      </span>

      <Row className="justify-content-md-right">
        <Col md={10}>
          <InputGroup size="sm">
            <Form.Control
              id="input-add-url"
              value={evidenceInfo.url}
              onChange={(e) => {
                setEvidenceInfo((prev) => ({
                  ...prev,
                  url: e.target.value.trim(),
                }));
              }}
              aria-describedby="label-add-url"
              placeholder={t("page_assessment_edit.evidence_url")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddURL();
                }
              }}
              title={t("page_assessment_edit.evidence_url")}
            />
          </InputGroup>
          {hasError && !evidenceInfo.url.trim() && (
            <small className="text-danger d-block">{t("required")}</small>
          )}
          {hasError &&
            evidenceInfo.url.trim() &&
            !urlRegex.test(evidenceInfo.url) && (
              <small className="text-danger d-block">
                {t("page_assessment_edit.err_evidence")}
              </small>
            )}

          <InputGroup className="mt-2" size="sm">
            <Form.Control
              id="input-add-description"
              as="textarea"
              aria-label="With textarea"
              value={evidenceInfo.description}
              onChange={(e) => {
                setEvidenceInfo((prev) => ({
                  ...prev,
                  description: e.target.value,
                }));
              }}
              aria-describedby="label-add-url"
              placeholder={t("page_assessment_edit.evidence_description")}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddURL();
                }
              }}
              title={t("page_assessment_edit.evidence_description")}
            />
          </InputGroup>
          {hasError && !evidenceInfo.description?.trim() && (
            <small className="text-danger d-block">{t("required")}</small>
          )}
        </Col>

        <Col md={1}>
          <span
            className={`btn btn-evidence text-evidence btn-sm float-right ${props?.isPreviewMode && "disabled"}`}
            onClick={handleAddURL}
          >
            +
          </span>
        </Col>
      </Row>

      {urlList.map((evid, index) => (
        <Row className="mt-2" key={index}>
          <Col md={10}>
            <p className="lh-sm">
              <small>
                <a key={index} href={evid.url} target="_blank" rel="noreferrer">
                  # Evidence [{index}]
                </a>

                <span> {evid.description}</span>
              </small>
            </p>
          </Col>
          <Col md="auto">
            <small>
              <span
                className="btn btn-secondary btn-sm float-right"
                onClick={() => handleRemoveURL(index)}
              >
                -
              </span>
            </small>
          </Col>
        </Row>
      ))}
    </div>
  );
};
