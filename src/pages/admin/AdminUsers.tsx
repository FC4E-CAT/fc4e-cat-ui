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
  FaExclamationTriangle,
  FaTrashAlt,
  FaTrashRestoreAlt,
  FaUserCircle,
} from "react-icons/fa";
import toast from "react-hot-toast";
import { idToColor, trimField } from "@/utils/admin";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { t } from "i18next";
import BadgeUserType from "@/components/BadgeUserType";
import BadgeUserStatus from "@/components/BadgeUserStatus";

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

  const { t } = useTranslation();

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
              <FaTrashAlt className="me-2" />
              {t("page_admin_users.delete")}
            </span>
          )}
          {props.mode == UserModalMode.Restore && (
            <span>
              <FaTrashRestoreAlt className="me-2" />
              {t("page_admin_users.restore")}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <div>
            <div>{t("page_admin_users.delete_confirm")}</div>
            <div>
              {t("fields.id")}: <strong>{props.id}</strong>
            </div>
            {props.name && (
              <div>
                {t("fields.name")}: <strong>{props.name}</strong>
              </div>
            )}
          </div>
          <Form.Group className="mb-3" controlId="input-delete-user-reason">
            <Form.Label>
              <strong>{t("page_admin_users.reason")} (*)</strong>
            </Form.Label>
            <Form.Control
              className={error ? "is-invalid" : ""}
              as="textarea"
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            {error && (
              <p className="text-danger">{t("page_admin_users.reason_tip")}</p>
            )}
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={() => props.onHide()}>
          {t("buttons.cancel")}
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
            {t("buttons.delete")}
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
            {t("buttons.restore")}
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
          message: t("page_admin_users.toast_restore_fail"),
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: t("page_admin_users.toast_restore_success"),
        };
        // close the modal
        setUserModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: t("page_admin_users.toast_restore_progress"),
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleDelete = (id: string, reason: string) => {
    const promise = mutationBanUser
      .mutateAsync({ user_id: id, reason: reason })
      .catch((err) => {
        toastAlert.current = {
          message: t("page_admin_users.toast_ban_fail"),
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: t("page_admin_users.toast_ban_success"),
        };
        // close the modal
        setUserModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: t("page_admin_users.toast_ban_progress"),
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
            {t("page_admin_users.title")}
            <p className="lead cat-view-lead">
              {t("page_admin_users.subtitle")}
            </p>
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
                <option value="">{t("fields.select_type")}</option>
                <option>{t("page_admin_users.identified")}</option>
                <option>{t("page_admin_users.validated")}</option>
                <option>{t("page_admin_users.admin")}</option>
              </Form.Select>
            </div>
            <div className="col-md-auto">
              <Form.Select
                onChange={(e) => {
                  setOpts({ ...opts, status: e.target.value });
                }}
                value={opts.status}
              >
                <option value="">{t("fields.select_status")}</option>
                <option value="active">{t("page_admin_users.active")}</option>
                <option value="deleted">{t("page_admin_users.deleted")}</option>
              </Form.Select>
            </div>
            <div className="col col-lg-6">
              <div className="d-flex justify-content-center">
                <Form.Control
                  placeholder={t("fields.search")}
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
                  {t("buttons.clear")}
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
                  {t("fields.name")}{" "}
                  {SortMarker("name", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("email")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.email")}{" "}
                  {SortMarker("email", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span>{t("fields.registered")}</span>
              </th>
              <th>
                <span>{t("fields.user_type")}</span>
              </th>
              <th>
                <span>{t("fields.status")}</span>
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
                              {t("fields.id")}: {trimField(item.id, 20)}
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
                      <BadgeUserType userType={item.user_type} />
                    </td>
                    <td className="align-middle">
                      <BadgeUserStatus banned={item.banned} />
                    </td>
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="user-tip-view">
                            {t("page_admin_users.details_tip")}
                          </Tooltip>
                        }
                      >
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
                          overlay={
                            <Tooltip id="user-tip-restore">
                              {t("page_admin_users.restore_tip")}
                            </Tooltip>
                          }
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
                        <OverlayTrigger
                          placement="top"
                          overlay={
                            <Tooltip id="user-tip-delete">
                              {t("page_admin_users.delete_tip")}
                            </Tooltip>
                          }
                        >
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
            <h5>{t("no_data")}</h5>
          </Alert>
        )}
        <div className="d-flex justify-content-end">
          <div>
            <span className="mx-1">{t("rows_per_page")} </span>
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
