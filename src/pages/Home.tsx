import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="page-center text-center p-4">
        <h2>{t("page_home.title")}</h2>
        <Link to="/about" className="btn btn-light border mt-4">
          <FaInfoCircle className="me-2 text-muted" /> {t("buttons.about")}...
        </Link>
      </div>
    </div>
  );
}

export default Home;
