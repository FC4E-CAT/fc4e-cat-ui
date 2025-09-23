import React from "react";
import { Button, Form } from "react-bootstrap";
import { useTranslation } from "react-i18next";

interface TestSearchProps {
  searchValue: string;
  onSearchChange: (searchText: string) => void;
  onClearSearch: () => void;
}

const TestSearch: React.FC<TestSearchProps> = ({
  searchValue,
  onSearchChange,
  onClearSearch,
}) => {
  const { t } = useTranslation();

  return (
    <Form className="mb-3">
      <div className="row cat-view-search-block border-bottom">
        <div className="col col-lg-3"></div>
        <div className="col md-auto col-lg-9">
          <div className="d-flex justify-content-center">
            <Form.Control
              placeholder={t("fields.search")}
              onChange={(e) => onSearchChange(e.target.value)}
              value={searchValue}
            />
            <Button onClick={onClearSearch} className="ms-4">
              {t("buttons.clear")}
            </Button>
          </div>
        </div>
      </div>
    </Form>
  );
};

export default TestSearch;
