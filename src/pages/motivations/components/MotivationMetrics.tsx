import { AuthContext } from "@/auth";
import { AlertInfo, RegistryMetric } from "@/types";
import {
  Fragment,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Button,
  Col,
  ListGroup,
  ListGroupItem,
  OverlayTrigger,
  Row,
  Tooltip,
} from "react-bootstrap";
import notavailImg from "@/assets/thumb_notavail.png";
import {
  FaBars,
  FaCodeBranch,
  FaCog,
  FaEdit,
  FaPlus,
  FaTrash,
  FaChevronDown,
  FaChevronRight,
} from "react-icons/fa";
import { MotivationMetricModal } from "./MotivationMetricModal";
import { useDeleteMotivationMetric, useGetAllMotivationMetrics } from "@/api";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { MotivationMetricDetailsModal } from "./MotivationMetricDetailsModal";
import toast from "react-hot-toast";
import { DeleteModal } from "@/components/DeleteModal";
import { SearchBox } from "@/components/SearchBox";

interface MetricModalConfig {
  show: boolean;
  itemId: string;
  isVersioning?: boolean;
}

interface DeleteMetricModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

export const MotivationMetrics = ({
  mtvId,
  published,
}: {
  mtvId: string;
  published: boolean;
}) => {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvMetrics, setMtvMetrics] = useState<RegistryMetric[]>([]);
  const [expandedMetrics, setExpandedMetrics] = useState<{
    [key: string]: boolean;
  }>({});
  const [metricModal, setMetricModal] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
  });
  const [modalCreateEdit, setModalCreateEdit] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
    isVersioning: false,
  });

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const {
    data: mtrData,
    fetchNextPage: mtrFetchNextPage,
    hasNextPage: mtrHasNextPage,
  } = useGetAllMotivationMetrics(mtvId, {
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const mutationDelete = useDeleteMotivationMetric(keycloak?.token || "");

  const [deleteMetricModalConfig, setDeleteMetricModalConfig] =
    useState<DeleteMetricModalConfig>({
      show: false,
      title: t("page_motivations.modal_metric_delete_title"),
      message: t("page_motivations.modal_metric_delete_message"),
      itemId: "",
      itemName: "",
    });

  const handleDelete = () => {
    if (deleteMetricModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync({
          mtrId: deleteMetricModalConfig.itemId,
        })
        .catch((err) => {
          alert.current = {
            message: `${t("error")}: ` + err.response.data.message,
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_metric_delete_success"),
          };
          setDeleteMetricModalConfig({
            ...deleteMetricModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
        });
      toast.promise(promise, {
        loading: t("page_motivations.toast_metric_delete_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  useEffect(() => {
    let result: RegistryMetric[] = [];

    // iterate over backend pages and gather all items in the motivation metrics array
    if (mtrData?.pages) {
      mtrData.pages.forEach((page) => {
        const contentDetails = page.content as RegistryMetric[];
        result = [...result, ...contentDetails];
      });

      if (mtrHasNextPage) {
        mtrFetchNextPage();
      }
    }

    setMtvMetrics(result);
  }, [mtrData, mtrHasNextPage, mtrFetchNextPage]);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const filteredMetrics = useMemo(
    () =>
      mtvMetrics?.filter((item) => {
        const query = searchInput.toLowerCase();

        const result =
          item.metric_id.toLowerCase().includes(query) ||
          item.metric_label.toLowerCase().includes(query) ||
          item.metric_description.toLowerCase().includes(query);

        if (result) return true;

        // Also check for sub-versions if any exist
        if (item.metric_versions && item.metric_versions?.length > 0) {
          return item.metric_versions.some(
            (version) =>
              version.metric_id.toLowerCase().includes(query) ||
              version.metric_label.toLowerCase().includes(query) ||
              version.metric_description.toLowerCase().includes(query),
          );
        }

        return false;
      }),
    [searchInput, mtvMetrics],
  );

  return (
    <div className="px-5 mt-4">
      <DeleteModal
        show={deleteMetricModalConfig.show}
        title={deleteMetricModalConfig.title}
        message={deleteMetricModalConfig.message}
        itemId={deleteMetricModalConfig.itemId}
        itemName={deleteMetricModalConfig.itemName}
        onHide={() => {
          setDeleteMetricModalConfig({
            ...deleteMetricModalConfig,
            show: false,
          });
        }}
        handleDelete={handleDelete}
      />
      <MotivationMetricDetailsModal
        show={metricModal.show}
        onHide={() => {
          setMetricModal({ itemId: "", show: false });
        }}
        mtvId={mtvId}
        itemId={metricModal.itemId}
        getByCriterion={false}
      />
      <MotivationMetricModal
        show={modalCreateEdit.show}
        mtvId={mtvId}
        mtrId={modalCreateEdit.itemId}
        onHide={() => {
          setModalCreateEdit({ itemId: "", show: false, isVersioning: false });
        }}
        isVersioning={modalCreateEdit.isVersioning}
      />
      <div className="d-flex justify-content-between mb-2">
        <h5 className="text-muted cat-view-heading ">
          {t("page_motivations.list_of_metrics")}
          <p className="lead cat-view-lead">
            <span className="text-sm">
              {t("page_motivations.list_of_metrics_subtitle")}
            </span>
          </p>
        </h5>
        <div>
          {published ? (
            <span className="btn btn-warning disabled">
              <FaPlus className="me-2" />
              {t("page_motivations.create_metric")}
            </span>
          ) : (
            <Button
              variant="warning"
              onClick={() => {
                setModalCreateEdit({
                  itemId: "",
                  show: true,
                  isVersioning: false,
                });
              }}
              disabled={published}
            >
              <FaPlus className="me-2" />
              {t("page_motivations.create_metric")}
            </Button>
          )}
        </div>
      </div>
      <div>
        <SearchBox
          searchInput={searchInput}
          handleChange={handleSearchChange}
          handleClear={handleSearchClear}
        />
      </div>
      <div>
        <ListGroup>
          {filteredMetrics.map((item) => {
            const isExpanded = expandedMetrics[item.metric_id] || false;
            const hasVersions =
              item?.metric_versions && item.metric_versions?.length > 0;

            return (
              <Fragment key={item.metric_id}>
                <ListGroupItem>
                  <Row>
                    <Col>
                      <div className="flex items-center ng-star-inserted">
                        <div className="d-flex align-items-center">
                          {hasVersions && (
                            <div
                              className="me-2"
                              style={{ cursor: "pointer", width: "1rem" }}
                              onClick={() => {
                                setExpandedMetrics((prev) => ({
                                  ...prev,
                                  [item.metric_id]: !prev[item.metric_id],
                                }));
                              }}
                            >
                              {isExpanded ? (
                                <FaChevronDown />
                              ) : (
                                <FaChevronRight />
                              )}
                            </div>
                          )}
                          <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                            <img
                              src={notavailImg}
                              className="text-center m-1 rounded-full"
                              width="60%"
                            />
                          </div>
                        </div>
                        <div>
                          <div className="d-flex gap-2 text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                            {item.metric_label}
                            {hasVersions && (
                              <span
                                className="badge bg-success"
                                style={{
                                  width: "fit-content",
                                  fontSize: "0.7rem",
                                }}
                              >
                                latest
                                {item.metric_version
                                  ? ` v${item.metric_version}`
                                  : ""}
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 ng-star-inserted">
                            {item.metric_description}
                          </div>
                          <div>
                            <span
                              style={{ fontSize: "0.64rem" }}
                              className="text-muted"
                            >
                              {item.metric_id}
                            </span>
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs="auto">
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {t("page_motivations.tip_edit_metric")}
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          onClick={() => {
                            setModalCreateEdit({
                              itemId: item.metric_id,
                              show: true,
                              isVersioning: false,
                            });
                          }}
                        >
                          <FaEdit />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {t("page_motivations.tip_view_metric_tests")}
                          </Tooltip>
                        }
                      >
                        <Button
                          variant="light"
                          onClick={() => {
                            setMetricModal({
                              itemId: item.metric_id,
                              show: true,
                            });
                          }}
                        >
                          <FaBars />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {t("page_motivations.assign_tests")}
                          </Tooltip>
                        }
                      >
                        <Link
                          className="btn btn-light"
                          to={`/admin/motivations/${mtvId}/metrics-tests/${item.metric_id}`}
                        >
                          <FaCog />
                        </Link>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>Create New Version</Tooltip>}
                      >
                        <Button
                          className="btn btn-light"
                          onClick={() => {
                            setModalCreateEdit({
                              itemId: item.metric_id,
                              show: true,
                              isVersioning: true,
                            });
                          }}
                        >
                          <FaCodeBranch />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id="tip-delete">
                            {t("page_motivations.tip_delete_metric")}
                          </Tooltip>
                        }
                      >
                        <Button
                          className="btn btn-light btn-sm m-1"
                          onClick={() => {
                            setDeleteMetricModalConfig({
                              ...deleteMetricModalConfig,
                              show: true,
                              itemId: item.metric_id,
                              itemName: item.metric_label,
                            });
                          }}
                        >
                          <FaTrash />
                        </Button>
                      </OverlayTrigger>
                    </Col>
                  </Row>
                </ListGroupItem>
                {isExpanded &&
                  hasVersions &&
                  item.metric_versions?.map((version) => (
                    <ListGroupItem key={`version-${version.metric_id}`}>
                      <Row>
                        <Col>
                          <div
                            className="d-flex flex-column"
                            style={{ paddingLeft: "4.3rem" }}
                          >
                            <div className="d-flex gap-2 text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                              <div className="flex text-sm text-gray-900 font-weight-500 items-center">
                                {version.metric_label}
                              </div>
                              <span
                                className="badge bg-secondary"
                                style={{ width: "fit-content" }}
                              >
                                {version.metric_version
                                  ? `v${version.metric_version}`
                                  : "old version"}
                              </span>
                            </div>
                            <div className="text-xs text-gray-600">
                              {version.metric_description}
                            </div>
                            <div>
                              <span
                                className="text-muted"
                                style={{
                                  fontSize: "0.64rem",
                                }}
                              >
                                {version.metric_id}
                              </span>
                            </div>
                          </div>
                        </Col>
                        <Col xs="auto" style={{ marginRight: "5.3rem" }}>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {t("page_motivations.tip_edit_metric")}
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="light"
                              onClick={() => {
                                setModalCreateEdit({
                                  itemId: version.metric_id,
                                  show: true,
                                  isVersioning: false,
                                });
                              }}
                            >
                              <FaEdit />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {t("page_motivations.tip_view_metric_tests")}
                              </Tooltip>
                            }
                          >
                            <Button
                              variant="light"
                              onClick={() => {
                                setMetricModal({
                                  itemId: version.metric_id,
                                  show: true,
                                });
                              }}
                            >
                              <FaBars />
                            </Button>
                          </OverlayTrigger>
                          <OverlayTrigger
                            placement="top"
                            overlay={
                              <Tooltip>
                                {t("page_motivations.assign_tests")}
                              </Tooltip>
                            }
                          >
                            <Link
                              className="btn btn-light"
                              to={`/admin/motivations/${mtvId}/metrics-tests/${version.metric_id}`}
                            >
                              <FaCog />
                            </Link>
                          </OverlayTrigger>
                        </Col>
                      </Row>
                    </ListGroupItem>
                  ))}
              </Fragment>
            );
          })}
        </ListGroup>
      </div>
    </div>
  );
};
