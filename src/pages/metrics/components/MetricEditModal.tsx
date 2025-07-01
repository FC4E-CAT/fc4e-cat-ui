import {
  useUpdateMetric,
  useCreateMetric,
  useCreateMetricVersion,
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
import {
  AlertInfo,
  MetricInput,
  RegistryResource,
  RegistryMetric,
} from "@/types";
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
import { FaCodeBranch, FaEdit, FaInfoCircle } from "react-icons/fa";

interface MetricEditModalProps {
  metric: RegistryMetric | null;
  show: boolean;
  onHide: () => void;
  isVersioning?: boolean;
  isEditing?: boolean;
}

export function MetricEditModal(props: MetricEditModalProps) {
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

  const {
    data: algoData,
    fetchNextPage: algoFetchNextPage,
    hasNextPage: algoHasNextPage,
  } = useGetAllAlgorithms({
    size: 50,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: mtData,
    fetchNextPage: mtFetchNextPage,
    hasNextPage: mtHasNextPage,
  } = useGetAllMetricTypes({
    size: 50,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: btData,
    fetchNextPage: btFetchNextPage,
    hasNextPage: btHasNextPage,
  } = useGetAllBenchmarkTypes({
    size: 50,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    if (mtData?.pages) {
      let tmpMt: RegistryResource[] = [];
      mtData.pages.forEach((page) => {
        tmpMt = [...tmpMt, ...page.content];
      });
      setMetricTypes(tmpMt);
      if (mtHasNextPage) {
        mtFetchNextPage();
      }
    }
  }, [mtData, mtHasNextPage, mtFetchNextPage]);

  useEffect(() => {
    if (btData?.pages) {
      let tmpBt: RegistryResource[] = [];
      btData.pages.forEach((page) => {
        tmpBt = [...tmpBt, ...page.content];
      });
      setBenchmarkTypes(tmpBt);
      if (btHasNextPage) {
        btFetchNextPage();
      }
    }
  }, [btData, btHasNextPage, btFetchNextPage]);

  useEffect(() => {
    if (algoData?.pages) {
      let tmpAlgo: RegistryResource[] = [];
      algoData.pages.forEach((page) => {
        tmpAlgo = [...tmpAlgo, ...page.content];
      });
      setAlgorithms(tmpAlgo);
      if (algoHasNextPage) {
        algoFetchNextPage();
      }
    }
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

  const mutateCreate = useCreateMetric(keycloak?.token || "", metricInput);

  const mutateUpdate = useUpdateMetric(
    keycloak?.token || "",
    props.metric?.metric_id || "",
    metricInput,
  );

  const mutateCreateVersion = useCreateMetricVersion({
    token: keycloak?.token || "",
    id: props.metric?.metric_id || "",
    metric: metricInput,
  });

  useEffect(() => {
    if (props.metric && props.show && (props.isEditing || props.isVersioning)) {
      const cleanVal =
        props.metric.value_benchmark?.toString().replace(/[^0-9.]/g, "") || "0";
      setBvalue(cleanVal);
      setMetricInput({
        mtr: props.metric.metric_mtr,
        label: props.metric.metric_label,
        description: props.metric.metric_description,
        type_algorithm_id: props.metric.type_algorithm_id || "",
        type_benchmark_id: props.metric.type_benchmark_id || "",
        type_metric_id: props.metric.type_metric_id || "",
        value_benchmark: parseFloat(cleanVal),
        url: "",
      });
    }
  }, [props.metric, props.show, props.isEditing, props.isVersioning]);

  useEffect(() => {
    if (props.show && !props.isEditing && !props.isVersioning) {
      const algo =
        algorithms.find(
          (item) => item.label === defaultMotivationMetricAlgorithm,
        )?.id || "";
      const mt =
        metricTypes.find((item) => item.label === defaultMotivationMetricType)
          ?.id || "";
      const bt =
        benchmarkTypes.find(
          (item) => item.label === defaultMotivationMetricBenchmarkType,
        )?.id || "";

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
  }, [
    props.show,
    props.isEditing,
    props.isVersioning,
    metricTypes,
    algorithms,
    benchmarkTypes,
  ]);

  function handleCreate() {
    const promise = mutateCreate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response?.data?.message || err.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: "Metric created successfully",
        };
      });
    toast.promise(promise, {
      loading: "Creating metric...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleUpdate() {
    const promise = mutateUpdate
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response?.data?.message || err.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: "Metric updated successfully",
        };
      });
    toast.promise(promise, {
      loading: "Updating metric...",
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  function handleCreateNewVersion() {
    const promise = mutateCreateVersion
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: "Error: " + err.response?.data?.message || err.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        alert.current = {
          message: "Metric version created successfully",
        };
      });
    toast.promise(promise, {
      loading: "Creating metric version...",
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
          {props?.isVersioning ? (
            <>
              <FaCodeBranch className="me-2" />
              Create New Metric Version:{" "}
              <small className="ms-2 bg-light badge">
                <code>{props.metric?.metric_id}</code>
              </small>
            </>
          ) : props?.isEditing ? (
            <>
              <FaEdit className="me-2" /> Edit Metric:{" "}
              <small className="ms-2 bg-light badge">
                <code>{props.metric?.metric_id}</code>
              </small>
            </>
          ) : (
            <>
              <FaEdit className="me-2" />
              Create New Metric
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
                  disabled={props.isEditing || props.isVersioning}
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

          {/* Metric Type Field */}
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
                  value={metricInput.type_metric_id || ""}
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_metric_id: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    {t("fields.select_metric_type")}
                  </option>
                  {metricTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_metric_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_metric_id !== "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        metricTypes.find(
                          (item) => item.id === metricInput.type_metric_id,
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
                  value={metricInput.type_algorithm_id || ""}
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_algorithm_id: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    {t("page_motivations.tip_select_metric_algo")}
                  </option>
                  {algorithms.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_algorithm_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_algorithm_id !== "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        algorithms.find(
                          (item) => item.id === metricInput.type_algorithm_id,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>

          {/* Benchmark Type Field */}
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
                  value={metricInput.type_benchmark_id || ""}
                  onChange={(e) => {
                    setMetricInput({
                      ...metricInput,
                      type_benchmark_id: e.target.value,
                    });
                  }}
                >
                  <option value="" disabled>
                    {t("page_motivations.tip_select_benchmark_type")}
                  </option>
                  {benchmarkTypes.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </Form.Select>
              </InputGroup>
              {showErrors && metricInput.type_benchmark_id === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {metricInput.type_benchmark_id !== "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        benchmarkTypes.find(
                          (item) => item.id === metricInput.type_benchmark_id,
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
                      value_benchmark: parseFloat(cleanVal) || 0,
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
              if (props?.isVersioning) {
                handleCreateNewVersion();
              } else if (props?.isEditing) {
                handleUpdate();
              } else {
                handleCreate();
              }
            }
          }}
        >
          {props?.isVersioning
            ? t("buttons.create_version")
            : props?.isEditing
              ? t("buttons.update")
              : t("buttons.create")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
