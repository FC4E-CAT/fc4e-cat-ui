import { useState } from "react";
import { InputGroup, Form } from "react-bootstrap";
import { FaExternalLinkAlt } from "react-icons/fa";

/**
 * Small component to add url list
 */

interface EvidenceURLSProps {
  urls: string[];
  onListChange(newURLs: string[]): void;
}

export const EvidenceURLS = (props: EvidenceURLSProps) => {
  const [urlList, setUrlList] = useState<string[]>(props.urls);
  const [newURL, setNewURL] = useState("");
  const [error, setError] = useState("");
  const urlRegex = /^(ftp|http|https):\/\/[^ "]+$/;

  const handleRemoveURL = (index: number) => {
    const updatedUrls = urlList.filter((_, i) => i !== index);
    setUrlList(updatedUrls);
    props.onListChange(updatedUrls);
  };

  const handleAddURL = () => {
    if (newURL) {
      if (urlRegex.test(newURL)) {
        const updatedURLs = [...urlList, newURL];
        setUrlList(updatedURLs);
        props.onListChange(updatedURLs);
        setNewURL("");
        setError("");
      } else {
        setError(
          "please provide a valid url (e.g. http://example.com/path/to)",
        );
      }
    }
  };

  return (
    <div className="mt-4">
      <small>
        <strong>Evidence:</strong>
      </small>

      {urlList.length > 0 && (
        <ul className="list-group mt-2">
          {urlList.map((item, index) => (
            <li className="list-group-item py-1" key={index}>
              <small>
                <FaExternalLinkAlt />{" "}
                <a
                  className="ms-2"
                  href={item}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item}
                </a>{" "}
                <span
                  className="btn btn-sm btn-light border ms-4"
                  onClick={() => handleRemoveURL(index)}
                >
                  remove
                </span>
              </small>
            </li>
          ))}
        </ul>
      )}
      <InputGroup className="mt-2" size="sm">
        <InputGroup.Text id="label-add-url">URL:</InputGroup.Text>
        <Form.Control
          id="input-add-url"
          value={newURL}
          onChange={(e) => {
            setNewURL(e.target.value);
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
        <span className="btn btn-primary btn-sm" onClick={handleAddURL}>
          Add
        </span>
      </InputGroup>
      {error && <small className="text-danger">{error}</small>}
    </div>
  );
};
