import { FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-center text-center p-4">
      <h2>Welcome to Compliance Assesment Tool</h2>
      <Link to="/about" className="btn btn-light border mt-4">
        <FaInfoCircle className="me-2 text-muted" /> About...
      </Link>
    </div>
  );
}

export default Home;
