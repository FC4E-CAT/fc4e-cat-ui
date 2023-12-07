/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-types */
import React, { useCallback, useEffect, useState } from "react";
import { useContext } from "react";
import {
  useReactTable,
  getCoreRowModel,
  Table,
  Column,
  ColumnDef,
  ColumnFiltersState,
  getFacetedUniqueValues,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { AuthContext } from "@/auth";
import { TableExtraDataOps } from "@/types";
import { Link } from "react-router-dom";
import { Alert, Col, Row } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";

function Filter({
  column,
  table,
}: {
  column: Column<any, unknown>;
  table: Table<any>;
}) {
  const firstValue = table
    .getPreFilteredRowModel()
    .flatRows[0]?.getValue(column.id);

  let columnFilterValue = column.getFilterValue();
  if (columnFilterValue === undefined) {
    columnFilterValue = "";
  }

  const sortedUniqueValues = React.useMemo(() => {
    if (typeof firstValue === "number") {
      return [];
    } else {
      const uniq = column.getFacetedUniqueValues();
      return Array.from(uniq).sort();
    }
  }, [column, firstValue]);

  return (
    <div className={column.id === "user_id" ? "limited" : ""}>
      <span>
        {column.id
          .split("_")
          .join(" ")
          .toLowerCase()
          .replace(/\b[a-z](?=[a-z])/g, function (letter) {
            return letter.toUpperCase();
          })}
      </span>
      <datalist id={column.id + "list"}>
        {sortedUniqueValues.slice(0, 5000).map((value: any) => (
          <option value={value[0]} key={value} />
        ))}
      </datalist>
      <DebouncedInput
        type="text"
        value={(columnFilterValue ?? undefined) as string}
        onChange={(value) => column.setFilterValue(value)}
        placeholder={`Search...`}
        className="form-control mt-1"
        list={column.id + "list"}
        column={column}
      />
      <div className="h-1" />
    </div>
  );
}

function DebouncedInput({
  value: initialValue,
  onChange,
  debounce = 500,
  column,
  ...props
}: {
  value: string | number;
  onChange: (value: string | number) => void;
  debounce?: number;
  column: Column<any, unknown>;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange">) {
  const [value, setValue] = React.useState(initialValue);
  const timeout = React.useRef<number>(0);

  React.useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  React.useEffect(() => {
    timeout.current = debounce;
    const tmt = setTimeout(() => {
      if (
        value !== undefined &&
        value !== "" &&
        value !== column.getFilterValue()
      ) {
        onChange(value);
      }
    }, timeout.current);

    return () => clearTimeout(tmt);
  }, [value, column, debounce, onChange]);

  return (
    <input
      {...props}
      value={value}
      onChange={(e) => {
        timeout.current = 100;
        if (e.target.value === "") {
          onChange(e.target.value);
        } else {
          setValue(e.target.value);
        }
      }}
    />
  );
}

function CustomTable<T>({
  columns,
  dataSource,
  extraDataOps,
  goBackLoc,
}: {
  columns: ColumnDef<T>[];
  dataSource: Function;
  extraDataOps?: TableExtraDataOps;
  goBackLoc?: string;
}) {
  const defaultData = React.useMemo(() => [], []);
  const { keycloak } = useContext(AuthContext)!;

  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const [pagination, setPagination] = useState<{
    current_page_idx: number;
    next_page_idx: number;
    first_page_idx: number;
    last_page_idx: number;
    total_pages: number;
    page_size: number;
    total_elements?: number;
  }>({
    current_page_idx: 1,
    next_page_idx: 1,
    first_page_idx: 1,
    last_page_idx: 1,
    total_pages: 1,
    page_size: 10,
    total_elements: 10,
  });

  const { data } = dataSource({
    ...{
      size: 10,
      page: pagination.current_page_idx,
      sortBy: "asc",
      token: keycloak?.token,
    },
    ...(extraDataOps || {}),
  });

  useEffect(() => {
    let pagin = {
      current_page_idx: 1,
      next_page_idx: 1,
      first_page_idx: 1,
      last_page_idx: 1,
      total_pages: 1,
      page_size: 10,
      total_elements: 10,
    };

    if (data) {
      pagin = {
        ...pagin,
        page_size: data["size_of_page"],
        total_elements: data["total_elements"],
        total_pages: data["total_pages"],
        next_page_idx: data["total_pages"],
      };
    }
    if (data) {
      if (data?.links.length > 0) {
        data?.links.forEach((l: { href: string; rel: string }) => {
          const url = new URL(l["href"]);
          if (l["rel"] === "last") {
            pagin = {
              ...pagin,
              last_page_idx: parseInt(url.searchParams.get("page") || ""),
            };
          } else if (l["rel"] === "next") {
            pagin = {
              ...pagin,
              next_page_idx: parseInt(url.searchParams.get("page") || ""),
            };
          } else if (l["rel"] === "self") {
            pagin = {
              ...pagin,
              current_page_idx: parseInt(url.searchParams.get("page") || ""),
            };
          } else if (l["rel"] === "first") {
            pagin = {
              ...pagin,
              first_page_idx: parseInt(url.searchParams.get("page") || ""),
            };
          }
        });
        setPagination(pagin);
      } else {
        pagin = {
          ...pagin,
          current_page_idx: data["total_pages"],
        };
        setPagination(pagin);
      }
    }
  }, [data]);

  const table = useReactTable({
    data: data?.content ?? defaultData,
    columns,
    pageCount: data?.total_pages ?? -1,
    state: {
      columnFilters,
    },
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    debugTable: false,
  });

  const renderPagination = useCallback(() => {
    return (
      <Row>
        <Col>
          <ul className="pagination custom-pagination">
            <li className="page-item">
              <button
                className={
                  pagination?.current_page_idx === 1
                    ? "page-link disabled"
                    : "page-link"
                }
                onClick={() => {
                  setPagination({
                    ...pagination,
                    current_page_idx: 1,
                  });
                }}
              >
                {"<<"}
              </button>
            </li>
            <li className="page-item">
              <button
                className={
                  pagination?.current_page_idx === 1
                    ? "page-link disabled"
                    : "page-link"
                }
                onClick={() => {
                  setPagination({
                    ...pagination,
                    current_page_idx: pagination.current_page_idx - 1,
                  });
                }}
              >
                {"<"}
              </button>
            </li>
            <li className="page-item">
              <button
                className="w-max-content page-link text-center text-secondary"
                disabled
              >{`${pagination.current_page_idx.toString()} of ${
                pagination.total_pages
              }`}</button>
            </li>
            <li className="page-item">
              <button
                className={
                  pagination?.current_page_idx === pagination?.last_page_idx
                    ? "page-link disabled"
                    : "page-link"
                }
                onClick={() => {
                  setPagination({
                    ...pagination,
                    current_page_idx: pagination?.next_page_idx,
                  });
                }}
              >
                {">"}
              </button>
            </li>
            <li className="page-item">
              <button
                className={
                  pagination.current_page_idx >= pagination?.last_page_idx
                    ? "page-link disabled"
                    : "page-link"
                }
                onClick={() => {
                  setPagination({
                    ...pagination,
                    current_page_idx: pagination?.last_page_idx,
                  });
                }}
              >
                {">>"}
              </button>
            </li>
          </ul>
        </Col>
        <Col className="text-end">
          {goBackLoc && (
            <Link className=" btn btn-secondary mx-3" to={goBackLoc}>
              Back
            </Link>
          )}
        </Col>
      </Row>
    );
  }, [pagination, goBackLoc]);

  return (
    <div className="p-2">
      <div className="h-2" />
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="thead-dark border-top">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      style={{ verticalAlign: "top" }}
                      key={header.id}
                      colSpan={header.colSpan}
                    >
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : (
                            <>
                              <span>
                                {header.column.id
                                  .split("_")
                                  .join(" ")
                                  .toLowerCase()
                                  .replace(
                                    /\b[a-z](?=[a-z])/g,
                                    function (letter) {
                                      return letter.toUpperCase();
                                    },
                                  )}
                              </span>
                            </>
                          )}
                        </>
                      )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => {
              return (
                <tr key={row.id}>
                  {row.getVisibleCells().map((cell) => {
                    return (
                      <td
                        key={cell.id}
                        className={
                          cell.column.id === "user_id" ? "limited" : ""
                        }
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
        {data && data.content.length === 0 && (
          <Alert variant="warning" className="text-center mx-auto">
            <h3>
              <FaExclamationTriangle />
            </h3>
            <h5>No data found...</h5>
          </Alert>
        )}
      </div>
      <div className="d-flex justify-content-center">
        <nav aria-label="Page navigation">
          {pagination && renderPagination()}
        </nav>
      </div>
    </div>
  );
}

export { CustomTable };
