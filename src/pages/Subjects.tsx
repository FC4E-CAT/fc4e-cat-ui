import { useContext, useEffect, useMemo, useRef, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { CustomTable } from "@/components";
import { FaCubes, FaPlus, FaPlusCircle } from "react-icons/fa";
import { AlertInfo, Subject } from "@/types";
import { useCreateSubject, useGetSubjects } from "@/api/services/subjects";
import { Button, Col, Form, Modal, Row } from "react-bootstrap";
import { AuthContext } from "@/auth";
import toast from "react-hot-toast";
import { useLocation } from "react-router-dom";

// Basic configuration for subject modal
type SubjectModalBasicConfig = {
  editMode: boolean;
  id: number;
  show: boolean;
};

// Props for subject modal
type SubjectModalProps = SubjectModalBasicConfig & {
  onHide: () => void;
  onCreate: (item: Subject) => void;
  onUpdate: (item: Subject) => void;
};

// Creates a modal with a small form to create/edit a subject
export function SubjectModal(props: SubjectModalProps) {
  const [data, setData] = useState<Subject>({
    subject_id: "",
    name: "",
    type: "",
  });

  useEffect(() => {
    if (props.show && !props.editMode) {
      setData({ subject_id: "", name: "", type: "" });
    }
  }, [props.editMode, props.show]);

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
      <Modal.Header className="bg-light" closeButton>
        <Modal.Title id="contained-modal-title-vcenter">
          <FaPlusCircle className="me-2" />
          {`${props.editMode ? "Edit" : "Create new"} Object`}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group as={Row} className="mb-3" controlId="formSubjectName">
            <Form.Label column sm={2}>
              <strong>Name</strong>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                placeholder="Name of the object"
                value={data.name}
                onChange={(e) => handleChangeData("name", e.target.value)}
              />
            </Col>
          </Form.Group>

          <Form.Group as={Row} className="mb-3" controlId="formSubjectType">
            <Form.Label column sm={2}>
              <strong>Type</strong>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                placeholder="Specify the type of object (e.g. service)"
                value={data.type}
                onChange={(e) => handleChangeData("type", e.target.value)}
              />
            </Col>
          </Form.Group>
          <Form.Group as={Row} className="mb-3" controlId="formSubjectId">
            <Form.Label column sm={2}>
              <strong>Id</strong> <em>(optional)</em>
            </Form.Label>
            <Col sm={10}>
              <Form.Control
                type="text"
                placeholder="Specify a reference id to this object (e.g. a PID)"
                value={data.subject_id}
                onChange={(e) => handleChangeData("subject_id", e.target.value)}
              />
            </Col>
          </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer className="d-flex justify-content-between">
        <Button
          className="btn-success me-4"
          onClick={() => {
            props.editMode ? props.onUpdate(data) : props.onCreate(data);
          }}
        >
          {props.editMode ? "Update" : "Create"}
        </Button>
        <Button className="btn-secondary" onClick={() => props.onHide()}>
          Cancel
        </Button>
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
  const mutationCreateSubject = useCreateSubject(keycloak?.token || "");

  const [subjectModalConfig, setSubjectModalConfig] =
    useState<SubjectModalBasicConfig>({
      editMode: false,
      show: false,
      id: -1,
    });

  const cols = useMemo<ColumnDef<Subject>[]>(
    () => [
      {
        accessorFn: (row) => row.type,
        id: "type",
        cell: (info) => info.getValue(),
        header: () => <span>Type</span>,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.name,
        id: "name",
        cell: (info) => info.getValue(),
        header: () => <span>Name</span>,
        enableColumnFilter: false,
      },
      {
        accessorFn: (row) => row.subject_id,
        id: "subject_id",
        cell: (info) => info.getValue(),
        header: () => <span>Subject Id</span>,
        enableColumnFilter: false,
      },
    ],
    [],
  );

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
          message: "Error during assessment creation.",
        };
        throw err;
      })
      .then(() => {
        toastAlert.current = {
          message: "Assessment succesfully created.",
        };
        // close the modal
        setSubjectModalConfig((prevConfig) => ({ ...prevConfig, show: false }));
      });
    toast.promise(promise, {
      loading: "Creating",
      success: () => `${toastAlert.current.message}`,
      error: () => `${toastAlert.current.message}`,
    });
  };

  return (
    <div className="mt-4">
      <SubjectModal
        {...subjectModalConfig}
        onHide={() =>
          setSubjectModalConfig({ ...subjectModalConfig, show: false })
        }
        onCreate={handleCreateSubject}
        onUpdate={() => console.log(`update`)}
      />
      <div className={"d-flex justify-content-between container"}>
        <h3 className="cat-view-heading">
          <FaCubes className="me-2" />
          my objects
        </h3>
        <Button
          variant="light"
          className="border-black"
          onClick={() =>
            setSubjectModalConfig({ id: -1, editMode: false, show: true })
          }
        >
          <FaPlus /> Create New
        </Button>
      </div>
      <CustomTable columns={cols} dataSource={useGetSubjects} />
    </div>
  );
}

export default Subjects;
