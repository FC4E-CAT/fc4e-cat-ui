import { useTranslation } from "react-i18next";
import {
  FaAward,
  FaBorderNone,
  FaCheckCircle,
  FaFile,
  FaTags,
  FaUsers,
  FaCog,
} from "react-icons/fa";
import { FaClipboardQuestion, FaFileCircleCheck } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";
import ROUTES from "../routes";

function isSel(path: string, name: string): boolean {
  return path.toLowerCase() === name.toLowerCase();
}

export default function AdminMenu() {
  const adminPath = useLocation().pathname.split("/")[2] ?? "";
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

        <div>
          <h3 className="cat-sidebar-section">{t("manage")}</h3>
          <div>
            <li>
              <Link
                to={ROUTES.ADMIN.USERS}
                className={`cat-nav-link-item ${isSel(adminPath, "users") ? "active" : ""}`}
              >
                <FaUsers /> {t("users")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.VALIDATIONS}
                className={`cat-nav-link-item ${isSel(adminPath, "validations") ? "active" : ""}`}
              >
                <FaCheckCircle /> {t("validations")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.ASSESSMENTS}
                className={`cat-nav-link-item ${isSel(adminPath, "assessments") ? "active" : ""}`}
              >
                <FaFileCircleCheck /> {t("assessments")}
              </Link>
            </li>
          </div>
        </div>

        <div>
          <h3 className="cat-sidebar-section">{t("library")}</h3>
          <div>
            <li>
              <Link
                to={ROUTES.ADMIN.MOTIVATIONS.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "motivations") ? "active" : ""}`}
              >
                <FaFile /> {t("motivations")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.PRINCIPLES.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "principles") ? "active" : ""}`}
              >
                <FaTags /> {t("principles")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.CRITERIA.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "criteria") ? "active" : ""}`}
              >
                <FaAward /> {t("criteria")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.TESTS.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "tests") ? "active" : ""}`}
              >
                <FaClipboardQuestion /> {t("tests")}
              </Link>
            </li>
            <li>
              <Link
                to={ROUTES.ADMIN.METRICS.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "metrics") ? "active" : ""}`}
              >
                <FaBorderNone /> {t("metrics")}
              </Link>
            </li>
          </div>
        </div>

        <div>
          <h3 className="cat-sidebar-section">{t("system")}</h3>
          <div>
            <li>
              <Link
                to={ROUTES.ADMIN.SETTINGS.ROOT}
                className={`cat-nav-link-item ${isSel(adminPath, "settings") ? "active" : ""}`}
              >
                <FaCog /> {t("Settings")}
              </Link>
            </li>
          </div>
        </div>
      </ul>
    </div>
  );
}
