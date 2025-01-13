import { useTranslation } from "react-i18next";
import { FaShieldAlt, FaCheckCircle } from "react-icons/fa";

// create a user type badge for identified, admin and verified
export default function BadgeUserType({ userType }: { userType: string }) {
  const userTypeLower = userType.toLowerCase();
  const { t } = useTranslation();

  if (userTypeLower === "identified") {
    return (
      <span className="badge bg-secondary-cat">
        {t("page_admin_users.identified")}
      </span>
    );
  } else if (userTypeLower === "admin") {
    return (
      <span className="badge bg-primary-cat">
        <FaShieldAlt /> {t("page_admin_users.admin")}
      </span>
    );
  } else if (userTypeLower === "validated") {
    return (
      <span className="badge bg-success-cat">
        <FaCheckCircle /> {t("page_admin_users.validated")}
      </span>
    );
  } else {
    return null;
  }
}
