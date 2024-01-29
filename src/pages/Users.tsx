import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useGetAdminUsers } from "@/api";
import { CustomTable } from "@/components";
import { FaUsers } from "react-icons/fa";
import { UserProfile } from "@/types";

function Users() {
  const cols = useMemo<ColumnDef<UserProfile>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <span>ID</span>,
        cell: (info) => info.getValue(),
        // footer: props => props.column.id,
      },
      {
        accessorFn: (row) => row.user_type,
        id: "user_type",
        cell: (info) => info.getValue(),
        header: () => <span>Type</span>,
        // footer: props => props.column.id,
      },
      {
        accessorFn: (row) => row.registered_on,
        id: "registered_on",
        cell: (info) => info.getValue(),
        header: () => <span>Registered On</span>,
        // footer: props => props.column.id,
      },
    ],
    [],
  );

  return (
    <div className="mt-4">
      <div className={"alert alert-primary d-flex justify-content-between"}>
        <h3>
          <FaUsers /> users
        </h3>
        <h3 className="opacity-50">admin mode</h3>
      </div>
      <CustomTable columns={cols} dataSource={useGetAdminUsers} />
    </div>
  );
}

export default Users;
