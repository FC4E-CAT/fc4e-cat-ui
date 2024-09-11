import { useAdminGetUsers, useDeleteUser, useRestoreUser } from "@/api";
import { AuthContext } from "@/auth";
import { AlertInfo, UserProfile } from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  Form,
  Modal,
  OverlayTrigger,
  Table,
  Tooltip,
} from "react-bootstrap";
import {
  FaArrowDown,
  FaArrowLeft,
  FaArrowRight,
  FaArrowUp,
  FaArrowsAltV,
  FaBars,
  FaCheckCircle,
  FaExclamationTriangle,
  FaShieldAlt,
  FaTrashAlt,
  FaTrashRestoreAlt,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { idToColor, trimField } from "@/utils/admin";
import { Link } from "react-router-dom";

type UserState = {
  sortOrder: string;
  sortBy: string;
  type: string;
  page: number;
  size: number;
  search: string;
  status: string;
};

// Modes under which UserModal operates
enum UserModalMode {
  Delete,
  Restore,
}

// Basic configuration for subject modal
type UserModalBasicConfig = {
  mode: UserModalMode;
  id: string;
  name?: string;
  show: boolean;
};

// Props for subject modal
type UserModalProps = UserModalBasicConfig & {
  onHide: () => void;
  handleRestore: (id: string, reason: string) => void;
  handleDelete: (id: string, reason: string) => void;
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
          props.mode == UserModalMode.Delete
            ? "bg-danger text-white"
            : "bg-success text-white"
        }
        closeButton
      >
        <Modal.Title id="contained-modal-title-vcenter">
          {props.mode == UserModalMode.Delete && (
            <span>
              <FaTrashAlt className="me-2" /> Delete user
            </span>
          )}
          {props.mode == UserModalMode.Restore && (
            <span>
              <FaTrashRestoreAlt className="me-2" /> Restore user
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div>
            <div>Are you sure you want to delete the following user ?</div>
            <div>
              id: <strong>{props.id}</strong>
            </div>
            {props.name && (
              <div>
                name: <strong>{props.name}</strong>
              </div>
            )}
          </div>
          <Form.Group className="mb-3" controlId="input-delete-user-reason">
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
        {props.mode == UserModalMode.Delete && (
          <Button
            className="btn-danger"
            onClick={() => {
              if (reason === "") {
                setError(true);
              } else {
                props.handleDelete(props.id, reason);
              }
            }}
          >
            Delete
          </Button>
        )}
        {props.mode == UserModalMode.Restore && (
          <Button
            className="btn-success"
            onClick={() => {
              {
                if (reason === "") {
                  setError(true);
                } else {
                  props.handleRestore(props.id, reason);
                }
              }
            }}
          >
            Restore
          </Button>
        )}
      </Modal.Footer>
    </Modal>
  );
}

// create an up/down arrow to designate sorting in a column
const SortMarker = (field: string, sortField: string, sortOrder: string) => {
  if (field === sortField) {
    if (sortOrder === "DESC") return <FaArrowUp />;
    else if (sortOrder === "ASC") return <FaArrowDown />;
  }
  return <FaArrowsAltV className="text-secondary opacity-50" />;
};

// create a user status badge for deleted and active
const UserStatusBadge = (banned: boolean) => {
  if (banned)
    return (
      <small className="badge bg-light text-danger border-danger">
        Deleted
      </small>
    );
  return <span className="badge bg-light text-success border">Active</span>;
};

// create a user type badge for identified, admin and verified
const UserTypeBadge = (userType: string) => {
  const userTypeLower = userType.toLowerCase();
  if (userTypeLower === "identified") {
    return <span className="badge bg-secondary">Identified</span>;
  } else if (userTypeLower === "admin") {
    return (
      <span className="badge bg-primary">
        <FaShieldAlt /> Admin
      </span>
    );
  } else if (userTypeLower === "validated") {
    return (
      <span className="badge bg-success">
        <FaCheckCircle /> Validated
      </span>
    );
  } else {
    return null;
  }
};

// create the tooltips
const tooltipDelete = <Tooltip id="tip-delete">Delete User</Tooltip>;
const tooltipRestore = <Tooltip id="tip-restore">Restore User</Tooltip>;
const tooltipView = <Tooltip id="tip-restore">View User Details</Tooltip>;

// the main component that lists the admin users in a table
export default function AdminUsers() {
  // toast alert reference used in notification messaging
  const toastAlert = useRef<AlertInfo>({
    message: "",
  });

  const { keycloak, registered } = useContext(AuthContext)!;

  const [userModalConfig, setUserModalConfig] = useState<UserModalBasicConfig>({
    mode: UserModalMode.Delete,
    show: false,
    id: "",
    name: "",
  });

  // hooks for handling subjects in through the backend
  const mutationBanUser = useDeleteUser(keycloak?.token || "");
  const mutationUnbanUser = useRestoreUser(keycloak?.token || "");

  const handleRestore = (id: string, reason: string) => {
    const promise = mutationUnbanUser
      .mutateAsync({ user_id: id, reason: reason })
      .catch((err) => {
        toastAlert.current = {
          message: "Error during user restore.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "User succesfully restored",
        };
        // close the modal
        setUserModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Restoring User...",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleDelete = (id: string, reason: string) => {
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

  const [opts, setOpts] = useState<UserState>({
    sortBy: "name",
    sortOrder: "ASC",
    type: "",
    page: 1,
    size: 20,
    search: "",
    status: "",
  });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // handler for clicking to sort
  const handleSortClick = (field: string) => {
    if (field === opts.sortBy) {
      if (opts.sortOrder === "ASC") {
        setOpts({ ...opts, sortOrder: "DESC" });
      } else {
        setOpts({ ...opts, sortOrder: "ASC" });
      }
    } else {
      setOpts({ ...opts, sortOrder: "ASC", sortBy: field });
    }
  };

  // data get admin users
  const { isLoading, data, refetch } = useAdminGetUsers({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: opts.search,
    type: opts.type,
    status: opts.status,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the user data to create the table
  const users: UserProfile[] = data ? data?.content : [];

  return (
    <div>
      <div className="cat-view-heading-block row border-bottom">
        <UserModal
          {...userModalConfig}
          onHide={() => setUserModalConfig({ ...userModalConfig, show: false })}
          handleDelete={handleDelete}
          handleRestore={handleRestore}
        />
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            Users
            <p className="lead cat-view-lead">Manage all Users.</p>
          </h2>
        </div>
        <div className="col-md-auto  cat-heading-right"></div>
      </div>
      <div>
        <Form className="mb-3">
          <div className="row cat-view-search-block border-bottom">
            <div className="col col-lg-3">
              <Form.Select
                onChange={(e) => {
                  setOpts({ ...opts, type: e.target.value });
                }}
                value={opts.type}
              >
                <option value="">Select type...</option>
                <option>Identified</option>
                <option>Validated</option>
                <option>Admin</option>
              </Form.Select>
            </div>
            <div className="col-md-auto">
              <Form.Select
                onChange={(e) => {
                  setOpts({ ...opts, status: e.target.value });
                }}
                value={opts.status}
              >
                <option value="">Select status...</option>
                <option value="active">Active</option>
                <option value="deleted">Deleted</option>
              </Form.Select>
            </div>
            <div className="col col-lg-6">
              <div className="d-flex justify-content-center">
                <Form.Control
                  placeholder="Search ..."
                  onChange={(e) => {
                    setOpts({ ...opts, search: e.target.value });
                  }}
                  value={opts.search}
                />
                <Button
                  onClick={() => {
                    setOpts({ ...opts, search: "", type: "", status: "" });
                  }}
                  className="ms-4"
                >
                  Clear
                </Button>
              </div>
            </div>
          </div>
        </Form>

        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span
                  onClick={() => handleSortClick("name")}
                  className="cat-cursor-pointer"
                >
                  Name {SortMarker("name", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("email")}
                  className="cat-cursor-pointer"
                >
                  Email {SortMarker("email", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span>Registered</span>
              </th>
              <th>
                <span>User Type</span>
              </th>
              <th>
                <span>Status</span>
              </th>
              <th></th>
            </tr>
          </thead>
          {users.length > 0 ? (
            <tbody>
              {users.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">
                      <div className="d-flex  justify-content-start">
                        <div>
                          <FaUserCircle
                            size={"3rem"}
                            style={{ color: idToColor(item.id) }}
                          />
                        </div>
                        <div className="ms-2 d-flex flex-column justify-content-between">
                          <div>
                            {(item.name || "") + " " + (item.surname || "")}
                          </div>
                          <div>
                            <span
                              style={{ fontSize: "0.64rem" }}
                              className="text-muted"
                            >
                              id: {trimField(item.id, 20)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{item.email}</td>
                    <td className="align-middle">
                      {item.registered_on.split("T")[0]}
                    </td>
                    <td className="align-middle">
                      {UserTypeBadge(item.user_type)}
                    </td>
                    <td className="align-middle">
                      {UserStatusBadge(item.banned)}
                    </td>
                    <td>
                      <OverlayTrigger placement="top" overlay={tooltipView}>
                        <Link
                          className="btn btn-sm btn-light"
                          to={`/admin/users/view/${item.id}`}
                        >
                          <FaBars />
                        </Link>
                      </OverlayTrigger>
                      {item.banned ? (
                        <OverlayTrigger
                          placement="top"
                          overlay={tooltipRestore}
                        >
                          <Button
                            className="btn-light btn-sm m-1"
                            onClick={() => {
                              setUserModalConfig({
                                id: item.id,
                                mode: UserModalMode.Restore,
                                show: true,
                                name: item.name,
                              });
                            }}
                          >
                            <FaTrashRestoreAlt />
                          </Button>
                        </OverlayTrigger>
                      ) : (
                        <OverlayTrigger placement="top" overlay={tooltipDelete}>
                          <Button
                            className="btn-light btn-sm m-1"
                            onClick={() => {
                              setUserModalConfig({
                                id: item.id,
                                mode: UserModalMode.Delete,
                                name: item.name,
                                show: true,
                              });
                            }}
                          >
                            <FaTrashAlt />
                          </Button>
                        </OverlayTrigger>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : null}
        </Table>
        {!isLoading && users.length === 0 && (
          <Alert variant="warning" className="text-center mx-auto">
            <h3>
              <FaExclamationTriangle />
            </h3>
            <h5>No data found...</h5>
          </Alert>
        )}
        <div className="d-flex justify-content-end">
          <div>
            <span className="mx-1">rows per page: </span>
            <select
              name="per-page"
              value={opts.size.toString() || "20"}
              id="per-page"
              onChange={handleChangePageSize}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="15">15</option>
              <option value="20">20</option>
            </select>
          </div>

          {data && data.number_of_page && data.total_pages && (
            <div className="ms-4">
              <span>
                {(data.number_of_page - 1) * opts.size + 1} -{" "}
                {(data.number_of_page - 1) * opts.size + data.size_of_page} of{" "}
                {data.total_elements}
              </span>
              <span
                onClick={() => {
                  setOpts({ ...opts, page: opts.page - 1 });
                }}
                className={`ms-4 btn py-0 btn-light btn-small ${
                  opts.page === 1 ? "disabled text-muted" : null
                }`}
              >
                <FaArrowLeft />
              </span>
              <span
                onClick={() => {
                  setOpts({ ...opts, page: opts.page + 1 });
                }}
                className={`btn py-0 btn-light btn-small" ${
                  data?.total_pages > data?.number_of_page
                    ? null
                    : "disabled text-muted"
                }`}
              >
                <FaArrowRight />
              </span>
            </div>
          )}
        </div>
      </div>
      <div className="row py-3 p-4">
        <div className="col"></div>
      </div>
    </div>
  );
}
