import { useMemo } from 'react';
import {
    ColumnDef,
} from '@tanstack/react-table'
import { UserAPI } from '../api';
import { CustomTable } from '../components/CustomTable';
import { FaUsers } from 'react-icons/fa';
import { UserProfile } from '../types';


function Users() {

    const cols = useMemo<ColumnDef<UserProfile>[]>(
        () => [
            {
                header: ' ',
                footer: props => props.column.id,
                columns: [
                    {
                        accessorKey: 'id',
                        header: () => <span>ID</span>,
                        cell: info => info.getValue(),
                        footer: props => props.column.id,
                    },
                    {
                        accessorFn: row => row.user_type,
                        id: 'user_type',
                        cell: info => info.getValue(),
                        header: () => <span>Type</span>,
                        footer: props => props.column.id,
                    },
                    {
                        accessorFn: row => row.registered_on,
                        id: 'registered_on',
                        cell: info => info.getValue(),
                        header: () => <span>Registered On</span>,
                        footer: props => props.column.id,
                    }
                ],
            },
        ],
        []
    )

    return (
        <div className="mt-4">
            <h3 className="cat-view-heading"><FaUsers /> users</h3>
            <CustomTable columns={cols} data_source={UserAPI.useGetUsers} />
        </div>
    );
}

export default Users;
