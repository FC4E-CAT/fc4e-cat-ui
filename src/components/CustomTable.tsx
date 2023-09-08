import React from "react";
import { useContext } from "react";
import {
  PaginationState,
  useReactTable,
  getCoreRowModel,
  Table,
  Column,
  ColumnDef,
  ColumnFiltersState,
  getPaginationRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { AuthContext } from "../auth/AuthContext";

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

  const sortedUniqueValues = React.useMemo(
    () => {
      if (typeof firstValue === "number") {
        return [];
      }
      else {
        const uniq = column.getFacetedUniqueValues();
        return Array.from(uniq).sort()
      }
    },
    [column, firstValue]
  );

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
          <option value={value} key={value} />
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
  data_source,
}: {
  columns: ColumnDef<T>[];
  data_source: Function;
}) {
  const defaultData = React.useMemo(() => [], []);
  const { keycloak } = useContext(AuthContext)!;

  const [{ pageIndex, pageSize }, setPagination] =
    React.useState<PaginationState>({
      pageIndex: 1,
      pageSize: 10,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const pagination = React.useMemo(
    () => ({
      pageIndex,
      pageSize,
    }),
    [pageIndex, pageSize]
  );

  const { data } = data_source({
    size: pageSize,
    page: pageIndex,
    sortBy: "asc",
    token: keycloak?.token,
  });

  const table = useReactTable({
    data: data?.content ?? defaultData,
    columns,
    pageCount: data?.total_pages ?? -1,
    state: {
      columnFilters,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    manualPagination: true,
    getPaginationRowModel: getPaginationRowModel(),
    debugTable: false,
  });

  return (
    <div className="p-2">
      <div className="h-2" />
      <div className="table-responsive">
        <table className="table table-striped table-hover">
          <thead className="thead-dark">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th key={header.id} colSpan={header.colSpan}>
                      {header.isPlaceholder ? null : (
                        <>
                          {header.column.getCanFilter() ? (
                            <div>
                              <Filter column={header.column} table={table} />
                            </div>
                          ) : (
                            <>
                              <span
                              >
                                {header.column.id
                                  .split("_")
                                  .join(" ")
                                  .toLowerCase()
                                  .replace(
                                    /\b[a-z](?=[a-z])/g,
                                    function (letter) {
                                      return letter.toUpperCase();
                                    }
                                  )}
                              </span>
                              <div className="flex space-x-2">
                                <input
                                  disabled
                                  type="none"
                                  className="invisible form-control mt-1"
                                ></input>
                              </div>
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
                  {row.getVisibleCells().map(cell => {
                    return (
                      <td key={cell.id} className={cell.column.id === "user_id" ? "limited" : ""}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    )
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="h-2" />
      <nav aria-label="Page navigation example">
        <ul className="pagination custom-pagination">
          <li className="page-item">
            <button
              className="border rounded p-1"
              onClick={() => setPagination({ pageIndex: 1, pageSize })}
              disabled={pageIndex === 1}
            >
              {"<<"}
            </button>
          </li>
          <li className="page-item">
            <button
              className="border rounded p-1"
              onClick={() => table.previousPage()}
              disabled={pageIndex === 1}
            >
              {"<"}
            </button>
          </li>
          <li className="page-item">
            <button
              className="border rounded p-1"
              onClick={() => {
                setPagination({ pageIndex: pageIndex + 1, pageSize });
              }}
              disabled={pageIndex === data?.total_pages}
            >
              {">"}
            </button>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export { CustomTable };