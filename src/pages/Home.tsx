import { useGetStatistics } from "@/api/services/registry";
import { useTranslation } from "react-i18next";
import { Card } from "react-bootstrap";
import { FaCheckCircle, FaCube, FaInfoCircle, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";

function Home() {
  const { data } = useGetStatistics();
  const { t } = useTranslation();

  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="page-center p-4">
        <h2>{t("page_home.title")}</h2>
      </div>
      <div className="row">
        <div className="col-9 px-4 pb-4">
          <p>
            {t("page_home.description")}
            <br />
            <span className="float-right">
              <Link to="/assess" className="btn btn-light mt-4 ">
                <FaInfoCircle className="me-2 text-muted" />{" "}
                {t("buttons.about")}...
              </Link>
            </span>
          </p>
        </div>
        <div className="col-2">
          <div className="home-content">
            <div className="overview-boxes">
              <div className="box">
                <div className="right-side">
                  <div className="box-topic">
                    {t("total")} {t("users")}
                  </div>
                  <div className="number">
                    {data?.user_statistics.total_users}
                  </div>
                </div>
                <FaUser className="bx bx-cart-alt cart p-2" />
              </div>
              <div className="box">
                <div className="right-side">
                  <div className="box-topic"> {t("assessments")}</div>
                  <div className="number">
                    {" "}
                    {data?.validation_statistics.total_validations}
                  </div>
                </div>
                <FaCheckCircle className="bx bx-cart-alt cart two p-2" />
              </div>
              <div className="box">
                <div className="right-side">
                  <div className="box-topic">All {t("subjects")}</div>
                  <div className="number">
                    {data?.subject_statistics.total_subjects}
                  </div>
                </div>
                <FaCube className="bx bx-cart-alt cart three p-2" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="row bg-light p-4">
        <h2>{t("page_home.benefits")}</h2>
        <div className="row">
          <div className="col">
            <Card className="p-2 border-grey shadow-sm mb-2">
              <Card.Img
                className="mx-auto p-2"
                src={manageImg}
                alt={t("page_home.managers")}
                style={{ maxWidth: "80px" }}
              />

              <Card.Body>
                <Card.Title className="d-flex justify-content-between">
                  {t("page_home.managers")}
                </Card.Title>
                <span className="lead cat-home-lead">
                  <small>{t("page_home.managers_description")}</small>
                </span>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0"></Card.Footer>
            </Card>
          </div>
          <div className="col">
            <Card className="p-2 border-grey shadow-sm mb-2">
              <Card.Img
                className="mx-auto p-2"
                src={ownersImg}
                alt={t("page_home.owners")}
                style={{ maxWidth: "80px" }}
              />
              <Card.Body>
                <Card.Title className="d-flex justify-content-between">
                  {t("page_home.owners")}
                </Card.Title>
                <span className="lead cat-home-lead">
                  <small>{t("page_home.owners_description")}</small>
                </span>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0"></Card.Footer>
            </Card>
          </div>
          <div className="col cat-heading-right">
            <Card className="p-2 border-grey shadow-sm mb-2">
              <Card.Img
                className="mx-auto p-2"
                src={serviceImg}
                alt={t("page_home.providers")}
                style={{ maxWidth: "80px" }}
              />
              <Card.Body>
                <Card.Title className="d-flex justify-content-between">
                  {t("page_home.providers")}
                </Card.Title>
                <span className="lead cat-home-lead">
                  <small>{t("page_home.providers_description")}</small>
                </span>
              </Card.Body>
              <Card.Footer className="bg-transparent border-0"></Card.Footer>
            </Card>
          </div>
        </div>
      </div>
      <div className="row p-4"></div>
    </div>
  );
}

export default Home;
