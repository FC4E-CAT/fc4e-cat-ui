import { AuthContext } from "@/auth";
import { AlertInfo, MotivationMetric } from "@/types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
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
import { FaBars, FaCog, FaEdit, FaPlus, FaTrash } from "react-icons/fa";
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
  const [mtvMetrics, setMtvMetrics] = useState<MotivationMetric[]>([]);
  const [modalCreateEdit, setModalCreateEdit] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
  });

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const [metricModal, setMetricModal] = useState<MetricModalConfig>({
    show: false,
    itemId: "",
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
    // gather all mtv metrics in one array
    let tmpMtr: MotivationMetric[] = [];

    // iterate over backend pages and gather all items in the motivation metrics array
    if (mtrData?.pages) {
      mtrData.pages.map((page) => {
        tmpMtr = [...tmpMtr, ...page.content];
      });
      if (mtrHasNextPage) {
        mtrFetchNextPage();
      }
    }
    setMtvMetrics(tmpMtr);
  }, [mtrData, mtrHasNextPage, mtrFetchNextPage]);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const filteredMetrics = useMemo(() => {
    return mtvMetrics.filter((item) => {
      const query = searchInput.toLowerCase();
      return (
        item.metric_id.toLowerCase().includes(query) ||
        item.metric_label.toLowerCase().includes(query) ||
        item.metric_description.toLowerCase().includes(query)
      );
    });
  }, [searchInput, mtvMetrics]);

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
          setModalCreateEdit({ itemId: "", show: false });
        }}
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
                setModalCreateEdit({ itemId: "", show: true });
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
          {filteredMetrics.map((item) => (
            <ListGroupItem key={item.metric_id}>
              <Row>
                <Col>
                  <div className="flex items-center ng-star-inserted">
                    <div className="margin-right-8 flex justify-center items-center ng-star-inserted radio-card-icon">
                      <img
                        src={notavailImg}
                        className="text-center m-1 rounded-full"
                        width="60%"
                      />
                    </div>
                    <div>
                      <div className="flex text-sm text-gray-900 font-weight-500 items-center cursor-pointer">
                        {item.metric_label}
                      </div>
                      <div className="text-xs text-gray-600 ng-star-inserted">
                        {item.metric_description}
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs="auto">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{t("page_motivations.tip_edit_metric")}</Tooltip>
                    }
                  >
                    <Button
                      variant="light"
                      onClick={() => {
                        setModalCreateEdit({
                          itemId: item.metric_id,
                          show: true,
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
                        setMetricModal({ itemId: item.metric_id, show: true });
                      }}
                    >
                      <FaBars />
                    </Button>
                  </OverlayTrigger>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{t("page_motivations.assign_tests")}</Tooltip>
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
          ))}
        </ListGroup>
      </div>
    </div>
  );
};
