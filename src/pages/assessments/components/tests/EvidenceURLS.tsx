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

      {urlList.length > 0 && (
        <ul className="list-group mt-2">
          {urlList.map((item, index) => (
            <li className="list-group-item p-2" key={index}>
              <Row>
                <Col md="auto">
                  <small>[{index}]</small>
                </Col>
                <Col>
                  <div>
                    <small>
                      <a
                        className="ms-2"
                        href={item.url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        {item.url}
                      </a>{" "}
                    </small>
                  </div>
                  <div>
                    {item.description && (
                      <small>
                        <em className="ms-2">{item.description}</em>
                      </small>
                    )}
                  </div>
                </Col>
                <Col md="auto">
                  <small>
                    <span
                      className="btn btn-sm btn-light border ms-4"
                      onClick={() => handleRemoveURL(index)}
                    >
                      {t("buttons.remove").toLowerCase()}
                    </span>
                  </small>
                </Col>
              </Row>
            </li>
          ))}
        </ul>
      )}
      <Row className="m-1 p-2 bg-light border rounded-bottom">
        <Col>
          <InputGroup size="sm">
            <InputGroup.Text id="label-add-url">{t("url")}:</InputGroup.Text>
            <Form.Control
              id="input-add-url"
              value={newURL.url}
              onChange={(e) => {
                setNewURL({ ...newURL, url: e.target.value.trim() });
                setError("");
              }}
              aria-describedby="label-add-url"
              placeholder="Please enter and add a valid url to support your claim"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddURL();
                }
              }}
            />
          </InputGroup>
          <InputGroup className="mt-2" size="sm">
            <InputGroup.Text id="label-add-url">
              {t("fields.description")}:
            </InputGroup.Text>
            <Form.Control
              id="input-add-description"
              value={newURL.description}
              onChange={(e) => {
                setNewURL({ ...newURL, description: e.target.value });
                setError("");
              }}
              aria-describedby="label-add-url"
              placeholder="Please enter a description of the evidence"
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  handleAddURL();
                }
              }}
            />
          </InputGroup>
        </Col>
        <Col md="auto">
          <span className="btn btn-primary btn-sm" onClick={handleAddURL}>
            {t("buttons.add")}
          </span>
        </Col>
      </Row>

      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};
