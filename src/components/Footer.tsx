import { Col, Row, Container } from "react-bootstrap";
import { FaEnvelope, FaYoutube, FaTwitter, FaCalendar } from "react-icons/fa";
import logoDans from "@/assets/logo-dans.svg";
import logoDatacite from "@/assets/logo-datacite.svg";
import logoGrnet from "@/assets/logo-grnet.png";
import logoGwdg from "@/assets/logo-gwdg.svg";
import { Link } from "react-router-dom";
import packageJson from "@/../package.json";

function Footer() {
  // tag build information on footer
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE;
  const buildCommitHash = import.meta.env.VITE_APP_BUILD_COMMIT_HASH;
  const buildCommitURL = import.meta.env.VITE_APP_BUILD_COMMIT_URL;

  return (
    <footer className="border-top">
      <Container className="text-left">
        <Row className="mt-4">
          <Col sm>
            <h6>Contact and Service</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Contact</Link>
              </li>
              <li>
                <Link to="/">Terms and Conditions</Link>
              </li>
              <li>
                <Link to="/">Data Licenses</Link>
              </li>
              <li>
                <Link to="/">Privacy</Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>About CAT</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">Our Team</Link>
              </li>
              <li>
                <Link to="/">GitHub</Link>
              </li>
              <li>
                <Link to="/">Disclaimer</Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>Follow Us</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">
                  <FaEnvelope /> Newsletter
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FaYoutube /> Youtube
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FaTwitter /> Twitter
                </Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>Partners</h6>
            <a href="https://dans.knaw.nl/en" target="_blank" rel="noreferrer">
              <img className="cat-logo-sm" src={logoDans} alt="DANS" />
            </a>
            <a href="https://www.grnet.gr/en" target="_blank" rel="noreferrer">
              <img className="cat-logo-sm" src={logoGrnet} alt="GRNET" />
            </a>
            <a href="https://www.datacite.org" target="_blank" rel="noreferrer">
              <img className="cat-logo-sm" src={logoDatacite} alt="DATACITE" />
            </a>
            <a href="https://www.gwdg.de/" target="_blank" rel="noreferrer">
              <img className="cat-logo-sm" src={logoGwdg} alt="GWDG" />
            </a>
          </Col>
        </Row>
        <div className="text-left">
          <small className="text-muted">
            <span>
              Version: <strong>{packageJson.version}</strong>
            </span>
            {buildCommitHash && (
              <span style={{ marginLeft: "0.6rem" }}>
                Commit:{" "}
                <a
                  className="text-muted cat-hash-link"
                  target="_blank"
                  rel="noreferrer"
                  href={buildCommitURL}
                >
                  {buildCommitHash}
                </a>
              </span>
            )}
            {buildDate && (
              <span style={{ marginLeft: "0.6rem" }}>
                <FaCalendar />: {buildDate}
              </span>
            )}
          </small>
        </div>
      </Container>
    </footer>
  );
}

export { Footer };
