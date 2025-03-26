import imgFcat from "@/assets/fcat.jpg";
import { Row, Col, Accordion } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function AboutCat() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h3 className="cat-view-heading mb-4">
          <FaInfoCircle /> {t("page_about.title")}
        </h3>
        <h2>{t("page_about.subtitle")}</h2>
        <Row className="mt-2 mb-4">
          <Col>
            <h4>{t("page_about.overview")}</h4>
            <p>{t("page_about.overview_text")}</p>
            <hr />
            {t("page_about.resources")}:
            <ol type="1">
              <li>
                <strong>{t("page_about.vocabularies")}</strong>,{" "}
                {t("page_about.vocabularies_text")}
              </li>
              <li>
                <strong>{t("page_about.apis")}</strong>{" "}
                {t("page_about.apis_text")}
              </li>
              <li>
                <strong>{t("page_about.uis")}</strong>{" "}
                {t("page_about.uis_text")}
              </li>
            </ol>
            <hr />
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>
                  {t("page_about.functionalities")}
                </Accordion.Header>
                <Accordion.Body>
                  <ul className="cat-list-bullet-image">
                    <li>{t("page_about.f1")}</li>
                    <li>{t("page_about.f2")}</li>
                    <li>{t("page_about.f3")}</li>
                    <li>{t("page_about.f4")}</li>
                    <li>{t("page_about.f5")}</li>
                    <li>{t("page_about.f6")}</li>
                    <li>{t("page_about.f7")}</li>
                    <li>{t("page_about.f8")}</li>
                    <li>{t("page_about.f9")}</li>
                    <li>{t("page_about.f10")}</li>
                    <li>{t("page_about.f11")}</li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>{t("page_about.impact")}</Accordion.Header>
                <Accordion.Body>
                  <ul className="cat-list-bullet-image">
                    <li>{t("page_about.i1")}</li>

                    <li>
                      {t("page_about.i2")}
                      <ul className="cat-list-bullet-image">
                        <li>{t("page_about.i2_1")}</li>
                        <li>{t("page_about.i2_2")}</li>
                      </ul>
                    </li>
                  </ul>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Col>
          <Col lg={5}>
            <img src={imgFcat} style={{ maxWidth: "100%" }} />
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default AboutCat;
