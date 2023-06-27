import React from 'react'
import { useContext } from 'react';
import {
    PaginationState,
    useReactTable,
    getCoreRowModel,
    ColumnDef,
    getPaginationRowModel,
    flexRender,
} from '@tanstack/react-table'

import { AuthContext } from '../auth/AuthContext';


function Table<T>({ columns, data_source }: { columns: ColumnDef<T>[], data_source: Function }) {

    const defaultData = React.useMemo(() => [], [])
    const { authenticated, setAuthenticated, keycloak, setKeycloak } = useContext(AuthContext)!;

    const [{ pageIndex, pageSize }, setPagination] =
        React.useState<PaginationState>({
            pageIndex: 1,
            pageSize: 10,
        })

    const pagination = React.useMemo(
        () => ({
            pageIndex,
            pageSize,
        }),
        [pageIndex, pageSize]
    )

    const { data } = data_source(
        { limit: pagination.pageSize, page: pagination.pageIndex, sortBy: "asc", token: keycloak?.token }
    );

    const table = useReactTable({
        data: data?.content?.slice(
            data?.number_of_page - 1,
            data?.number_of_page
        ) ?? defaultData,
        columns,
        pageCount: data?.total_pages ?? -1,
        state: {
            pagination,
        },
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        getPaginationRowModel: getPaginationRowModel(),
        debugTable: false,
    })

    return (
        <div className="p-2">
            <div className="h-2" />
            <table className="table table-striped table-hover">
                <thead>
                    {table.getHeaderGroups().map(headerGroup => (
                        <tr key={headerGroup.id}>
                            {headerGroup.headers.map(header => {
                                return (
                                    <th key={header.id} colSpan={header.colSpan}>
                                        {header.isPlaceholder ? null : (
                                            <div>
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                            </div>
                                        )}
                                    </th>
                                )
                            })}
                        </tr>
                    ))}
                </thead>
                <tbody>
                    {table.getRowModel().rows.map(row => {
                        return (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => {
                                    return (
                                        <td key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    )
                                })}
                            </tr>
                        )
                    })}
                </tbody>
            </table>
            <div className="h-2" />
            <nav aria-label="Page navigation example">
                <ul className="pagination custom-pagination">
                    <li className="page-item">
                        <button
                            className="border rounded p-1"
                            onClick={() => table.setPageIndex(0)}
                            disabled={pageIndex === 1}
                        >
                            {'<<'}
                        </button>
                    </li>
                    <li className="page-item">
                        <button
                            className="border rounded p-1"
                            onClick={() => table.previousPage()}
                            disabled={pageIndex === 1}
                        >
                            {'<'}
                        </button>
                    </li>
                    <li className="page-item">
                        <span className="flex items-center gap-1">
                            <input
                                type="number"
                                defaultValue={table.getState().pagination.pageIndex + 1}
                                onChange={e => {
                                    const page = e.target.value ? Number(e.target.value) - 1 : 0
                                    table.setPageIndex(page)
                                }}
                                disabled={pageIndex === data?.total_pages}
                                className="form-control border p-1 rounded w-16"
                            />
                        </span>
                    </li>
                    <li className="page-item">
                        <button
                            className="border rounded p-1"
                            onClick={() => { table.nextPage(); }}
                            disabled={!table.getCanNextPage()}
                        >
                            {'>'}
                        </button>
                    </li>
                    <li className="page-item">
                        <button
                            className="border rounded p-1"
                            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                            disabled={!table.getCanNextPage()}
                        >
                            {'>>'}
                        </button>
                    </li>
                </ul>
                {/* {dataQuery.isFetching ? 'Loading...' : null} */}
            </nav>
        </div>
    )
}

export { Table };