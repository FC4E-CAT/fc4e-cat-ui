import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Row, Col, Spinner } from "react-bootstrap";
import {
  FaUsers,
  FaCheckCircle,
  FaFileAlt,
  FaClock,
  FaUserTag,
  FaBan,
  FaEye,
  FaUserCheck,
  FaUserClock,
  FaCog,
  FaUser,
  FaShieldAlt,
  FaUserTie,
  FaKey,
  FaTools,
  FaServer,
  FaCubes,
  FaTimes,
  FaExclamationCircle,
  FaEyeSlash,
} from "react-icons/fa";
import { AuthContext } from "@/auth";
import {
  useGetAdminStatistics,
  useGetMostFailedCriteria,
  type MostFailedCriteria,
} from "@/api/services/statistics";
import ROUTES from "@/routes";
import styles from "./AdminDashboard.module.css";

function AdminDashboard() {
  const { keycloak, registered } = useContext(AuthContext)!;

  const [mostFailedCriteria, setMostFailedCriteria] = useState<
    MostFailedCriteria[]
  >([]);

  const { data: statistics, isLoading } = useGetAdminStatistics({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: mostFailedData,
    fetchNextPage: mostFailedFetchNextPage,
    hasNextPage: mostFailedHasNextPage,
  } = useGetMostFailedCriteria({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    let tmpCriteria: MostFailedCriteria[] = [];

    if (mostFailedData?.pages) {
      mostFailedData.pages.map((page) => {
        tmpCriteria = [...tmpCriteria, ...page.content];
      });
      if (mostFailedHasNextPage) {
        mostFailedFetchNextPage();
      }
    }
    setMostFailedCriteria(tmpCriteria);
  }, [mostFailedData, mostFailedHasNextPage, mostFailedFetchNextPage]);

  if (isLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-2 text-muted">Loading dashboard statistics...</p>
        </div>
      </div>
    );
  }

  const getRoleIcon = (roleName: string) => {
    const role = roleName.toLowerCase();
    if (role.includes("pid scheme") || role.includes("component")) {
      return <FaTools size={16} />;
    } else if (role.includes("pid authority")) {
      return <FaUserTie size={16} />;
    } else if (role.includes("end user")) {
      return <FaUser size={16} />;
    } else if (role.includes("compliance monitoring")) {
      return <FaShieldAlt size={16} />;
    } else if (role.includes("administrator") || role.includes("mpa")) {
      return <FaCog size={16} />;
    } else if (role.includes("pid owner")) {
      return <FaKey size={16} />;
    } else if (role.includes("pid manager")) {
      return <FaUsers size={16} />;
    } else if (role.includes("service provider")) {
      return <FaServer size={16} />;
    } else {
      return <FaCubes size={16} />;
    }
  };

  const userStats = statistics?.user_statistics;
  const assessmentStats = statistics?.assessment_statistics;
  const validationStats = statistics?.validation_statistics;

  return (
    <div>
      <div className="cat-view-heading-block row">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Admin Dashboard
            <p className="lead cat-view-lead">
              Platform insights and administrative controls
            </p>
          </h2>
        </div>
      </div>

      <Row className="mt-1 px-2">
        {/* Role-Based Status */}
        <Col lg={3} md={6} className="mb-4">
          <div className={styles["dashboard-section"]}>
            <div className={styles["section-header"]}>
              <FaUsers className={`me-2 ${styles["fa-users"]}`} />
              <h5 className="mb-0">Role-Based Status</h5>
            </div>
            <div className={styles["stats-list"]}>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div className={`${styles["stat-icon"]} ${styles["users"]}`}>
                    <FaUsers size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Total Users</span>
                </div>
                <span className={styles["stat-value"]}>
                  {userStats?.total_users || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["validated"]}`}
                  >
                    <FaUserCheck size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Validated</span>
                </div>
                <span className={styles["stat-value"]}>
                  {userStats?.validated_users || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["pending"]}`}
                  >
                    <FaUserClock size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Identified</span>
                </div>
                <span className={styles["stat-value"]}>
                  {userStats?.identified_users || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["rejected"]}`}
                  >
                    <FaBan size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Banned</span>
                </div>
                <span className={styles["stat-value"]}>
                  {userStats?.banned_users || 0}
                </span>
              </div>
            </div>
            <div className={styles["section-footer"]}>
              <Link
                to={ROUTES.ADMIN.USERS}
                className={`btn btn-primary w-100 ${styles["dashboard-btn-assessments"]}`}
              >
                <FaUsers className="me-2 mb-1" />
                Manage Users
              </Link>
            </div>
          </div>
        </Col>

        {/* Validations Status */}
        <Col lg={3} md={6} className="mb-4">
          <div className={styles["dashboard-section"]}>
            <div className={styles["section-header"]}>
              <FaCheckCircle className={`me-2 ${styles["fa-check-circle"]}`} />
              <h5 className="mb-0">Validations Status</h5>
            </div>
            <div className={styles["stats-list"]}>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["validated"]}`}
                  >
                    <FaCheckCircle size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Validated</span>
                </div>
                <span className={styles["stat-value"]}>
                  {validationStats?.accepted_validations || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["pending"]}`}
                  >
                    <FaClock size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Pending</span>
                </div>
                <span className={styles["stat-value"]}>
                  {validationStats?.pending_validations || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["rejected"]}`}
                  >
                    <FaTimes size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Rejected</span>
                </div>
                <span className={styles["stat-value"]}>
                  {validationStats?.rejected_validations || 0}
                </span>
              </div>
            </div>
            {(validationStats?.pending_validations ?? 0) > 0 && (
              <div
                className="py-2 px-3 mt-4"
                style={{
                  fontSize: "0.875rem",
                  backgroundColor: "#f0f4f8",
                  borderRadius: "6px",
                  color: "#334155",
                }}
              >
                <div className="d-flex align-items-center">
                  <FaExclamationCircle
                    className="me-2"
                    size={22}
                    style={{ color: "#6c757d" }}
                  />
                  <span>
                    <strong>Action Required:</strong>{" "}
                    {validationStats?.pending_validations} validation request
                    {(validationStats?.pending_validations ?? 0) > 1
                      ? "s"
                      : ""}{" "}
                    need
                    {(validationStats?.pending_validations ?? 0) === 1
                      ? "s"
                      : ""}{" "}
                    review
                  </span>
                </div>
              </div>
            )}
            <div className={styles["section-footer"]}>
              <Link
                to={ROUTES.ADMIN.VALIDATIONS}
                className={`btn btn-primary w-100 ${styles["dashboard-btn-assessments"]}`}
              >
                <FaCheckCircle className="me-2 mb-1" />
                {(validationStats?.pending_validations ?? 0) > 0 ? (
                  <>
                    Review Validations
                    <span style={{ fontWeight: "bold", marginLeft: "4px" }}>
                      ({validationStats?.pending_validations})
                    </span>
                  </>
                ) : (
                  "Manage Validations"
                )}
              </Link>
            </div>
          </div>
        </Col>

        {/* Assessments Status */}
        <Col lg={3} md={6} className="mb-4">
          <div className={styles["dashboard-section"]}>
            <div className={styles["section-header"]}>
              <FaFileAlt className={`me-2 ${styles["fa-file-alt"]}`} />
              <h5 className="mb-0">Assessments Status</h5>
            </div>
            <div className={styles["stats-list"]}>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["assessments"]}`}
                  >
                    <FaFileAlt size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Total Assessments</span>
                </div>
                <span className={styles["stat-value"]}>
                  {assessmentStats?.total_assessments || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["validated"]}`}
                  >
                    <FaEye size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Public</span>
                </div>
                <span className={styles["stat-value"]}>
                  {assessmentStats?.public_assessments || 0}
                </span>
              </div>
              <div className={styles["stat-item"]}>
                <div className={styles["stat-left"]}>
                  <div
                    className={`${styles["stat-icon"]} ${styles["pending"]}`}
                  >
                    <FaEyeSlash size={16} />
                  </div>
                  <span className={styles["stat-text"]}>Private</span>
                </div>
                <span className={styles["stat-value"]}>
                  {assessmentStats?.private_assessments || 0}
                </span>
              </div>
            </div>
            <div className={styles["section-footer"]}>
              <Link
                to={ROUTES.ADMIN.ASSESSMENTS}
                className={`btn btn-primary w-100 ${styles["dashboard-btn-assessments"]}`}
              >
                <FaFileAlt className="me-2 mb-1" />
                Manage Assessments
              </Link>
            </div>
          </div>
        </Col>

        {/* Assessment Distribution by Role */}
        <Col lg={3} md={6} className="mb-4">
          <div className={styles["dashboard-section"]}>
            <div className={styles["section-header"]}>
              <FaUserTag className={`me-2 ${styles["fa-user-tag"]}`} />
              <h5 className="mb-0">Assessment Distribution by Role</h5>
            </div>
            <div className={styles["stats-list"]}>
              {(assessmentStats?.assessment_per_role?.length || 0) > 0 ? (
                assessmentStats?.assessment_per_role?.map((roleData, index) => (
                  <div key={index} className={styles["stat-item"]}>
                    <div className={styles["stat-left"]}>
                      <div
                        className={`${styles["stat-icon"]} ${styles["users"]}`}
                      >
                        {getRoleIcon(roleData.actor)}
                      </div>
                      <span className={styles["stat-text"]}>
                        {roleData.actor}
                      </span>
                    </div>
                    <span className={styles["stat-value"]}>
                      {roleData.total_assessments}
                    </span>
                  </div>
                ))
              ) : (
                <div
                  className={`${styles["stat-item"]} justify-content-center`}
                >
                  <div className={styles["stat-left"]}>
                    <span className={styles["stat-text"]}>
                      No role data available
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Col>
      </Row>

      <Row className="mt-4 px-2">
        <Col lg={12} className="mb-4">
          <div className={styles["most-failed-section"]}>
            <div className={styles["section-header"]}>
              <FaExclamationCircle
                className={`me-2 ${styles["fa-exclamation-circle"]}`}
              />
              <h5 className="mb-0">Most Common Failed Criteria</h5>
            </div>
            <div className={styles["failed-criteria-grid"]}>
              {mostFailedCriteria?.length
                ? mostFailedCriteria.map((criteria, index) => (
                    <div key={index} className={styles["failed-criteria-item"]}>
                      <div className={styles["criteria-header"]}>
                        <div
                          className={styles["criteria-title"]}
                          title={criteria.label}
                        >
                          {criteria.cri} - {criteria.label}
                        </div>
                        <div className={styles["criteria-percentage"]}>
                          {criteria.failure_percentage}%
                        </div>
                      </div>
                      <div className={styles["criteria-description"]}>
                        Failed in <strong>{criteria.fail_count}</strong> of{" "}
                        <strong>{criteria.used_in_assessments}</strong>{" "}
                        assessments
                      </div>
                      <div className={styles["criteria-progress-bar"]}>
                        <div
                          className={styles["criteria-progress-fill"]}
                          style={{ width: `${criteria.failure_percentage}%` }}
                        />
                      </div>
                    </div>
                  ))
                : null}
            </div>

            {mostFailedCriteria?.length === 0 && (
              <div className="w-100 text-center text-muted mt-4">
                <p>No failed criteria data available</p>
              </div>
            )}
          </div>
        </Col>
      </Row>
    </div>
  );
}

export default AdminDashboard;
