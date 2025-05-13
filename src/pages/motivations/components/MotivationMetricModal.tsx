import {
  useCreateMotivationMetric,
  useGetMotivationMetricFull,
  useUpdateMotivationMetric,
} from "@/api";
import {
  useGetAllAlgorithms,
  useGetAllBenchmarkTypes,
  useGetAllMetricTypes,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import {
  defaultMotivationMetricAlgorithm,
  defaultMotivationMetricBenchmarkType,
  defaultMotivationMetricType,
} from "@/config";
import { AlertInfo, MetricInput, RegistryResource } from "@/types";
import { useContext, useEffect, useRef, useState } from "react";
import {
  Modal,
  Button,
  Form,
  InputGroup,
  Row,
  Col,
  OverlayTrigger,
  Tooltip,
} from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaEdit, FaFile, FaInfoCircle } from "react-icons/fa";

interface MetricModalProps {
  mtvId: string;
  mtrId: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for creating/editing a metric
 */
export function MotivationMetricModal(props: MetricModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const [algorithms, setAlgorithms] = useState<RegistryResource[]>([]);
  const [benchmarkTypes, setBenchmarkTypes] = useState<RegistryResource[]>([]);
  const [metricTypes, setMetricTypes] = useState<RegistryResource[]>([]);
  const [showErrors, setShowErrors] = useState(false);
  const [bValue, setBvalue] = useState("0");

  const [metricInput, setMetricInput] = useState<MetricInput>({
    mtr: "",
    label: "",
    description: "",
    url: "",
    type_metric_id: "",
    type_algorithm_id: "",
    type_benchmark_id: "",
    value_benchmark: 0,
  });

  const { data: metricData } = useGetMotivationMetricFull({
    mtvId: props.mtvId,
    mtrId: props.mtrId,
    token: keycloak?.token || "",
  });

  const {
    data: algoData,
    fetchNextPage: algoFetchNextPage,
    hasNextPage: algoHasNextPage,
  } = useGetAllAlgorithms({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: mtData,
    fetchNextPage: mtFetchNextPage,
    hasNextPage: mtHasNextPage,
  } = useGetAllMetricTypes({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: btData,
    fetchNextPage: btFetchNextPage,
    hasNextPage: btHasNextPage,
  } = useGetAllBenchmarkTypes({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all metric types
    let tmpMt: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the metric types array
    if (mtData?.pages) {
      mtData.pages.map((page) => {
        tmpMt = [...tmpMt, ...page.content];
      });
      if (mtHasNextPage) {
        mtFetchNextPage();
      }
    }

    setMetricTypes(tmpMt);
  }, [mtData, mtHasNextPage, mtFetchNextPage]);

  useEffect(() => {
    // gather all benchmark types
    let tmpBt: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the benchmark types array
    if (btData?.pages) {
      btData.pages.map((page) => {
        tmpBt = [...tmpBt, ...page.content];
      });
      if (btHasNextPage) {
        btFetchNextPage();
      }
    }

    setBenchmarkTypes(tmpBt);
  }, [btData, btHasNextPage, btFetchNextPage]);

  useEffect(() => {
    // gather all algorithms
    let tmpAlgo: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the algorithms array
    if (algoData?.pages) {
      algoData.pages.map((page) => {
        tmpAlgo = [...tmpAlgo, ...page.content];
      });
      if (algoHasNextPage) {
        algoFetchNextPage();
      }
    }

    setAlgorithms(tmpAlgo);
  }, [algoData, algoHasNextPage, algoFetchNextPage]);

  function handleValidate() {
    setShowErrors(true);
    return (
      metricInput.mtr !== "" &&
      metricInput.label !== "" &&
      metricInput.description !== "" &&
      metricInput.type_algorithm_id !== "" &&
      metricInput.type_benchmark_id !== "" &&
      metricInput.type_metric_id !== "" &&
      bValue !== ""
    );
  }

  const mutateCreate = useCreateMotivationMetric(
    keycloak?.token || "",
    props.mtvId,
    metricInput,
  );

  const mutateUpdate = useUpdateMotivationMetric(
    keycloak?.token || "",
    props.mtvId,
    props.mtrId,
    metricInput,
  );

  useEffect(() => {
    if (metricData) {
      const cleanVal = metricData.value_benchmark.replace(/[^0-9.]/g, "");
      setBvalue(cleanVal);
      setMetricInput({
        mtr: metricData.metric_mtr,
        label: metricData.metric_label,
        description: metricData.metric_description,
        type_algorithm_id: metricData.type_algorithm_id,
        type_benchmark_id: metricData.type_benchmark_id,
        type_metric_id: metricData.type_metric_id,
        value_benchmark: parseFloat(cleanVal),
        url: "",
      });
    }
  }, [metricData]);

  useEffect(() => {
    if (props.show && props.mtrId == "") {
      // get default algorithm
      const algo =
        algorithms.filter(
          (item) => item.label === defaultMotivationMetricAlgorithm,
        )[0]?.id || "";
      // get default metric type
      const mt =
        metricTypes.filter(
          (item) => item.label === defaultMotivationMetricType,
        )[0]?.id || "";
      // get default benchmark type

      const bt =
        benchmarkTypes.filter(
          (item) => item.label === defaultMotivationMetricBenchmarkType,
        )[0]?.id || "";

      setBvalue("0");

      setMetricInput({
        mtr: "",
        label: "",
        description: "",
        type_algorithm_id: algo,
        type_metric_id: mt,
        type_benchmark_id: bt,
        value_benchmark: 0,
        url: "",
      });
    }

    setShowErrors(false);
  }, [props.show, props.mtrId, metricTypes, algorithms, benchmarkTypes]);

  // handle backend call to add a new metric
  function handleCreate() {
    const promise = mutateCreate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_motivations.toast_create_metric_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_create_metric_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handle backend call to edit existing metric
  function handleUpdate() {
    const promise = mutateUpdate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: t("page_motivations.toast_metric_update_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_metric_update_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      show={props.show}
      onHide={props.onHide}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          {props.mtrId ? (
            <>
              <FaEdit className="me-2" /> {t("page_motivations.edit_metric")}:{" "}
              <small className="ms-2 bg-light badge">
                <code>{props.mtrId}</code>
              </small>
            </>
          ) : (
            <>
              <FaFile className="me-2" />{" "}
              {t("page_motivations.create_new_metric")}
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Row>
            <Col xs={3}>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_mtr")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-metric-mtr">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("fields.mtr").toUpperCase()} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-metric-mtr"
                  value={metricInput.mtr}
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      mtr: e.target.value,
                    });
                  }}
                  aria-describedby="label-metric-mtr"
                />
              </InputGroup>
              {showErrors && metricInput.mtr === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_label_metric")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-metric-label">
                    <FaInfoCircle className="me-2" /> {t("fields.label")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-metric-label"
                  aria-describedby="label-metric-label"
                  value={metricInput.label}
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      label: e.target.value,
                    });
                  }}
                />
              </InputGroup>
              {showErrors && metricInput.label === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
          <Row className="mt-2">
            <Col className="mt-1">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_motivations.tip_description_metric")}
                  </Tooltip>
                }
              >
                <span id="label-metric-description">
                  <FaInfoCircle className="ms-1 me-2" />{" "}
                  {t("fields.description")} (*):
                </span>
              </OverlayTrigger>
              <Form.Control
                className="mt-1"
                as="textarea"
                rows={2}
                value={metricInput.description}
                onChange={(e) => {
                  setMetricInput({
                    ...metricInput,
                    description: e.target.value,
                  });
                }}
              />
              {showErrors && metricInput.description === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_select_metric_type")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-metric-type">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_motivations.metric_type")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-metric-type"
                  aria-describedby="label-metric-type"
                  placeholder={t("page_motivations.select_mtv_type")}
                  value={
                    metricInput.type_metric_id ? metricInput.type_metric_id : ""
                  }
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_metric_id: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      {t("fields.select_metric_type")}
                    </option>
                    {metricTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_metric_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_metric_id != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        metricTypes.find(
                          (item) => item.id == metricInput.type_metric_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_select_metric_algo")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-metric-algorithm">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_motivations.metric_algorithm")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-metric-algorithm"
                  aria-describedby="label-metric-algorithm"
                  placeholder={t("page_motivations.select_metric_algo")}
                  value={
                    metricInput.type_algorithm_id
                      ? metricInput.type_algorithm_id
                      : ""
                  }
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_algorithm_id: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      {t("page_motivations.tip_select_metric_algo")}
                    </option>
                    {algorithms.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_algorithm_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_algorithm_id != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        algorithms.find(
                          (item) => item.id == metricInput.type_algorithm_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_select_benchmark_type")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-benchmark-type">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_motivations.benchmark_type")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-benchmark-type"
                  aria-describedby="label-benchmark-type"
                  placeholder={t("page_motivations.select_benchmark_type")}
                  value={
                    metricInput.type_benchmark_id
                      ? metricInput.type_benchmark_id
                      : ""
                  }
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_benchmark_id: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      {t("page_motivations.tip_select_benchmark_type")}
                    </option>
                    {benchmarkTypes.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_benchmark_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_benchmark_id != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        benchmarkTypes.find(
                          (item) => item.id == metricInput.type_benchmark_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
          <Row>
            <Col>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_motivations.tip_benchmark_value")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-benchmark-value">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("page_motivations.benchmark_value")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-benchmark-value"
                  aria-describedby="label-benchmark-value"
                  value={bValue}
                  onChange={(e) => {
                    const cleanVal = e.target.value.replace(/[^0-9.]/g, "");
                    setBvalue(cleanVal);
                    setMetricInput({
                      ...metricInput,
                      value_benchmark: parseFloat(cleanVal),
                    });
                  }}
                />
              </InputGroup>
              {showErrors && bValue === "" && (
                <span className="text-danger">
                  {t("page_motivations.err_benchmark_vaule")}
                </span>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              props.mtrId ? handleUpdate() : handleCreate();
            }
          }}
        >
          {props.mtrId ? t("buttons.update") : t("buttons.create")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
