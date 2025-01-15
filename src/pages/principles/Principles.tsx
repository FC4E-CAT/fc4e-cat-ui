import { AuthContext } from "@/auth";
import { useContext, useEffect, useRef, useState } from "react";
import { Alert, Button, OverlayTrigger, Table, Tooltip } from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaBars,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaTags,
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltV,
} from "react-icons/fa";
import { idToColor } from "@/utils/admin";

import {
  useDeletePrinciple,
  useGetPrinciples,
} from "@/api/services/principles";
import { AlertInfo, Principle } from "@/types";
import { Link } from "react-router-dom";
import { PrincipleModal } from "./components/PrincipleModal";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";
import { MotivationRefList } from "@/components/MotivationRefList";
import { useTranslation } from "react-i18next";

type PrincipleState = {
  sortOrder: string;
  sortBy: string;
  page: number;
  size: number;
  search: string;
};

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

const tooltipView = <Tooltip id="tip-restore">View Principle Details</Tooltip>;
const tooltipDelete = <Tooltip id="tip-restore">Delete Principle</Tooltip>;

// the main component that lists the motivations in a table
export default function Principles() {
  const { keycloak, registered } = useContext(AuthContext)!;
  const { t } = useTranslation();
  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: t("page_principles.modal_delete_title"),
      message: t("page_principles.modal_delete_message"),
      itemId: "",
      itemName: "",
    },
  );

  const mutationDelete = useDeletePrinciple(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: t("page_principles.toast_delete_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_principles.toast_delete_success"),
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_principles.toast_delete_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const [opts, setOpts] = useState<PrincipleState>({
    sortBy: "pri",
    sortOrder: "ASC",
    page: 1,
    size: 10,
    search: "",
  });

  const [showCreate, setShowCreate] = useState(false);

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

  // data get list of motivations
  const { isLoading, data, refetch } = useGetPrinciples({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the principle data to create the table
  const principles: Principle[] = data ? data?.content : [];

  // create an up/down arrow to designate sorting in a column
  const SortMarker = (field: string, sortField: string, sortOrder: string) => {
    if (field === sortField) {
      if (sortOrder === "DESC") return <FaArrowUp />;
      else if (sortOrder === "ASC") return <FaArrowDown />;
    }
    return <FaArrowsAltV className="text-secondary opacity-50" />;
  };
  return (
    <div>
      <DeleteModal
        show={deleteModalConfig.show}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemId={deleteModalConfig.itemId}
        itemName={deleteModalConfig.itemName}
        onHide={() => {
          setDeleteModalConfig({ ...deleteModalConfig, show: false });
        }}
        handleDelete={handleDeleteConfirmed}
      />
      <PrincipleModal
        principle={null}
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            {t("page_principles.title")}
            <p className="lead cat-view-lead">
              {t("page_principles.subtitle")}
            </p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Button
            variant="warning"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <FaPlus /> {t("buttons.create_new")}
          </Button>
        </div>
      </div>
      <div>
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span
                  onClick={() => handleSortClick("pri")}
                  className="cat-cursor-pointer"
                >
                  {t("pri").toUpperCase()}{" "}
                  {SortMarker("pri", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("label")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.label").toUpperCase()}{" "}
                  {SortMarker("label", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th className="w-50 p-3">
                <span>{t("fields.description")}</span>
              </th>
              <th>
                <span>{t("fields.modified")}</span>
              </th>
              <th>
                <span>{t("motivations")}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          {principles.length > 0 ? (
            <tbody>
              {principles.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">
                      <div className="d-flex  justify-content-start">
                        <div>
                          <FaTags
                            size={"2.5rem"}
                            style={{ color: idToColor(item.id) }}
                          />
                        </div>
                        <div className="ms-2 d-flex flex-column justify-content-between">
                          <div>{item.pri}</div>
                          <div>
                            <span
                              style={{ fontSize: "0.64rem" }}
                              className="text-muted"
                            >
                              {item.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{item.label}</td>

                    <td className="align-middle">{item.description}</td>
                    <td className="align-middle">
                      <small>{item.last_touch.split("T")[0]}</small>
                    </td>
                    <td>
                      <MotivationRefList
                        motivations={item.used_by_motivations || []}
                      />
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger placement="top" overlay={tooltipView}>
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/admin/principles/${item.id}`}
                          >
                            <FaBars />
                          </Link>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={tooltipDelete}>
                          <Button
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              setDeleteModalConfig({
                                ...deleteModalConfig,
                                show: true,
                                itemId: item.id,
                                itemName: `${item.label} - ${item.pri}`,
                              });
                            }}
                          >
                            <FaTrash />
                          </Button>
                        </OverlayTrigger>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          ) : null}
        </Table>
        {!isLoading && principles.length === 0 && (
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
