import { ActorCard } from "../components";
import schemesImg from '../assets/schemes.png'

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
    image: schemesImg,
    description: "This is a wild card"
  },
  {
    title: "Services",
    link: "/test",
    link_text: "View Services",
    image: schemesImg,
    description: "This is a wild card"
  },
  {
    title: "Managers",
    link: "/test",
    link_text: "View Managers",
    image: schemesImg,
    description: "This is a wild card"
  }
];

function Home() {
  return (
    <div className="page-center">
      <h2>Welcome to Compliance Assesment Tool</h2>
      <div className="row row-cols-4 row-cols-md-4 g-4 mt-2">
        {cardprops.map((c, index) => (
          <div key={index} className="col">
            <ActorCard key={index} {...c} />
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
