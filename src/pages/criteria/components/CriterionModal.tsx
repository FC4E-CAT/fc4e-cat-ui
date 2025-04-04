import {
  useCreateCriterion,
  useGetAllCriterionTypes,
  useGetAllImperatives,
  useGetCriterion,
  useUpdateCriterion,
} from "@/api";
import { AuthContext } from "@/auth";
import { defaultCriterionImperative, defaultCriterionType } from "@/config";
import { AlertInfo, CriterionInput, CriterionType, Imperative } from "@/types";
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

interface CriterionModalProps {
  id: string;
  show: boolean;
  onHide: () => void;
}
/**
 * Modal component for creating/editing a criterion
 */
export function CriterionModal(props: CriterionModalProps) {
  const alert = useRef<AlertInfo>({
    message: "",
  });
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  const [imperatives, setImperatives] = useState<Imperative[]>([]);
  const [criterionTypes, setCriterionTypes] = useState<CriterionType[]>([]);

  const [criterionInput, setCriterionInput] = useState<CriterionInput>({
    cri: "",
    label: "",
    imperative: "",
    description: "",
    type_criterion_id: "",
  });

  const { data: criData } = useGetCriterion({
    id: props.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: ctData,
    fetchNextPage: ctFetchNextPage,
    hasNextPage: ctHasNextPage,
  } = useGetAllCriterionTypes({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  const {
    data: impData,
    fetchNextPage: impFetchNextPage,
    hasNextPage: impHasNextPage,
  } = useGetAllImperatives({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  useEffect(() => {
    // gather all criterion types mappings in one array
    let tmpCt: CriterionType[] = [];

    // iterate over backend pages and gather all items in the criterion types array
    if (ctData?.pages) {
      ctData.pages.map((page) => {
        tmpCt = [...tmpCt, ...page.content];
      });
      if (ctHasNextPage) {
        ctFetchNextPage();
      }
    }

    setCriterionTypes(tmpCt);
  }, [ctData, ctHasNextPage, ctFetchNextPage]);

  useEffect(() => {
    // gather all imperatives in one array
    let tmpImp: Imperative[] = [];
    // iterate over backend pages and gather all items in the imp array
    if (impData?.pages) {
      impData.pages.map((page) => {
        tmpImp = [...tmpImp, ...page.content];
      });
      if (impHasNextPage) {
        impFetchNextPage();
      }
    }

    setImperatives(tmpImp);
  }, [impData, impHasNextPage, impFetchNextPage]);

  const [showErrors, setShowErrors] = useState(false);

  function handleValidate() {
    setShowErrors(true);
    return (
      criterionInput.cri !== "" &&
      criterionInput.label !== "" &&
      criterionInput.description !== ""
    );
  }

  const mutateCreate = useCreateCriterion(
    keycloak?.token || "",
    criterionInput,
  );

  const mutateUpdate = useUpdateCriterion(
    keycloak?.token || "",
    props.id || "",
    criterionInput,
  );

  useEffect(() => {
    if (props.show) {
      if (criData) {
        setCriterionInput({
          cri: criData.cri,
          label: criData.label,
          description: criData.description,
          imperative: criData.imperative,
          type_criterion_id: criData.type_criterion_id,
        });
      } else {
        // get default imperative
        const imp =
          imperatives.filter(
            (item) => item.label === defaultCriterionImperative,
          )[0]?.id || "";
        // get default criterion type
        const crType =
          criterionTypes.filter(
            (item) => item.label === defaultCriterionType,
          )[0]?.id || "";
        setCriterionInput({
          cri: "",
          label: "",
          description: "",
          imperative: imp,
          type_criterion_id: crType,
        });
      }

      setShowErrors(false);
    }
  }, [props.show, criData, criterionTypes, imperatives]);

  // handle backend call to add a new criterion
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
          message: t("page_criteria.toast_create_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_criteria.toast_create_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  // handle backend call to update an existing criterion
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
          message: t("page_criteria.toast_update_success"),
        };
      });
    toast.promise(promise, {
      loading: t("page_criteria.toast_update_progress"),
      success: () => `${alert.current.message}`,
      error: () => `${alert.current.message}`,
    });
  }

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header className="bg-success text-white" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          {props.id ? (
            <>
              <FaEdit className="me-2" />
              {t("page_criteria.edit")}
            </>
          ) : (
            <>
              <FaFile className="me-2" />
              {t("page_criteria.create_new")}
            </>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div>
          <Row>
            <Col xs={4}>
              <InputGroup className="mt-2">
                <OverlayTrigger
                  key="top"
                  placement="top"
                  overlay={
                    <Tooltip id={`tooltip-top`}>
                      {t("page_criteria.tip_cri")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-criterion-cri">
                    <FaInfoCircle className="me-2" />{" "}
                    {t("fields.cri").toUpperCase()} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-criterion-cri"
                  value={criterionInput.cri}
                  onChange={(e) => {
                    setCriterionInput({
                      ...criterionInput,
                      cri: e.target.value,
                    });
                  }}
                  aria-describedby="label-criterion-cri"
                />
              </InputGroup>
              {showErrors && criterionInput.cri === "" && (
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
                      {t("page_criteria.tip_label")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-criterion-label">
                    <FaInfoCircle className="me-2" /> {t("fields.label")} (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Control
                  id="input-criterion-label"
                  aria-describedby="label-criterion-label"
                  value={criterionInput.label}
                  onChange={(e) => {
                    setCriterionInput({
                      ...criterionInput,
                      label: e.target.value,
                    });
                  }}
                />
              </InputGroup>
              {showErrors && criterionInput.label === "" && (
                <span className="text-danger">{t("fields.label")}</span>
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
                    {t("page_criteria.tip_description")}
                  </Tooltip>
                }
              >
                <span id="label-criterion-description">
                  <FaInfoCircle className="ms-1 me-2" />{" "}
                  {t("fields.description")} (*):
                </span>
              </OverlayTrigger>
              <Form.Control
                className="mt-1"
                as="textarea"
                rows={2}
                value={criterionInput.description}
                onChange={(e) => {
                  setCriterionInput({
                    ...criterionInput,
                    description: e.target.value,
                  });
                }}
              />
              {showErrors && criterionInput.description === "" && (
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
                      {t("page_criteria.tip_imperative")}
                    </Tooltip>
                  }
                >
                  <InputGroup.Text id="label-motivation-type">
                    <FaInfoCircle className="me-2" /> {t("fields.imperative")}{" "}
                    (*):
                  </InputGroup.Text>
                </OverlayTrigger>
                <Form.Select
                  id="input-motivation-type"
                  aria-describedby="label-motivation-type"
                  placeholder={t("page_criteria.select_imperative")}
                  value={
                    criterionInput.imperative ? criterionInput.imperative : ""
                  }
                  onChange={(e) => {
                    setCriterionInput({
                      ...criterionInput,
                      imperative: e.target.value,
                    });
                  }}
                >
                  <>
                    <option value="" disabled>
                      {t("fields.select_imperative")}
                    </option>
                    {imperatives.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.label}
                      </option>
                    ))}
                  </>
                </Form.Select>
              </InputGroup>
              {showErrors && criterionInput.imperative === "" && (
                <span className="text-danger">{t("required")}</span>
              )}
              {criterionInput.imperative != "" && (
                <div className="bg-light text-secondary border rounded mt-2 p-3">
                  <small>
                    <em>
                      {
                        imperatives.find(
                          (item) => item.id == criterionInput.imperative,
                        )?.description
                      }
                    </em>
                  </small>
                </div>
              )}
            </Col>
          </Row>
        </div>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button className="btn-secondary" onClick={props.onHide}>
          {t("buttons.cancel")}
        </Button>
        <Button
          className="btn-success"
          onClick={() => {
            if (handleValidate() === true) {
              if (props.id === "") {
                handleCreate();
              } else {
                handleUpdate();
              }
            }
          }}
        >
          {props.id === "" ? t("buttons.create") : t("buttons.update")}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
