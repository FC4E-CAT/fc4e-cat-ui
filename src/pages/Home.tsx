import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="page-center text-align-center p-4">
      <h2>Welcome to Compliance Assesment Tool</h2>
      <Link to="/about" className="btn btn-success">Learn more...</Link>
    </div>
  );
}

export default Home;
