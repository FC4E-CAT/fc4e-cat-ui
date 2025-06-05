import { EvidenceURL } from "@/types";
import { useState } from "react";
import { InputGroup, Form, Row, Col } from "react-bootstrap";
import { useTranslation } from "react-i18next";

/**
 * Small component to add url list
 */

interface EvidenceURLSProps {
  urls: EvidenceURL[];
  onListChange(newURLs: EvidenceURL[]): void;
  noTitle?: boolean;
  isPreviewMode?: boolean;
}

export const EvidenceURLS = (props: EvidenceURLSProps) => {
  const [urlList, setUrlList] = useState<EvidenceURL[]>(props.urls);
  const [newURL, setNewURL] = useState<EvidenceURL>({ url: "" });
  const [error, setError] = useState("");
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
  const { t } = useTranslation();
  const handleRemoveURL = (index: number) => {
    const updatedUrls = urlList.filter((_, i) => i !== index);
    setUrlList(updatedUrls);
    props.onListChange(updatedUrls);
  };

  const handleAddURL = () => {
    if (newURL) {
      if (urlRegex.test(newURL.url)) {
        const updatedURLs = [...urlList, newURL];
        setUrlList(updatedURLs);
        props.onListChange(updatedURLs);
        setNewURL({ url: "", description: "" });
        setError("");
      } else {
        setError(t("page_assessment_edit.err_evidence"));
      }
    }
  };

  return (
    <div className="mt-1">
      {!props.noTitle && (
        <small>
          <strong>{t("page_assessment_edit.evidence")}:</strong>
        </small>
      )}

      <Row cclassName="justify-content-md-right">
        <Col md={11}>
          <InputGroup size="sm">
            <Form.Control
              id="input-add-url"
              value={newURL.url}
              onChange={(e) => {
                setNewURL({ ...newURL, url: e.target.value.trim() });
                setError("");
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

          <InputGroup className="mt-2" size="sm">
            <Form.Control
              id="input-add-description"
              as="textarea"
              aria-label="With textarea"
              value={newURL.description}
              onChange={(e) => {
                setNewURL({ ...newURL, description: e.target.value });
                setError("");
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
        </Col>

        <Col md={1}>
          {" "}
          <span
            className={`btn btn-evidence text-evidence btn-sm float-right ${props?.isPreviewMode && "disabled"}`}
            onClick={handleAddURL}
          >
            +
          </span>
        </Col>
      </Row>
      {error && <small className="text-danger">{error}</small>}

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
