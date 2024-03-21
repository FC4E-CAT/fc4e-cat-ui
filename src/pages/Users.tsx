import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { useGetAdminUsers, useUnbanUser, useBanUser } from "@/api";
import { CustomTable } from "@/components";
import { FaLock, FaLockOpen, FaUnlock, FaUsers } from "react-icons/fa";
import { AlertInfo, UserProfile } from "@/types";
import { Button, Form, Modal } from "react-bootstrap";
import { AuthContext } from "@/auth";
import toast from "react-hot-toast";

// Modes under which UserModal operates
enum UserModalMode {
  Ban,
  Unban,
}

// Basic configuration for subject modal
type UserModalBasicConfig = {
  mode: UserModalMode;
  id: string;
  show: boolean;
};

// Props for subject modal
type UserModalProps = UserModalBasicConfig & {
  onHide: () => void;
  handleUnban: (id: string, reason: string) => void;
  handleBan: (id: string, reason: string) => void;
};

// Creates a modal with a small form to create/edit a subject
export function UserModal(props: UserModalProps) {
  const [reason, setReason] = useState<string>("");
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    if (props.show) {
      setReason("");
      setError(false);
    }
  }, [props.show]);

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header
        className={
          props.mode == UserModalMode.Ban
            ? "bg-danger text-white"
            : "bg-success text-white"
        }
        closeButton
      >
        <Modal.Title id="contained-modal-title-vcenter">
          {props.mode == UserModalMode.Ban && (
            <span>
              <FaLock className="me-2" /> Ban user
            </span>
          )}
          {props.mode == UserModalMode.Unban && (
            <span>
              <FaUnlock className="me-2" /> Unban user
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <p>
            Are you sure you want to ban user with id:{" "}
            <strong>{props.id}</strong> ?
          </p>
          <Form.Group className="mb-3" controlId="input-ban-user-reason">
            <Form.Label>
              <strong>Reason (*)</strong>
            </Form.Label>
            <Form.Control
              className={error ? "is-invalid" : ""}
              as="textarea"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {error && <p className="text-danger">You must specify a reason</p>}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={() => props.onHide()}>
          Cancel
        </Button>
        {props.mode == UserModalMode.Ban && (
          <Button
            className="btn-danger"
            onClick={() => {
              if (reason === "") {
                setError(true);
              } else {
                props.handleBan(props.id, reason);
              }
            }}
          >
            Ban
          </Button>
        )}
        {props.mode == UserModalMode.Unban && (
          <Button
            className="btn-sucess"
            onClick={() => {
              {
                if (reason === "") {
                  setError(true);
                } else {
                  props.handleUnban(props.id, reason);
                }
              }
            }}
          >
            Unban
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function Users() {
  // toast alert reference used in notification messaging
  const toastAlert = useRef<AlertInfo>({
    message: "",
  });

  const [userModalConfig, setUserModalConfig] = useState<UserModalBasicConfig>({
    mode: UserModalMode.Ban,
    show: false,
    id: "",
  });
  // mutation hook for creating a new subject
  const { keycloak } = useContext(AuthContext)!;

  // hooks for handling subjects in through the backend
  const mutationBanUser = useBanUser(keycloak?.token || "");
  const mutationUnbanUser = useUnbanUser(keycloak?.token || "");

  const handleUnban = (id: string, reason: string) => {
    const promise = mutationUnbanUser
      .mutateAsync({ user_id: id, reason: reason })
      .catch((err) => {
        toastAlert.current = {
          message: "Error during user unban.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "User succesfully unbanned",
        };
        // close the modal
        setUserModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Unbanning...",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleBan = (id: string, reason: string) => {
    const promise = mutationBanUser
      .mutateAsync({ user_id: id, reason: reason })
      .catch((err) => {
        toastAlert.current = {
          message: "Error during user ban.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "Subject succesfully banned.",
        };
        // close the modal
        setUserModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Banning...",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const cols = useMemo<ColumnDef<UserProfile>[]>(
    () => [
      {
        accessorKey: "id",
        header: () => <span>ID</span>,
        cell: (info) => info.getValue(),
        // footer: props => props.column.id,
      },
      {
        accessorKey: "email",
        header: () => <span>Email</span>,
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
      {
        accessorFn: (row) => row,
        enableColumnFilter: false,
        id: "Status",
        cell: (info) => {
          const item: UserProfile = info.getValue() as UserProfile;
          return item.banned ? (
            <span className="badge bg-danger">banned</span>
          ) : (
            <span className="badge bg-success">active</span>
          );
        },
      },
      {
        accessorFn: (row) => row,
        enableColumnFilter: false,
        id: "Action",
        cell: (info) => {
          const item: UserProfile = info.getValue() as UserProfile;
          return item.banned ? (
            <span
              className="ms-4 btn btn-sm btn-outline-success"
              onClick={() => {
                setUserModalConfig({
                  id: item.id,
                  mode: UserModalMode.Unban,
                  show: true,
                });
              }}
            >
              <FaLockOpen />
            </span>
          ) : (
            <span
              className="ms-4 btn btn-sm btn-outline-danger"
              onClick={() => {
                setUserModalConfig({
                  id: item.id,
                  mode: UserModalMode.Ban,
                  show: true,
                });
              }}
            >
              <FaLock />
            </span>
          );
        },
      },
    ],
    [],
  );

  return (
    <div className="mt-4">
      <UserModal
        {...userModalConfig}
        onHide={() => setUserModalConfig({ ...userModalConfig, show: false })}
        handleBan={handleBan}
        handleUnban={handleUnban}
      />
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
