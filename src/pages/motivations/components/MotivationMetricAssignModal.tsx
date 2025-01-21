import { Modal, Button, Alert } from "react-bootstrap";
import { AlertInfo, MotivationMetric } from "@/types";
import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FaBorderNone, FaInfoCircle } from "react-icons/fa";
import {
  useGetAllMotivationMetrics,
  useUpdateMotivationAssignMetric,
} from "@/api";
import { AuthContext } from "@/auth";
import { relMtvPrincpleCriterion } from "@/config";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { SearchBox } from "@/components/SearchBox";

interface MotivationMetricAssignProps {
  mtvId: string;
  criId: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for displaying criterion metric
 */
export function MotivationMetricAssignModal(
  props: MotivationMetricAssignProps,
) {
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [mtvMetrics, setMtvMetrics] = useState<MotivationMetric[]>([]);
  const [selMetricId, setSelMetricId] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const mutationUpdate = useUpdateMotivationAssignMetric(
    keycloak?.token || "",
    props.mtvId || "",
    props.criId || "",
  );

  const handleAssign = () => {
    if (selMetricId) {
      const metricAssignment = {
        metric_id: selMetricId,
        relation: relMtvPrincpleCriterion,
      };
      const promise = mutationUpdate
        .mutateAsync(metricAssignment)
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_cri_mtr_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_cri_mtr_success"),
          };
          props.onHide();
        });
      toast.promise(promise, {
        loading: t("page_motivations.toast_cri_mtr_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  const {
    data: mtrData,
    fetchNextPage: mtrFetchNextPage,
    hasNextPage: mtrHasNextPage,
  } = useGetAllMotivationMetrics(props.mtvId, {
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

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

  useEffect(() => {
    setSelMetricId("");
  }, [props.show]);

  const filteredMetrics = useMemo(() => {
    return mtvMetrics.filter((item) => {
      const query = searchInput.toLowerCase();
      return (
        item.metric_label.toLowerCase().includes(query) ||
        item.metric_description.toLowerCase().includes(query)
      );
    });
  }, [searchInput, mtvMetrics]);

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {t("page_motivations.assign_metric")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <strong className="p-1">
            {t("page_motivations.available_metrics")}
          </strong>
          <span className="ms-1 badge bg-primary rounded-pill fs-6">
            {mtvMetrics.length}
          </span>
        </div>

        <div className="alert alert-primary p-2 mt-1">
          <small>
            <FaInfoCircle className="me-2" />{" "}
            {t("page_motivations.info_assign_to_criterion")}
          </small>
        </div>
        <div>
          <SearchBox
            searchInput={searchInput}
            handleChange={handleSearchChange}
            handleClear={handleSearchClear}
          />
        </div>
        <div className="cat-vh-40 overflow-auto">
          {filteredMetrics?.map((item) => (
            <div
              key={item.metric_id}
              className={`mb-4 p-2 cat-select-item ${item.metric_id == selMetricId ? "border border-success" : ""}`}
              onClick={() => {
                setSelMetricId(item.metric_id);
              }}
            >
              <div className="d-inline-flex align-items-center">
                <FaBorderNone className="me-2" />
                <strong>{item.metric_label}</strong>
              </div>
              <small className="ms-2 text-muted">({item.metric_id})</small>
              <div className="text-muted text-sm">
                {item.metric_description}
              </div>
            </div>
          ))}
        </div>
        <Alert variant={`${selMetricId !== "" ? "success" : "secondary"}`}>
          {t("fields.selected")}:{" "}
          {selMetricId !== "" ? (
            <div>
              <FaBorderNone className="me-2" />
              <strong>
                {
                  mtvMetrics.filter((item) => item.metric_id === selMetricId)[0]
                    .metric_label
                }
              </strong>
              <small className="ms-2 text-muted">{selMetricId}</small>
            </div>
          ) : (
            <div>
              <strong>{t("none")}</strong>
            </div>
          )}
        </Alert>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-success" onClick={handleAssign}>
          {t("buttons.assign")}
        </Button>
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
