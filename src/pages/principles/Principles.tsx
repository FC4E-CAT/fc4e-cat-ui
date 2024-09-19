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
} from "react-icons/fa";

import {
  useDeletePrinciple,
  useGetPrinciples,
} from "@/api/services/principles";
import { AlertInfo, Principle } from "@/types";
import { Link } from "react-router-dom";
import { PrincipleModal } from "./components/PrincipleModal";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";

type Pagination = {
  page: number;
  size: number;
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

  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: "Delete Principle",
      message: "Are you sure you want to delete the following principle?",
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
            message: "Error during principle deletion!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Principle succesfully deleted.",
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: "Deleting...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const [opts, setOpts] = useState<Pagination>({
    page: 1,
    size: 10,
  });

  const [showCreate, setShowCreate] = useState(false);

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // data get list of motivations
  const { isLoading, data, refetch } = useGetPrinciples({
    size: opts.size,
    page: opts.page,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the principle data to create the table
  const principles: Principle[] = data ? data?.content : [];

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
        onDelete={handleDeleteConfirmed}
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
            Principles
            <p className="lead cat-view-lead">Manage principles.</p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Button
            variant="warning"
            onClick={() => {
              setShowCreate(true);
            }}
          >
            <FaPlus /> Create New
          </Button>
        </div>
      </div>
      <div>
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span>MTV</span>
              </th>
              <th>
                <span>Label</span>
              </th>
              <th>
                <span>Description</span>
              </th>
              <th>
                <span>Modified</span>
              </th>
              <th></th>
            </tr>
          </thead>
          {principles.length > 0 ? (
            <tbody>
              {principles.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">{item.pri}</td>
                    <td className="align-middle">{item.label}</td>

                    <td className="align-middle">{item.description}</td>
                    <td className="align-middle">
                      <small>{item.last_touch.split(".")[0]}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger placement="top" overlay={tooltipView}>
                          <Link
                            className="btn btn-light btn-sm m-1"
                            to={`/principles/${item.id}`}
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
