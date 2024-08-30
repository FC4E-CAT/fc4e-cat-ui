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

type ValidationState = {
  sortOrder: string;
  sortBy: string;
  type: string;
  page: number;
  size: number;
  search: string;
  status: string;
};

// Creates a modal with a small form to create/edit a subject
export function SubjectModal(props: SubjectModalProps) {
  const [data, setData] = useState<Subject>({
    subject_id: "",
    name: "",
    type: "",
  });

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
              <FaPlusCircle className="me-2" /> Create new subject
            </span>
          )}
          {props.mode == SubjectModalMode.Update && (
            <span>
              <FaEdit className="me-2" /> Edit subject
              <small className="ms-2 badge bg-secondary">id: {data.id}</small>
            </span>
          )}
          {props.mode == SubjectModalMode.Delete && (
            <span>
              <FaTimes className="me-2" /> Delete subject
              <small className="ms-2 badge bg-secondary">id: {data.id}</small>
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
                    A unique identifier for the current subject - this can be a
                    URL, a string representing the service or organisation being
                    assessed, or the PID of a resource owned by you.
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-id">
                  <FaInfoCircle className="me-2" /> Subject ID (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-id"
                placeholder="A unique identifier for the current subject"
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
                    The name of the subject of the assessment as identified
                    above
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-name">
                  <FaInfoCircle className="me-2" /> Subject Name (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-name"
                placeholder="The name of the subject of the assessment as identified above"
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
                    The type of object (such as a web resource identified by the
                    owner) or service provided by an authority, provider, or
                    manager, for which the assessment will be completed.
                  </Tooltip>
                }
              >
                <InputGroup.Text id="label-info-subject-type">
                  <FaInfoCircle className="me-2" /> Subject Type (*)
                </InputGroup.Text>
              </OverlayTrigger>
              <Form.Control
                id="input-info-subject-type"
                placeholder="The type of object for which the assessment will  be completed"
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
              Cancel
            </Button>
            <Button
              className="btn-success"
              onClick={() => props.onCreate(data)}
            >
              Create
            </Button>
          </>
        )}
        {props.mode == SubjectModalMode.Update && (
          <>
            <Button className="btn-secondary" onClick={() => props.onHide()}>
              Cancel
            </Button>
            <Button
              className="btn-success"
              onClick={() => props.onUpdate(data)}
            >
              Update
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
              Delete
            </Button>
            <Button className="btn-secondary" onClick={() => props.onHide()}>
              Cancel
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

  // This is used to check at the end of url for a ?create param
  // if present, open the modal for the creation of a new object
  // This works with the Create new link at the profile page
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const doCreate = searchParams.has("create");

  // mutation hook for creating a new subject
  const { keycloak } = useContext(AuthContext)!;

  const [opts, setOpts] = useState<ValidationState>({
    sortBy: "",
    sortOrder: "",
    type: "",
    page: 1,
    size: 20,
    search: "",
    status: "",
  });

  // handler for changing page size
  const handleChangePageSize = (evt: { target: { value: string } }) => {
    setOpts({ ...opts, page: 1, size: parseInt(evt.target.value) });
  };
  const { isLoading, data, refetch } = useGetSubjects({
    size: opts.size,
    page: opts.page,
    sortBy: opts.sortBy,
    sortOrder: opts.sortOrder,
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
          message: "Error during subject creation.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "Subject succesfully created.",
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Creating...",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleUpdateSubject = (item: Subject) => {
    const promise = mutationUpdateSubject
      .mutateAsync(item)
      .catch((err) => {
        toastAlert.current = {
          message: "Error during subject update.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "Subject succesfully updated.",
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Updating...",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  const handleDeleteSubject = (id: number) => {
    const promise = mutationDeleteSubject
      .mutateAsync(id)
      .catch((err) => {
        toastAlert.current = {
          message: "Error during subject deletion.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "Subject succesfully deleted.",
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Deleting...",
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
            <FaPlus /> Create New
          </Button>
        </div>
      </div>

      <Table hover>
        <thead>
          <tr className="table-light">
            <th>
              <span>Subject Id </span>
            </th>
            <th>
              <span>Subject Name </span>
            </th>

            <th>
              <span>Subject Type </span>
            </th>
            <th></th>
          </tr>
        </thead>
        {subjects.length > 0 ? (
          <tbody>
            {subjects.map((item) => {
              return (
                <tr key={item.id}>
                  <td className="align-middle">{item.id}</td>
                  <td className="align-middle">{item.name}</td>
                  <td className="align-middle">{item.type}</td>

                  <td>
                    <div className="edit-buttons btn-group shadow">
                      <Button
                        id={`edit-button-${item.id}`}
                        className="btn btn-secondary cat-action-reject-link btn-sm "
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
                      <Button
                        id={`delete-button-${item.id}`}
                        className="btn btn-secondary cat-action-reject-link btn-sm "
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
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        ) : null}
      </Table>
      {!isLoading && subjects.length === 0 && (
        <Alert variant="warning" className="text-center mx-auto">
          <h3>
            <FaExclamationTriangle />
          </h3>
          <h5>No data found...</h5>
        </Alert>
      )}
      <div className="d-flex justify-content-end">
        <div>
          <span className="mx-1">rows per page: </span>
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
