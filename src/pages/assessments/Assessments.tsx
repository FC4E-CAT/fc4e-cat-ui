import { FaFileImport, FaList, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import ROUTES from "@/routes";
import schemesImg from "@/assets/thumb_scheme.png";
import authImg from "@/assets/thumb_auth.png";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";
import { useGetActors } from "@/api";
import { Col, Row } from "react-bootstrap";
import { ActorCard } from "./components/ActorCard";
import { AuthContext } from "@/auth";
import { useContext } from "react";
import { useTranslation } from "react-i18next";
import { defaultPublicMotivationId, themeActorArt } from "@/config";

interface CardProps {
  id: number;
  title: string;
  link: string;
  linkText: string;
  description: string;
  image: string;
}

function Assessments() {
  // get the actors
  const actorsData = useGetActors({
    size: 100,
    page: 1,
    sortBy: "asc",
  });

  const { authenticated } = useContext(AuthContext)!;

  const cardProps: CardProps[] = [];

  const { t } = useTranslation();

  const actorArt: Record<string, string> = themeActorArt ?? {
    "PID Scheme (Component)": "scheme_art",
    "PID Manager (Role)": "manager_art",
    "PID Service Provider (Role)": "service_art",
    "PID Owner (Role)": "owner_art",
    "PID Authority (Role)": "authority_art",
  };

  const cardImgs: Record<string, string> = {
    scheme_art: schemesImg,
    manager_art: manageImg,
    service_art: serviceImg,
    owner_art: ownersImg,
    authority_art: authImg,
  };

  // generate the cards when actor data is loaded
  if (!actorsData.isLoading && actorsData.data) {
    actorsData.data.content.forEach((actorItem) => {
      // get the image
      const cardImg = cardImgs[actorArt[actorItem.label]] || null;
      if (cardImg) {
        cardProps.push({
          id: parseInt(actorItem.id),
          title: actorItem.label,
          description: actorItem.description,
          image: cardImg,
          linkText: t("page_assessments.public_view"),
          link: `/public-assessments?actor-id=${
            actorItem.id
          }&motivation-id=${defaultPublicMotivationId}&actor-name=${actorItem.label}`,
        });
      }
    });
  }

  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            {t("assessments")}
            <p className="lead cat-view-lead">
              {t("page_assessments.subtitle")}
            </p>
          </h2>
        </div>
        {authenticated && (
          <div className="col-md-auto cat-heading-right">
            <Link
              id="view_assessments_button"
              to={ROUTES.ASSESSMENTS.ROOT}
              className="btn btn-light border-black me-3"
            >
              <FaList />{" "}
              <span className="align-middle">
                {" "}
                {t("page_assessments.view")}
              </span>
            </Link>
            <Link
              id="assessment_form_button"
              to={ROUTES.ASSESSMENTS.CREATE}
              className="btn btn-warning me-3"
            >
              <FaPlus />{" "}
              <span className="align-middle">{t("buttons.create_new")}</span>
            </Link>
            <Link
              id="assessment_form_button"
              to={ROUTES.ASSESSMENTS.IMPORT}
              className="btn btn-info"
            >
              <FaFileImport />{" "}
              <span className="align-middle">{t("buttons.import")}</span>
            </Link>
          </div>
        )}
      </div>
      <Row xs={2} sm={2} md={3} lg={4} xl={5} className="px-4 g-4 d-flex mt-2">
        {cardProps.map((c, index) => (
          <Col key={index}>
            <ActorCard key={index} {...c} />
          </Col>
        ))}
      </Row>

      <div className="row py-2 mt-2"></div>
    </div>
  );
}

export default Assessments;
