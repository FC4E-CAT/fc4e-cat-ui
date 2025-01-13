import { useContext, useEffect, useRef, useState } from "react";
import {
  FaEdit,
  FaInfoCircle,
  FaPlus,
  FaPlusCircle,
  FaTimes,
  FaArrowLeft,
  FaArrowRight,
  FaExclamationTriangle,
  FaStaylinked,
} from "react-icons/fa";
import { AlertInfo, Subject } from "@/types";
import {
  useCreateSubject,
  useDeleteSubject,
  useGetSubject,
  useGetSubjects,
  useUpdateSubject,
} from "@/api/services/subjects";
import {
  Alert,
  Button,
  Form,
  InputGroup,
  Modal,
  OverlayTrigger,
  Row,
  Tooltip,
  Table,
} from "react-bootstrap";
import { AuthContext } from "@/auth";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { idToColor } from "@/utils/admin";

// Modes under which SubjectModal operates
enum SubjectModalMode {
  Create,
  Update,
  Delete,
}

// Basic configuration for subject modal
type SubjectModalBasicConfig = {
  mode: SubjectModalMode;
  id: number;
  show: boolean;
};

// Props for subject modal
type SubjectModalProps = SubjectModalBasicConfig & {
  onHide: () => void;
  onCreate: (item: Subject) => void;
  onUpdate: (item: Subject) => void;
  onDelete: (id: number) => void;
};

type SubjectState = {
  page: number;
  size: number;
};

// Creates a modal with a small form to create/edit a subject
export function SubjectModal(props: SubjectModalProps) {
  const [data, setData] = useState<Subject>({
    subject_id: "",
    name: "",
    type: "",
  });

  const { t } = useTranslation();

  const { keycloak, registered } = useContext(AuthContext)!;

  const qAssessment = useGetSubject({
    id: props.id,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    if (props.mode == SubjectModalMode.Create) {
      setData({ subject_id: "", name: "", type: "" });
    } else if (qAssessment.data) {
      // when updating or deleting a specific subject (this not creating)
      // get the subject details based on it's id
      setData(qAssessment.data);
    }
  }, [props.mode, props.show, props.id, qAssessment.data]);

  const handleChangeData = (field: string, value: string) => {
    setData((prevData) => ({
      ...prevData,
      [field]: value,
    }));
  };

  return (
    <Modal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header
        className={
          props.mode == SubjectModalMode.Delete
            ? "bg-danger text-white"
            : "bg-light"
        }
        closeButton
      >
        <Modal.Title id="contained-modal-title-vcenter">
          {props.mode == SubjectModalMode.Create && (
            <span>
              <FaPlusCircle className="me-2" />{" "}
              {t("page_subjects.modal_create")}
            </span>
          )}
          {props.mode == SubjectModalMode.Update && (
            <span>
              <FaEdit className="me-2" /> {t("page_subjects.modal_edit")}
              <small className="ms-2 badge bg-secondary">
                {t("fields.id")}: {data.id}
              </small>
            </span>
          )}
          {props.mode == SubjectModalMode.Delete && (
            <span>
              <FaTimes className="me-2" /> {t("page_subjects.modal_delete")}
              <small className="ms-2 badge bg-secondary">
                {t("fields.id")}: {data.id}
              </small>
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Row>
            <InputGroup className="mb-3">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_subjects.tip_subject_id")}
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-id">
                  <FaInfoCircle className="me-2" />{" "}
                  {t("page_subjects.subject_id")} (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-id"
                placeholder={t("page_subjects.subject_id_placeholder")}
                value={data.subject_id || ""}
                onChange={(e) => {
                  handleChangeData("subject_id", e.target.value);
                }}
                aria-describedby="label-info-subject-id"
                disabled={props.mode == SubjectModalMode.Delete}
              />
            </InputGroup>
          </Row>
          <Row>
            <InputGroup className="mb-3">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_subjects.tip_subject_name")}
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-name">
                  <FaInfoCircle className="me-2" />{" "}
                  {t("page_subjects.subject_name")} (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-name"
                placeholder={t("page_subjects.subject_name_placeholder")}
                value={data.name}
                onChange={(e) => {
                  handleChangeData("name", e.target.value);
                }}
                aria-describedby="label-info-subject-name"
                disabled={props.mode == SubjectModalMode.Delete}
              />
            </InputGroup>
          </Row>
          <Row>
            <InputGroup className="mb-3">
              <OverlayTrigger
                key="top"
                placement="top"
                overlay={
                  <Tooltip id={`tooltip-top`}>
                    {t("page_subjects.tip_subject_type")}
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-type">
                  <FaInfoCircle className="me-2" />{" "}
                  {t("page_subjects.subject_type")} (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-type"
                placeholder={t("page_subjects.subject_type_placeholder")}
                value={data.type}
                onChange={(e) => {
                  handleChangeData("type", e.target.value);
                }}
                aria-describedby="label-info-subject-type"
                disabled={props.mode == SubjectModalMode.Delete}
              />
            </InputGroup>
          </Row>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        {props.mode == SubjectModalMode.Create && (
          <>
            <Button
              id="modal-cancel-button"
              className="btn-secondary"
              onClick={() => props.onHide()}
            >
              {t("buttons.cancel")}
            </Button>
            <Button
              className="btn-success"
              onClick={() => props.onCreate(data)}
            >
              {t("buttons.create")}
            </Button>
          </>
        )}
        {props.mode == SubjectModalMode.Update && (
          <>
            <Button className="btn-secondary" onClick={() => props.onHide()}>
              {t("buttons.cancel")}
            </Button>
            <Button
              className="btn-success"
              onClick={() => props.onUpdate(data)}
            >
              {t("buttons.update")}
            </Button>
          </>
        )}
        {props.mode == SubjectModalMode.Delete && (
          <>
            <Button
              className="btn-danger"
              onClick={() => {
                if (data.id) props.onDelete(data.id);
              }}
            >
              {t("buttons.delete")}
            </Button>
            <Button className="btn-secondary" onClick={() => props.onHide()}>
              {t("buttons.cancel")}
            </Button>
          </>
        )}
      </Modal.Footer>
    </Modal>
  );
}

function Subjects() {
  // toast alert reference used in notification messaging
  const toastAlert = useRef<AlertInfo>({
    message: "",
  });

  const { t } = useTranslation();

  // create the tooltips
  const tooltipEdit = (
    <Tooltip id="tip-edit">{t("page_subjects.tip_edit")}</Tooltip>
  );
  const tooltipDelete = (
    <Tooltip id="tip-delete">{t("page_subjects.tip_delete")}</Tooltip>
  );

  // This is used to check at the end of url for a ?create param
  // if present, open the modal for the creation of a new object
  // This works with the Create new link at the profile page
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const doCreate = searchParams.has("create");

  // mutation hook for creating a new subject
  const { keycloak } = useContext(AuthContext)!;

  const [opts, setOpts] = useState<SubjectState>({
    page: 1,
    size: 20,
  });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };

  // data get subjects
  const { isLoading, data, refetch } = useGetSubjects({
    size: opts.size,
    page: opts.page,
    token: keycloak?.token || "",
  });

  // refetch users when parameters change
  useEffect(() => {
    refetch();
  }, [opts, refetch]);

  const [subjectModalConfig, setSubjectModalConfig] =
    useState<SubjectModalBasicConfig>({
      mode: SubjectModalMode.Create,
      show: false,
      id: -1,
    });

  // hooks for handling subjects in through the backend
  const mutationCreateSubject = useCreateSubject(keycloak?.token || "");
  const mutationUpdateSubject = useUpdateSubject(keycloak?.token || "");
  const mutationDeleteSubject = useDeleteSubject(keycloak?.token || "");

  // get the user data to create the table
  const subjects: Subject[] = data ? data?.content : [];

  // if ?create at the end of the url, show immediately the create new modal
  useEffect(() => {
    if (doCreate) {
      setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: true }));
    }
  }, [doCreate]);

  const handleCreateSubject = (item: Subject) => {
    const promise = mutationCreateSubject
      .mutateAsync(item)
      .catch((err) => {
        toastAlert.current = {
          message: t("page_subjects.toast_create_fail"),
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: t("page_subjects.toast_create_success"),
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: t("page_subjects.toast_create_progress"),
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleUpdateSubject = (item: Subject) => {
    const promise = mutationUpdateSubject
      .mutateAsync(item)
      .catch((err) => {
        toastAlert.current = {
          message: t("page_subjects.toast_update_fail"),
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: t("page_subjects.toast_update_success"),
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: t("page_subjects.toast_update_progress"),
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleDeleteSubject = (id: number) => {
    const promise = mutationDeleteSubject
      .mutateAsync(id)
      .catch((err) => {
        toastAlert.current = {
          message: t("page_subjects.toast_delete_fail"),
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: t("page_subjects.toast_delete_success"),
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: t("page_subjects.toast_delete_progress"),
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  return (
    <div>
      <SubjectModal
        {...subjectModalConfig}
        onHide={() =>
          setSubjectModalConfig({ ...subjectModalConfig, show: false })
        }
        onCreate={handleCreateSubject}
        onUpdate={handleUpdateSubject}
        onDelete={handleDeleteSubject}
      />
      <div className="cat-view-heading-block row border-bottom">
        <div className="col">
          <h2 className="cat-view-heading text-muted">
            Subjects
            <p className="lead cat-view-lead">Manage your own subjects.</p>
          </h2>
        </div>
        <div className="col-md-auto cat-heading-right">
          <Button
            variant="warning"
            className="cat-button-create-new"
            onClick={() =>
              setSubjectModalConfig({
                id: -1,
                mode: SubjectModalMode.Create,
                show: true,
              })
            }
          >
            <FaPlus className="me-2" />
            {t("buttons.create_new")}
          </Button>
        </div>
      </div>
      <div className="py-2 px-2">
        <Table hover>
          <thead>
            <tr className="table-light">
              <th>
                <span>{t("page_subjects.subject_name")}</span>
              </th>

              <th>
                <span>{t("page_subjects.subject_type")}</span>
              </th>
              <th>
                <span>{t("fields.actions")}</span>
              </th>
            </tr>
          </thead>
          {subjects.length > 0 ? (
            <tbody>
              {subjects.map((item) => {
                return (
                  <tr key={item.id}>
                    <td className="align-middle">
                      <div className="d-flex  justify-content-start">
                        <div>
                          <FaStaylinked
                            size={"3rem"}
                            style={{ color: idToColor(item.subject_id) }}
                          />
                        </div>
                        <div className="ms-2 d-flex flex-column justify-content-between">
                          <div>{item.name}</div>
                          <span
                            style={{ fontSize: "0.64rem" }}
                            className="text-muted"
                          >
                            {t("fields.id")}: {item.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="align-middle">{item.type}</td>
                    <td>
                      <div className="d-flex flex-nowrap">
                        <OverlayTrigger placement="top" overlay={tooltipEdit}>
                          <Button
                            id={`edit-button-${item.id}`}
                            className="btn btn-light btn-sm m-1 "
                            onClick={() => {
                              if (item.id) {
                                setSubjectModalConfig({
                                  id: item.id,
                                  mode: SubjectModalMode.Update,
                                  show: true,
                                });
                              }
                            }}
                          >
                            <FaEdit />
                          </Button>
                        </OverlayTrigger>
                        <OverlayTrigger placement="top" overlay={tooltipDelete}>
                          <Button
                            id={`delete-button-${item.id}`}
                            className="btn btn-light btn-sm m-1"
                            onClick={() => {
                              if (item.id) {
                                setSubjectModalConfig({
                                  id: item.id,
                                  mode: SubjectModalMode.Delete,
                                  show: true,
                                });
                              }
                            }}
                          >
                            <FaTimes />
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
      </div>
      {!isLoading && subjects.length === 0 && (
        <Alert variant="warning" className="text-center mx-auto">
          <h3>
            <FaExclamationTriangle />
          </h3>
          <h5>{t("no_data")}...</h5>
        </Alert>
      )}
      <div className="d-flex justify-content-end">
        <div>
          <span className="mx-1">{t("rows_per_page")}: </span>
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
      <div className="row py-3 p-4">
        <div className="col"></div>
      </div>
    </div>
  );
}

export default Subjects;
