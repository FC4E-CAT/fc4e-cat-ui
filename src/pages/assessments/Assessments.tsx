import { FaCheckCircle, FaList, FaPlus } from "react-icons/fa";
import { Link } from "react-router-dom";
import schemesImg from "@/assets/thumb_scheme.png";
import authImg from "@/assets/thumb_auth.png";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";
import { useGetActors } from "@/api";
import { Col, Row } from "react-bootstrap";
import { ActorCard } from "./components/ActorCard";

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
    <div className="mt-4">
      <>
        <div className="d-flex justify-content-between my-2 container">
          <div className="d-flex justify-content-between my-2">
            <h3 className="cat-view-heading">
              <FaCheckCircle className="me-1" /> assessments
            </h3>
          </div>
          <div className="d-flex justify-content-end my-2">
            <Link
              to={`/assessments/create`}
              className="btn btn-light border-black mx-3"
            >
              <FaPlus /> Create New
            </Link>
            <Link to="/assessments" className="btn btn-light border-black mx-3">
              <FaList /> View Your Assessments
            </Link>
          </div>
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
