import { AuthContext } from "@/auth";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Alert,
  Button,
  OverlayTrigger,
  Table,
  Tooltip,
  Form,
} from "react-bootstrap";
import {
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaPlus,
  FaTrash,
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltV,
  FaEdit,
  FaBars,
} from "react-icons/fa";

import { AlertInfo } from "@/types";
import { TestModal } from "@/pages/tests/components/TestModal";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";
import { useTranslation } from "react-i18next";
import { idToColor } from "@/utils/admin";
import { useDeleteTest, useGetTests } from "@/api/services/registry";
import { MotivationRefList } from "@/components/MotivationRefList";
import { RegistryTest } from "@/types/tests";
import { FaClipboardQuestion } from "react-icons/fa6";
import { TestDetailsModal } from "./components/TestDetailsModal";

type TestsState = {
  sortOrder: string;
  sortBy: string;
  page: number;
  size: number;
  search: string;
};

type TestModalConfig = {
  id: string;
  show: boolean;
};

type TestModalDetailsConfig = {
  id: string;
  show: boolean;
};

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

// the main component that lists the tests in a table
export default function Tests() {
  const { t } = useTranslation();
  const tooltipView = (
    <Tooltip id="tip-view">{t("page_tests.tip_view")}</Tooltip>
  );
  const tooltipEdit = (
    <Tooltip id="tip-edit">{t("page_tests.tip_edit")}</Tooltip>
  );
  const tooltipDelete = (
    <Tooltip id="tip-delete">{t("page_tests.tip_delete")}</Tooltip>
  );
  const { keycloak, registered } = useContext(AuthContext)!;

  const alert = useRef<AlertInfo>({
    message: "",
  });

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: t("page_tests.modal_delete_title"),
      message: t("page_tests.modal_delete_message"),
      itemId: "",
      itemName: "",
    },
  );

  const mutationDelete = useDeleteTest(keycloak?.token || "");

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: `${t("error")}: ` + err.response.data.message,
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_tests.toast_delete_success"),
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_tests.toast_delete_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const [opts, setOpts] = useState<TestsState>({
    sortBy: "lastTouch",
    sortOrder: "DESC",
    page: 1,
    size: 10,
    search: "",
  });

  const [testModalCfg, setTestModalCfg] = useState<TestModalConfig>({
    id: "",
    show: false,
  });

  const [testDetailsModalCfg, setTestDetailsModalCfg] =
    useState<TestModalDetailsConfig>({
      id: "",
      show: false,
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

  // data get list of tests
  const { isLoading, data, refetch } = useGetTests({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
    search: opts.search,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  // get the test data to create the table
  const tests: RegistryTest[] = data ? data?.content : [];
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
      <TestModal
        id={testModalCfg.id}
        show={testModalCfg.show}
        onHide={() => {
          setTestModalCfg({ id: "", show: false });
        }}
      />
      <TestDetailsModal
        id={testDetailsModalCfg.id}
        show={testDetailsModalCfg.show}
        onHide={() => {
          setTestDetailsModalCfg({ id: "", show: false });
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            {t("page_tests.title")}
            <p className="lead cat-view-lead">{t("page_tests.subtitle")}</p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Button
            variant="warning"
            onClick={() => {
              setTestModalCfg({ id: "", show: true });
            }}
          >
            <FaPlus /> {t("buttons.create_new")}
          </Button>
        </div>
      </div>
      <div>
        <Form className="mb-3">
          <div className="row cat-view-search-block border-bottom">
            <div className="col col-lg-3"></div>
            <div className="col md-auto col-lg-9">
              <div className="d-flex justify-content-center">
                <Form.Control
                  placeholder={t("fields.search")}
                  onChange={(e) => {
                    setOpts({ ...opts, search: e.target.value, page: 1 });
                  }}
                  value={opts.search}
                />
                <Button
                  onClick={() => {
                    setOpts({ ...opts, search: "", page: 1 });
                  }}
                  className="ms-4"
                >
                  {t("buttons.clear")}
                </Button>
              </div>
            </div>
          </div>
        </Form>
      </div>
      <div>
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span
                  onClick={() => handleSortClick("TES")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.tes").toUpperCase()}{" "}
                  {SortMarker("TES", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("labelTest")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.label")}{" "}
                  {SortMarker("labelTest", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th className="w-50">
                <span>{t("fields.description")}</span>
              </th>
              <th>
                <span
                  onClick={() => handleSortClick("lastTouch")}
                  className="cat-cursor-pointer text-nowrap"
                >
                  {t("fields.modified")}{" "}
                  {SortMarker("lastTouch", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
              <th>
                <span>{t("motivations")}</span>
              </th>
              <th></th>
            </tr>
          </thead>
          {tests.length > 0 ? (
            <tbody>
              {tests.map((item) => {
                return (
                  <tr key={item.test.id}>
                    <td className="align-middle">
                      <div className="d-flex  justify-content-start">
                        <div>
                          <FaClipboardQuestion
                            size={"2.5rem"}
                            style={{ color: idToColor(item.test.id) }}
                          />
                        </div>
                        <div className="ms-2 d-flex flex-column justify-content-between">
                          <div>{item.test.tes}</div>
                          <div>
                            <span
                              style={{ fontSize: "0.64rem" }}
                              className="text-muted"
                            >
                              {item.test.id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{item.test.label}</td>

                    <td className="align-middle">{item.test.description}</td>
                    <td className="align-middle">
                      <small>{item.test.last_touch?.split("T")[0]}</small>
                    </td>
                    <td>
                      <MotivationRefList
                        motivations={item.used_by_motivations || []}
                      />
                    </td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger placement="top" overlay={tooltipView}>
                          <Button
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              setTestDetailsModalCfg({
                                id: item.test.id,
                                show: true,
                              });
                            }}
                          >
                            <FaBars />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={tooltipEdit}>
                          <Button
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              setTestModalCfg({
                                id: item.test.id,
                                show: true,
                              });
                            }}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={tooltipDelete}>
                          <Button
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              setDeleteModalConfig({
                                ...deleteModalConfig,
                                show: true,
                                itemId: item.test.id,
                                itemName: `${item.test.label} - ${item.test.tes}`,
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
        {!isLoading && tests.length === 0 && (
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
