import { Button } from "react-bootstrap";
import { FaPlus } from "react-icons/fa";
import { useTranslation } from "react-i18next";
import ROUTES from "@/routes";

const TestsHeader = () => {
  const { t } = useTranslation();

  return (
    <div className="cat-view-heading-block row border-bottom">
      <div className="col">
        <h2 className="text-muted cat-view-heading">
          {t("page_tests.title")}
          <p className="lead cat-view-lead">{t("page_tests.subtitle")}</p>
        </h2>
      </div>
      <div className="col-md-auto cat-heading-right">
        <Button href={ROUTES.ADMIN.TESTS.CREATE} variant="warning">
          <FaPlus /> {t("buttons.create_new")}
        </Button>
      </div>
    </div>
  );
};

export default TestsHeader;
