import { AuthContext } from "@/auth";
import { useContext, useEffect, useState } from "react";
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
  FaBars,
  FaExclamationTriangle,
  FaArrowUp,
  FaArrowDown,
  FaArrowsAltV,
  FaBorderNone,
} from "react-icons/fa";

import { RegistryMetric } from "@/types";
import { useTranslation } from "react-i18next";
import { idToColor } from "@/utils/admin";
import { useGetRegistryMetrics } from "@/api/services/registry";
import { MetricModal } from "./components/MetricModal";
import { MotivationRefList } from "@/components/MotivationRefList";


type MetricState = {
  sortOrder: string;
  sortBy: string;
  page: number;
  size: number;
  search: string;
};

type MetricModalConfig = {
  metric: RegistryMetric | null;
  show: boolean;
};

// the main component that lists the metrics in a table
export default function Metrics() {
  const { t } = useTranslation();
  const tooltipView = (
    <Tooltip id="tip-view">{t("page_metrics.tip_view")}</Tooltip>
  );

  const { keycloak, registered } = useContext(AuthContext)!;

  const [modalConfig, setModalConfig] = useState<MetricModalConfig>({
    metric: null,
    show: false,
  });
  const [opts, setOpts] = useState<MetricState>({
    sortBy: "metric",
    sortOrder: "ASC",
    page: 1,
    size: 10,
    search: "",
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

  // data get list of metrics
  const { isLoading, data, refetch } = useGetRegistryMetrics({
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

  // get the metric data to create the table
  const metrics: RegistryMetric[] = data ? data?.content : [];
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
      <MetricModal
        metric={modalConfig.metric}
        show={modalConfig.show}
        onHide={() => {
          setModalConfig({
            metric: null,
            show: false,
          });
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="text-muted cat-view-heading ">
            {t("page_metrics.title")}
            <p className="lead cat-view-lead">{t("page_metrics.subtitle")}</p>
          </h2>
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
                  onClick={() => handleSortClick("mtr")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.mtr").toUpperCase()}{" "}
                  {SortMarker("mtr", opts.sortBy, opts.sortOrder)}
                </span>
              </th>

              <th>
                <span
                  onClick={() => handleSortClick("label")}
                  className="cat-cursor-pointer"
                >
                  {t("fields.label")}{" "}
                  {SortMarker("label", opts.sortBy, opts.sortOrder)}
                </span>
              </th>
             
              <th className="w-50 p-3">
                <span>{t("fields.description")}</span>
              </th>
              <th className="w-25">
                <span>{t("fields.algorithm")}</span>
              </th>
              <th>
                <span>{t("motivations")}</span>
              </th>
              <th>
              <span>{t("fields.actions")}</span>
              </th>
            </tr>
          </thead>
          {metrics.length > 0 ? (
            <tbody>
              {metrics.map((item) => {
                return (
                  <tr key={item.metric_id + item.motivation_id}>
                    <td className="align-middle">
                      <div className="d-flex  justify-content-start">
                        <div>
                          <FaBorderNone
                            size={"2.5rem"}
                            style={{ color: idToColor(item.metric_id) }}
                          />
                        </div>
                        <div className="ms-2 d-flex flex-column justify-content-between">
                          <div>{item.metric_mtr}</div>
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
                    </td>

                    <td className="align-middle">{item.metric_label}</td>
                    <td className="align-middle">{item.metric_description}</td>
                    <td className="align-middle">
                      <span>{item.type_algorithm_label}</span>
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
                              setModalConfig({
                                metric: item,
                                show: true,
                              });
                            }}
                          >
                            <FaBars />
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
        {!isLoading && metrics.length === 0 && (
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
