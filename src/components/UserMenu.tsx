import { useTranslation } from "react-i18next";
import { FaUsers } from "react-icons/fa";
import { Link, useLocation } from "react-router-dom";

function isSel(path: string, name: string): boolean {
  return path.toLowerCase() === name.toLowerCase();
}

export default function UserMenu() {
  const userPath = useLocation().pathname.split("/")[1] ?? "";
  const { t } = useTranslation();

  return (
    <div className="px-3 py-2">
      <ul className="nav flex-column mt-2">
        <h5>
          <strong>{t("personalMenu")}</strong>
        </h5>
        <li
          className={`nav-item rounded  ${isSel(userPath, "profile") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/profile"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaUsers className="text-muted me-2" /> {t("profile")}
          </Link>
        </li>
        <li
          className={`nav-item rounded  ${isSel(userPath, "validations") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/validations"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaUsers className="text-muted me-2" /> {t("validations")}
          </Link>
        </li>
        <li
          className={`nav-item rounded ${isSel(userPath, "assessments") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/assessments"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaUsers className="text-muted me-2" /> {t("assessments")}
          </Link>
        </li>
      </ul>
    </div>
  );
}
