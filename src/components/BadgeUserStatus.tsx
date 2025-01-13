import { useTranslation } from "react-i18next";

// create a user type badge for identified, admin and verified
export default function BadgeUserStatus({ banned }: { banned: boolean }) {
  const { t } = useTranslation();
  if (banned)
    return (
      <small className="badge bg-light text-danger border-danger">
        {t("page_admin_users.deleted")}
      </small>
    );
  return (
    <span className="badge bg-light text-success border">
      {t("page_admin_users.active")}
    </span>
  );
}
