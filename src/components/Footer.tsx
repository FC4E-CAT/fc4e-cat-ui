import { Col, Row, Container } from "react-bootstrap";
import { FaEnvelope, FaYoutube, FaTwitter, FaCalendar } from "react-icons/fa";
import logoDans from "@/assets/logo-dans.svg";
import logoDatacite from "@/assets/logo-datacite.svg";
import logoGrnet from "@/assets/logo-grnet.png";
import logoGwdg from "@/assets/logo-gwdg.svg";
import { Link } from "react-router-dom";
import packageJson from "@/../package.json";
import { useTranslation } from "react-i18next";

function Footer() {
  // tag build information on footer
  const buildDate = import.meta.env.VITE_APP_BUILD_DATE;
  const buildCommitHash = import.meta.env.VITE_APP_BUILD_COMMIT_HASH;
  const buildCommitURL = import.meta.env.VITE_APP_BUILD_COMMIT_URL;

  const { t } = useTranslation();

  return (
    <footer className="border-top">
      <Container className="text-left">
        <Row className="mt-4">
          <Col sm>
            <h6>{t("footer.contact_category")}</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">{t("footer.contact")}</Link>
              </li>
              <li>
                <Link to="/">{t("footer.terms")}</Link>
              </li>
              <li>
                <Link to="/">{t("footer.data")}</Link>
              </li>
              <li>
                <Link to="/">{t("footer.privacy")}</Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>{t("footer.about_category")}</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">{t("footer.team")}</Link>
              </li>
              <li>
                <Link to="/">{t("footer.github")}</Link>
              </li>
              <li>
                <Link to="/">{t("footer.disclaimer")}</Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>{t("footer.social_category")}</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/">
                  <FaEnvelope className="me-2" />
                  {t("footer.newsletter")}
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FaYoutube className="me-2" />
                  {t("footer.youtube")}
                </Link>
              </li>
              <li>
                <Link to="/">
                  <FaTwitter className="me-2" />
                  {t("footer.twitter")}
                </Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>{t("footer.partners_category")}</h6>
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
              {t("footer.version")}: <strong>{packageJson.version}</strong>
            </span>
            {buildCommitHash && (
              <span style={{ marginLeft: "0.6rem" }}>
                {t("footer.commit")}:{" "}
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
