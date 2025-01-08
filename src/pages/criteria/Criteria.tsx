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

import { AlertInfo, Criterion } from "@/types";
import { Link } from "react-router-dom";
import { CriterionModal } from "./components/CriterionModal";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";
import { useDeleteCriterion, useGetCriteria } from "@/api/services/criteria";
import { MotivationRefList } from "@/components/MotivationRefList";
import { useTranslation } from "react-i18next";

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

// the main component that lists the criteria in a table
export default function Criteria() {
  const { t } = useTranslation();
  const tooltipView = (
    <Tooltip id="tip-restore">{t("page_criteria.tip_view")}</Tooltip>
  );
  const tooltipDelete = (
    <Tooltip id="tip-restore">{t("page_criteria.tip_delete")}</Tooltip>
  );
  const { keycloak, registered } = useContext(AuthContext)!;

  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: t("page_criteria.modal_delete_title"),
      message: t("page_criteria.modal_delete_message"),
      itemId: "",
      itemName: "",
    },
  );

  const mutationDelete = useDeleteCriterion(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: t("page_criteria.toast_delete_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_criteria.toast_delete_success"),
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_criteria.toast_delete_progress"),
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

  // data get list of criteria
  const { isLoading, data, refetch } = useGetCriteria({
    size: opts.size,
    page: opts.page,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the criteria data to create the table
  const criteria: Criterion[] = data ? data?.content : [];

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
      <CriterionModal
        criterion={null}
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            {t("page_criteria.title")}
            <p className="lead cat-view-lead">{t("page_criteria.subtitle")}</p>
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
                <span>{t("fields.cri").toUpperCase()}</span>
              </th>
              <th>
                <span>{t("fields.label")}</span>
              </th>
              <th>
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
          {criteria.length > 0 ? (
            <tbody>
              {criteria.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">{item.cri}</td>
                    <td className="align-middle">{item.label}</td>

                    <td className="align-middle">{item.description}</td>
                    <td className="align-middle">
                      <small>{item.last_touch.split(".")[0]}</small>
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
                            to={`/admin/criteria/${item.id}`}
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
                                itemName: `${item.label} - ${item.cri}`,
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
        {!isLoading && criteria.length === 0 && (
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
