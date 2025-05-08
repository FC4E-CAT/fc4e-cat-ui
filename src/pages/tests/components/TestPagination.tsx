import React from "react";
import { FaArrowLeft, FaArrowRight } from "react-icons/fa";
import { useTranslation } from "react-i18next";

interface PaginationProps {
  page: number;
  size: number;
  totalPages?: number;
  totalElements?: number;
  numberOfPage?: number;
  sizeOfPage?: number;
  onPageSizeChange: (size: number) => void;
  onPageChange: (page: number) => void;
}

const TestPagination: React.FC<PaginationProps> = ({
  page,
  size,
  totalPages,
  totalElements,
  numberOfPage,
  sizeOfPage,
  onPageSizeChange,
  onPageChange,
}) => {
  const { t } = useTranslation();

  const handleChangePageSize = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    onPageSizeChange(parseInt(evt.target.value));
  };

  return (
    <div className="d-flex justify-content-end">
      <div>
        <span className="mx-1">{t("rows_per_page")} </span>
        <select
          name="per-page"
          value={size.toString()}
          id="per-page"
          onChange={handleChangePageSize}
        >
          <option value="5">5</option>
          <option value="10">10</option>
          <option value="15">15</option>
          <option value="20">20</option>
        </select>
      </div>

      {numberOfPage && totalPages && (
        <div className="ms-4">
          <span>
            {(numberOfPage - 1) * size + 1} -{" "}
            {(numberOfPage - 1) * size + (sizeOfPage || 0)} of {totalElements}
          </span>
          <span
            onClick={() => onPageChange(page - 1)}
            className={`ms-4 btn py-0 btn-light btn-small ${
              page === 1 ? "disabled text-muted" : null
            }`}
          >
            <FaArrowLeft />
          </span>
          <span
            onClick={() => onPageChange(page + 1)}
            className={`btn py-0 btn-light btn-small ${
              totalPages > numberOfPage ? null : "disabled text-muted"
            }`}
          >
            <FaArrowRight />
          </span>
        </div>
      )}
    </div>
  );
};

export default TestPagination;
