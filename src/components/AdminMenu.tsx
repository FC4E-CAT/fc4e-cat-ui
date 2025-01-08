import { useTranslation } from "react-i18next";
import {
  FaAward,
  FaCheckCircle,
  FaFile,
  FaTags,
  FaUsers,
} from "react-icons/fa";
import { FaFileCircleCheck } from "react-icons/fa6";
import { Link, useLocation } from "react-router-dom";

function isSel(path: string, name: string): boolean {
  return path.toLowerCase() === name.toLowerCase();
}

export default function AdminMenu() {
  const adminPath = useLocation().pathname.split("/")[2] ?? "";
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
        <hr />

        <h5>
          <strong>{t("manage")}</strong>
        </h5>
        <li
          className={`nav-item rounded ${isSel(adminPath, "users") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/admin/users"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaUsers className="text-muted me-2" /> {t("users")}
          </Link>
        </li>
        <li
          className={`nav-item rounded ${isSel(adminPath, "validations") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/admin/validations"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaCheckCircle className="text-muted me-2" /> {t("validations")}
          </Link>
        </li>
        <li
          className={`nav-item rounded ${isSel(adminPath, "assessments") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/assessments"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaFileCircleCheck className="text-muted me-2" /> {t("assessments")}
          </Link>
        </li>
        <hr />

        <h5>
          <strong> {t("library")}</strong>
        </h5>
        <li
          className={`nav-item rounded ${isSel(adminPath, "motivations") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/admin/motivations"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaFile className="text-muted me-2" /> {t("motivations")}
          </Link>
        </li>
        <li
          className={`nav-item rounded ${isSel(adminPath, "principles") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/admin/principles"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaTags className="text-muted me-2" /> {t("principles")}
          </Link>
        </li>
        <li
          className={`nav-item rounded ${isSel(adminPath, "criteria") ? "cat-menu-selected" : ""}`}
        >
          <Link
            to="/admin/criteria"
            className="rounded cat-nav-link-light px-3 text-nowrap"
          >
            <FaAward className="text-muted me-2" /> {t("criteria")}
          </Link>
        </li>
      </ul>
    </div>
  );
}
