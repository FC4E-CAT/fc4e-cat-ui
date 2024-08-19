import { FaFileImport, FaList, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
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

  const cardImgs: Record<string, string> = {
    "PID Scheme": schemesImg,
    "PID Manager": manageImg,
    "PID Service Provider": serviceImg,
    "PID Owner": ownersImg,
    "PID Authority": authImg,
  };

  // generate the cards when actor data is loaded
  if (!actorsData.isLoading && actorsData.data) {
    actorsData.data.content.forEach((actorItem) => {
      // get the image
      const cardImg = cardImgs[actorItem.name] || null;
      if (cardImg) {
        cardProps.push({
          id: parseInt(actorItem.id),
          title: actorItem.name,
          description: actorItem.description,
          image: cardImg,
          linkText: `View public assessments`,
          link: `/public-assessments?actor-id=${
            actorItem.id
          }&assessment-type-id=${1}&actor-name=${actorItem.name}`,
        });
      }
    });
  }

  return (
    <div>
      <>
        <div className="cat-view-heading-block row border-bottom">
          <div className="col col-lg-6">
            <h2 className="cat-view-heading text-muted">Assessments</h2>
          </div>
          {authenticated && (
            <div className="col-md-auto">
              <Link
                id="view_assessments_button"
                to="/assessments"
                className="btn btn-light me-3"
              >
                <FaList />{" "}
                <span className="align-middle">View your Assessments</span>
              </Link>
              <Link
                id="assessment_form_button"
                to={`/assessments/create`}
                className="btn btn-warning me-3"
              >
                <FaPlus /> <span className="align-middle">Create New</span>
              </Link>
              <Link
                id="assessment_form_button"
                to={`/assessments/import`}
                className="btn btn-info"
              >
                <FaFileImport /> <span className="align-middle">Import</span>
              </Link>
            </div>
          )}
        </div>
      </>
      <>
        <h6>Read about different actors in the ecosystem before starting.</h6>
        <Row xs={2} sm={2} md={3} lg={4} xl={5} className="g-4 d-flex mt-2">
          {cardProps.map((c, index) => (
            <Col key={index}>
              <ActorCard key={index} {...c} />
            </Col>
          ))}
        </Row>
      </>
    </div>
  );
}

export default Assessments;
