import { useContext } from "react";
import { ActorCard } from "@/components";
import { FaCheckCircle, FaList, FaPlus } from "react-icons/fa";
import { AuthContext } from "@/auth";
import { Link } from "react-router-dom";
import schemesImg from "@/assets/thumb_scheme.png";
import authImg from "@/assets/thumb_auth.png";
import serviceImg from "@/assets/thumb_service.png";
import manageImg from "@/assets/thumb_manage.png";
import ownersImg from "@/assets/thumb_user.png";

function Assessments() {
  const { authenticated, keycloak } = useContext(AuthContext)!;
  const cardprops = [
    {
      title: "Schemes",
      link: "/validations",
      link_text: "View Schemes",
      image: schemesImg,
      description: "This is a wild card",
    },
    {
      title: "Authorities",
      link: "/test",
      link_text: "View Authorities",
      image: authImg,
      description: "This is a wild card",
    },
    {
      title: "Services",
      link: "/test",
      link_text: "View Services",
      image: serviceImg,
      description: "This is a wild card",
    },
    {
      title: "Managers",
      link: "/test",
      link_text: "View Managers",
      image: manageImg,
      description: "This is a wild card",
    },
    {
      title: "Οwners",
      link: "/test",
      link_text: "View Owners",
      image: ownersImg,
      description: "This is a wild card",
    },
  ];

  return (
    <div className="mt-4">
      {keycloak?.token && authenticated && (
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
                <FaPlus /> Create
              </Link>
              <Link
                to="/assessments"
                className="btn btn-light border-black mx-3"
              >
                <FaList /> View
              </Link>
            </div>
          </div>
        </>
      )}
      <>
        <h6>Read about different actors in the ecosystem before starting.</h6>
        <div className="row g-4 mt-2">
          {cardprops.map((c, index) => (
            <div key={index} className="col">
              <ActorCard key={index} {...c} />
            </div>
          ))}
        </div>
      </>
    </div>
  );
}

export default Assessments;
