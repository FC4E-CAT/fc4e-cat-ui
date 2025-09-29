import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { FaBars, FaFileAlt, FaTimes, FaUsers } from "react-icons/fa";
import ROUTES from "../routes";

function isSel(path: string, name: string): boolean {
  return path.toLowerCase() === name.toLowerCase();
}

export default function UserMenu({ roles }: { roles?: string[] }) {
  const userPath = useLocation().pathname.split("/")[1] ?? "";
  const adminPath = useLocation().pathname.split("/")[2] ?? "";
  const currentPath = useLocation().pathname;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  const isReporter = roles?.includes("reporter") ?? false;

  const { t } = useTranslation();

  useEffect(() => {
    const checkScreenSize = () => {
      setIsSmallScreen(window.innerWidth < 1400);
    };
    window.addEventListener("resize", checkScreenSize);

    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  useEffect(() => {
    setIsSidebarOpen(false);
  }, [currentPath]);

  const shouldShowBurgerMenu = isSmallScreen;

  if (shouldShowBurgerMenu) {
    return (
      <>
        <div style={{ width: "60px", flexShrink: 0 }}>
          <div className="d-flex justify-content-center pt-3">
            <button
              className="btn btn-light border shadow-sm"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
              {isSidebarOpen ? <FaTimes /> : <FaBars />}
            </button>
          </div>
        </div>

        {isSidebarOpen && (
          <>
            <div
              className="position-fixed w-100 h-100"
              style={{
                top: 0,
                left: 0,
                backgroundColor: "rgba(0,0,0,0.4)",
                zIndex: 1040,
              }}
              onClick={() => setIsSidebarOpen(false)}
            />

            <div
              className="position-fixed shadow-lg"
              style={{
                position: "absolute",
                top: "0px",
                left: 0,
                zIndex: 1045,
                height: "100vh",
                backgroundColor: "rgba(255, 255, 255, 0.95)",
              }}
            >
              <div
                className="position-absolute"
                style={{ top: "14px", right: "14px", zIndex: 1046 }}
              >
                <button
                  className="btn btn-dark btn-sm rounded-circle d-flex align-items-center justify-content-center p-2"
                  onClick={() => setIsSidebarOpen(false)}
                  style={{
                    width: "32px",
                    height: "32px",
                    border: "none",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                    backgroundColor: "#495057",
                    transition: "all 0.2s ease",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "#343a40";
                    e.currentTarget.style.transform = "scale(1.05)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "#495057";
                    e.currentTarget.style.transform = "scale(1)";
                  }}
                  title="Close sidebar"
                >
                  <FaTimes size={14} />
                </button>
              </div>

              <div
                className="cat-sidebar-container"
                style={{
                  paddingTop: "8px",
                  height: "100%",
                  overflowY: "auto",
                }}
              >
                {renderMenuContent({ isReporter, adminPath, userPath, t })}
              </div>
            </div>
          </>
        )}
      </>
    );
  }

  return (
    <div className="cat-sidebar-container">
      {renderMenuContent({ isReporter, adminPath, userPath, t })}
    </div>
  );
}

function renderMenuContent({
  isReporter,
  adminPath,
  userPath,
  t,
}: {
  isReporter: boolean;
  adminPath: string;
  userPath: string;
  t: ReturnType<typeof useTranslation>["t"];
}) {
  return (
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
          {isReporter && (
            <li>
              <Link
                to={ROUTES.ADMIN.REPORTS}
                className={`cat-nav-link-item ${isSel(adminPath, "reports") ? "active" : ""}`}
              >
                <FaFileAlt /> {t("Reports")}
              </Link>
            </li>
          )}
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
  );
}
