import { useMotivationAddActor } from "@/api/services/motivations";
import { useGetAllTestMethods } from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { relMtvActorId } from "@/config";
import ROUTES, { buildRoute } from "@/routes";
import {
  AlertInfo,
  AutoGroupTest,
  MotivationActor,
  RegistryResource,
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
  Alert,
  ListGroup,
} from "react-bootstrap";

import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import {
  FaCogs,
  FaInfoCircle,
  FaPlus,
  FaTrashAlt,
  FaUser,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

interface MotivationActorModalProps {
  motivationActors: MotivationActor[];
  id: string;
  show: boolean;
  onHide: () => void;
}

/**
 * Modal component for adding an actor to motivation
 */
export function MotivationActorModal(props: MotivationActorModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const [actorId, setActorId] = useState("");
  const [showErrors, setShowErrors] = useState(false);
  const [autoGroups, setAutoGroups] = useState<AutoGroupTest[]>([]);
  const [testMethods, setTestMethods] = useState<RegistryResource[]>([]);

  const navigate = useNavigate();

  const {
    data: testMethodsData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
  } = useGetAllTestMethods({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
    enabled: true,
  });

  useEffect(() => {
    // gather all test methods
    let tmpTestMethods: RegistryResource[] = [];

    // iterate over backend pages and gather all items in the metric types array
    if (testMethodsData?.pages) {
      testMethodsData.pages.map((page) => {
        tmpTestMethods = [...tmpTestMethods, ...page.content];
      });
      if (tmHasNextPage) {
        tmFetchNextPage();
      }
    }

    tmpTestMethods = tmpTestMethods?.filter(
      (testMethod) =>
        testMethod?.label !== "String-Auto" &&
        testMethod?.label !== "String-Manual" &&
        testMethod?.label !== "Binary-Auto",
    );

    setTestMethods(tmpTestMethods);
  }, [testMethodsData, tmHasNextPage, tmFetchNextPage]);

  const mutateAddActor = useMotivationAddActor(
    keycloak?.token || "",
    props.id,
    actorId,
    relMtvActorId,
    autoGroups,
  );

  function handleValidate() {
    setShowErrors(true);

    // check if actor id is empty and return immediately
    if (!actorId) return false;

    // check against auto test groups
    for (const group of autoGroups) {
      if (!group.endpoint) return false;
      if (!group.test_method) return false;
      if (group.params) {
        for (const param of group.params) {
          if (!param.name) return false;
          if ("assessment_ref" in param && param.assessment_ref === "")
            return false;
          if ("value" in param && param.value === "") return false;
        }
      }
    }

    return true;
  }

  useEffect(() => {
    if (props.show) {
      {
        setActorId("");
        setAutoGroups([]);
      }
      setShowErrors(false);
    }
  }, [props.show]);

  // handle backend call to add an actor to the motivation
  function handleAddActor() {
    const promise = mutateAddActor
      .mutateAsync()
      .catch((err) => {
        alert.current = {
          message: `${t("error")}: ` + err.response.data.message,
        };
        throw err;
      })
      .then(() => {
        props.onHide();
        navigate(
          buildRoute(ROUTES.ADMIN.MOTIVATIONS.ASSESSMENT_BUILDER, {
            mtvId: props?.id || "",
            actId: actorId || "",
          }),
        );
        alert.current = {
          message: t("page_motivations.toast_add_actor_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_motivations.toast_add_actor_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      onHide={props.onHide}
      show={props.show}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          className="d-flex align-items-center gap-1"
          id="contained-modal-title-vcenter"
        >
          <FaUser className="me-2" />{" "}
          {t("page_motivations.modal_add_actor_title")}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Row>
          <Col>
            <InputGroup className="mt-2">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_motivations.tip_select_actor_type")}
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-actor-type">
                  <FaInfoCircle className="me-2" /> {t("actor")} (*):
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Select
                id="input-actor-type"
                aria-describedby="label-actor-type"
                value={actorId ? actorId : ""}
                onChange={(e) => {
                  setActorId(e.target.value);
                }}
              >
                <>
                  <option value="" disabled>
                    {t("page_motivations.select_actor_type")}
                  </option>
                  {props.motivationActors.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </>
              </Form.Select>
            </InputGroup>
            {showErrors && actorId === "" && (
              <span className="text-danger">{t("required")}</span>
            )}
          </Col>
        </Row>
        <hr />

        <div className="d-flex justify-content-between mb-2">
          <h5>{t("page_motivations.group_tests_section")}: </h5>
          <Button
            variant="warning"
            size="sm"
            onClick={() => {
              setAutoGroups([
                ...autoGroups,
                { endpoint: "", test_method: "", params: [] },
              ]);
            }}
          >
            <FaPlus /> {t("buttons.add_group_test")}
          </Button>
        </div>
        {autoGroups.length === 0 ? (
          <Alert variant="secondary">
            <em>{t("page_motivations.info_add_group_tests")}</em>
          </Alert>
        ) : (
          <div>
            {autoGroups.map((item, index) => (
              <div key={index} className="p-2 border rounded mb-2">
                <div className="d-flex justify-content-between mb-1">
                  <div>
                    <FaCogs className="me-2" size="1.2rem" />
                    Automated group test {index + 1}:
                  </div>
                  <div>
                    <Button
                      onClick={() =>
                        setAutoGroups((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      variant="danger"
                      size="sm"
                    >
                      <FaTrashAlt className="me-2" />
                      Remove
                    </Button>
                  </div>
                </div>
                <InputGroup>
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{t("page_motivations.tip_test_method")}</Tooltip>
                    }
                  >
                    <InputGroup.Text id={`test-${index}-label-test-method`}>
                      <FaInfoCircle className="me-2" /> {t("test_method")} (*):
                    </InputGroup.Text>
                  </OverlayTrigger>
                  <Form.Select
                    id={`test-${index}-input-test-method`}
                    aria-describedby={`test-${index}-label-test-method`}
                    value={item.test_method}
                    onChange={(e) => {
                      setAutoGroups((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? { ...item, ["test_method"]: e.target.value }
                            : item,
                        ),
                      );
                    }}
                  >
                    <>
                      <option value="" disabled>
                        {t("page_motivations.select_test_method")}
                      </option>
                      {testMethods.map((item) => (
                        <option key={item.id} value={item.label}>
                          {item?.friendly_label || item.label}
                        </option>
                      ))}
                    </>
                  </Form.Select>
                </InputGroup>
                {showErrors && !item.test_method && (
                  <small className="text-danger">{t("required")}</small>
                )}

                <InputGroup className="mt-1">
                  <OverlayTrigger
                    placement="top"
                    overlay={
                      <Tooltip>{t("page_motivations.tip_endpoint")}</Tooltip>
                    }
                  >
                    <InputGroup.Text id={`test-${index}-label-endpoint`}>
                      <FaInfoCircle className="me-2" /> {t("endpoint")} (*):
                    </InputGroup.Text>
                  </OverlayTrigger>
                  <Form.Control
                    id={`test-${index}-input-endpoint`}
                    placeholder={t("page_motivations.select_endpoint")}
                    value={item.endpoint}
                    onChange={(e) => {
                      setAutoGroups((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? { ...item, ["endpoint"]: e.target.value }
                            : item,
                        ),
                      );
                    }}
                    aria-describedby={`test-${index}-label-endpoint`}
                  />
                </InputGroup>
                {showErrors && !item.endpoint && (
                  <small className="text-danger">{t("required")}</small>
                )}
                <div className="py-2 px-4 rounded border mt-1">
                  <div className="d-flex justify-content-between">
                    <div className="me-2">
                      <strong>Parameters:</strong>
                    </div>
                    <div>
                      <Button
                        size="sm"
                        variant="warning"
                        onClick={() =>
                          setAutoGroups((prev) =>
                            prev.map((item, i) =>
                              i === index
                                ? {
                                    ...item,
                                    ["params"]: [
                                      ...item.params,
                                      { name: "", assessment_ref: "" },
                                    ],
                                  }
                                : item,
                            ),
                          )
                        }
                      >
                        <FaPlus /> Add Parameter
                      </Button>
                    </div>
                  </div>
                  <div>
                    <ListGroup className="m-2">
                      {autoGroups[index].params.map((paramItem, paramIndex) => (
                        <ListGroup.Item key={paramIndex}>
                          <div className="d-flex justify-content-between mb-1">
                            <div>Parameter {paramIndex + 1}:</div>
                            <div>
                              <Button
                                size="sm"
                                variant="danger"
                                onClick={() => {
                                  setAutoGroups((prev) =>
                                    prev.map((item, i) =>
                                      i === index
                                        ? {
                                            ...item,
                                            ["params"]: item.params.filter(
                                              (_, j) => j !== paramIndex,
                                            ),
                                          }
                                        : item,
                                    ),
                                  );
                                }}
                              >
                                <FaTrashAlt className="me-2" />
                                Remove
                              </Button>
                            </div>
                          </div>
                          <InputGroup>
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {t("page_motivations.tip_select_param_type")}
                                </Tooltip>
                              }
                            >
                              <InputGroup.Text
                                id={`test-${index}-param-${paramIndex}-label-param-type`}
                              >
                                <FaInfoCircle className="me-2" />{" "}
                                {t("param_type")} (*):
                              </InputGroup.Text>
                            </OverlayTrigger>
                            <Form.Select
                              id={`test-${index}-param-${paramIndex}-input-param-type`}
                              aria-describedby={`test-${index}-param-${paramIndex}-param-type`}
                              value={
                                "assessment_ref" in paramItem ? "ref" : "val"
                              }
                              onChange={(e) => {
                                setAutoGroups((prev) =>
                                  prev.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          ["params"]: item.params.map(
                                            (subItem, j) =>
                                              j === paramIndex
                                                ? e.target.value === "ref"
                                                  ? {
                                                      name: subItem.name,
                                                      assessment_ref: "",
                                                    }
                                                  : {
                                                      name: subItem.name,
                                                      value: "",
                                                    }
                                                : subItem,
                                          ),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                            >
                              <>
                                <option value="" disabled>
                                  {t("page_motivations.select_param_type")}
                                </option>

                                <option value="ref">
                                  {t("assessment_ref")}
                                </option>
                                <option value="val">{t("value")}</option>
                              </>
                            </Form.Select>
                          </InputGroup>

                          <InputGroup className="mt-1">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {t("page_motivations.tip_param_name")}
                                </Tooltip>
                              }
                            >
                              <InputGroup.Text
                                id={`test-${index}-param-${paramIndex}-label-name`}
                              >
                                <FaInfoCircle className="me-2" />{" "}
                                {t("fields.name")} (*):
                              </InputGroup.Text>
                            </OverlayTrigger>
                            <Form.Control
                              id={`test-${index}-param-${paramIndex}-input-name`}
                              value={paramItem.name}
                              onChange={(e) => {
                                setAutoGroups((prev) =>
                                  prev.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          ["params"]: item.params.map(
                                            (subItem, j) =>
                                              j === paramIndex
                                                ? {
                                                    ...subItem,
                                                    ["name"]: e.target.value,
                                                  }
                                                : subItem,
                                          ),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              aria-describedby={`test-${index}-param-${paramIndex}-label-name`}
                            />
                          </InputGroup>
                          {showErrors && !paramItem.name && (
                            <small className="text-danger">
                              {t("required")}
                            </small>
                          )}
                          <InputGroup className="mt-1">
                            <OverlayTrigger
                              placement="top"
                              overlay={
                                <Tooltip>
                                  {"assessment_ref" in paramItem
                                    ? t(
                                        "page_motivations.tip_param_assessment_ref",
                                      )
                                    : t("page_motivations.tip_param_value")}
                                </Tooltip>
                              }
                            >
                              <InputGroup.Text
                                id={`test-${index}-param-${paramIndex}-label-value`}
                              >
                                <FaInfoCircle className="me-2" />{" "}
                                {"assessment_ref" in paramItem
                                  ? t("assessment_ref")
                                  : t("value")}{" "}
                                (*):
                              </InputGroup.Text>
                            </OverlayTrigger>
                            <Form.Control
                              id={`test-${index}-param-${paramIndex}-input-value`}
                              value={
                                "assessment_ref" in paramItem
                                  ? paramItem.assessment_ref
                                  : paramItem.value
                              }
                              onChange={(e) => {
                                setAutoGroups((prev) =>
                                  prev.map((item, i) =>
                                    i === index
                                      ? {
                                          ...item,
                                          ["params"]: item.params.map(
                                            (subItem, j) =>
                                              j === paramIndex
                                                ? "assessment_ref" in subItem
                                                  ? {
                                                      ...subItem,
                                                      ["assessment_ref"]:
                                                        e.target.value,
                                                    }
                                                  : {
                                                      ...subItem,
                                                      ["value"]: e.target.value,
                                                    }
                                                : subItem,
                                          ),
                                        }
                                      : item,
                                  ),
                                );
                              }}
                              aria-describedby={`test-${index}-param-${paramIndex}-label-value`}
                            />
                          </InputGroup>
                          {showErrors &&
                            (("assessment_ref" in paramItem &&
                              paramItem.assessment_ref === "") ||
                              ("value" in paramItem &&
                                paramItem.value === "")) && (
                              <small className="text-danger">
                                {t("required")}
                              </small>
                            )}
                        </ListGroup.Item>
                      ))}
                    </ListGroup>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.close")}
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              handleAddActor();
            }
          }}
        >
          {t("buttons.create")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
