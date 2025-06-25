import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";
import ROUTES from "../routes";

function isSel(path: string, name: string): boolean {
  return path.toLowerCase() === name.toLowerCase();
}

export default function UserMenu() {
  const userPath = useLocation().pathname.split("/")[1] ?? "";
  const { t } = useTranslation();

  return (
    <div className="cat-sidebar-container">
      <ul className="cat-sidebar-nav">
        <div>
          <h3 className="cat-sidebar-section">{t("personal_menu")}</h3>
          <div>
            <li>
              <Link
                to={ROUTES.PROFILE.ROOT}
                className={`cat-nav-link-item ${isSel(userPath, "profile") ? "active" : ""}`}
              >
                <FaUsers /> {t("profile")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.VALIDATIONS.ROOT}
                className={`cat-nav-link-item ${isSel(userPath, "validations") ? "active" : ""}`}
              >
                <FaUsers /> {t("validations")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ASSESSMENTS.ROOT}
                className={`cat-nav-link-item ${isSel(userPath, "assessments") ? "active" : ""}`}
              >
                <FaUsers /> {t("assessments")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.SUBJECTS}
                className={`cat-nav-link-item ${isSel(userPath, "subjects") ? "active" : ""}`}
              >
                <FaUsers /> {t("subjects")}
              </Link>
            </li>
          </div>
        </div>
      </ul>
    </div>
  );
}
