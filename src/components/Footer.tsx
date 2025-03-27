import { Col, Row, Container } from "react-bootstrap";
import { FaCalendar, FaBook, FaGithub } from "react-icons/fa";
import logoDans from "@/assets/logo-dans.svg";
import logoDatacite from "@/assets/logo-datacite.svg";
import logoGrnet from "@/assets/logo-grnet.png";
import logoGwdg from "@/assets/logo-gwdg.svg";
import { Link } from "react-router-dom";
import packageJson from "@/../package.json";
import { useTranslation } from "react-i18next";
import { linksDocs, linksGithub } from "@/config";

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
            <h6>{t("footer.about_category")}</h6>
            <ul className="list-unstyled">
              <li>
                <Link to="/about/cat">{t("footer.about_cat")}</Link>
              </li>
              <li>
                <Link to="/about/interoperability">
                  {t("interoperability_guidelines")}
                </Link>
              </li>
              <li>
                <Link to="/about/acceptable-use">
                  {t("acceptable_use_policy")}
                </Link>
              </li>
              <li>
                <Link to="/about/cookies">{t("page_cookies.title")}</Link>
              </li>
              <li>
                <Link to="/about/privacy">{t("privacy_statement")}</Link>
              </li>
              <li>
                <Link to="/about/disclaimer">{t("disclaimer")}</Link>
              </li>
            </ul>
          </Col>
          <Col sm>
            <h6>{t("footer.development_category")}</h6>
            <ul className="list-unstyled">
              {linksGithub && (
                <li>
                  <FaGithub color="grey" className="me-2" />
                  <a href={linksGithub} target="_blank" rel="noreferrer">
                    {t("github")}
                  </a>
                </li>
              )}
              {linksDocs && (
                <li>
                  <FaBook color="grey" className="me-2" />
                  <a href={linksDocs} target="_blank" rel="noreferrer">
                    {t("documentation")}
                  </a>
                </li>
              )}
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
