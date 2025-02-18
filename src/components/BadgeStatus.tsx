import { useTranslation } from "react-i18next";
import { FaCheck, FaTimes, FaGlasses } from "react-icons/fa";

// create a user type badge for identified, admin and verified
export default function BadgeStatus({ status }: { status: string }) {
  const { t } = useTranslation();
  if (status === "APPROVED") {
    return (
      <span className="badge bg-success-cat">
        <FaCheck /> {t("approved")}
      </span>
    );
  } else if (status === "REJECTED") {
    return (
      <span className="badge bg-danger-cat">
        <FaTimes /> {t("rejected")}
      </span>
    );
  } else if (status === "REVIEW") {
    return (
      <span className="badge bg-primary-cat">
        <FaGlasses /> {t("review")}
      </span>
    );
  } else {
    return null;
  }
}
