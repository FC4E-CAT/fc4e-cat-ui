import { AuthContext } from "@/auth";
import { useState, useContext, useEffect, useRef } from "react";
import { Button, Col, Row } from "react-bootstrap";

import { FaFile, FaTrash } from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";
import { PrincipleModal } from "./components/PrincipleModal";
import { AlertInfo, Principle } from "@/types";
import { useDeletePrinciple, useGetPrinciple } from "@/api/services/principles";
import { DeleteModal } from "@/components/DeleteModal";
import toast from "react-hot-toast";

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

export default function PrincipleDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: "Delete Principle",
      message: "Are you sure you want to delete the following principle?",
      itemId: "",
      itemName: "",
    },
  );

  const [principle, setPrinciple] = useState<Principle>();
  const [showUpdate, setShowUpdate] = useState(false);
  const { data: principleData } = useGetPrinciple({
    id: params.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const mutationDelete = useDeletePrinciple(keycloak?.token || "");

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: "Error during principle deletion!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Principle succesfully deleted.",
          };
          setDeleteModalConfig({
            ...deleteModalConfig,
            show: false,
            itemId: "",
            itemName: "",
          });
          navigate(-1);
        });
      toast.promise(promise, {
        loading: "Deleting...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  };

  useEffect(() => {
    setPrinciple(principleData);
  }, [principleData]);

  return (
    <div className="pb-4">
      <DeleteModal
        show={deleteModalConfig.show}
        title={deleteModalConfig.title}
        message={deleteModalConfig.message}
        itemId={deleteModalConfig.itemId}
        itemName={deleteModalConfig.itemName}
        onHide={() => {
          setDeleteModalConfig({ ...deleteModalConfig, show: false });
        }}
        onDelete={handleDeleteConfirmed}
      />
      <PrincipleModal
        principle={principle || null}
        show={showUpdate}
        onHide={() => {
          setShowUpdate(false);
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Principle Details
            {principle && (
              <p className="lead cat-view-lead">
                Principle id:{" "}
                <strong className="badge bg-secondary">{principle.id}</strong>
              </p>
            )}
          </h2>
        </Col>
        <Col md="auto">
          {principleData && (
            <Button
              variant="danger"
              onClick={() => {
                setDeleteModalConfig({
                  ...deleteModalConfig,
                  show: true,
                  itemId: principleData.id,
                  itemName: `${principleData.label} - ${principleData.pri}`,
                });
              }}
            >
              <FaTrash className="me-2" />
              Delete Principle
            </Button>
          )}
        </Col>
      </div>
      <Row className="mt-4 border-bottom pb-4">
        <Col md="auto">
          <div className="p-3 text-center">
            <FaFile size={"4rem"} className="text-secondary" />
          </div>
          <Button
            onClick={() => {
              setShowUpdate(true);
            }}
            className="btn-light border-black"
          >
            Update Details
          </Button>
        </Col>
        <Col>
          <div>
            <strong>Pri:</strong> {principle?.pri}
          </div>
          <div>
            <strong>Label:</strong> {principle?.label}
          </div>
          <div>
            <div>
              <strong>Description:</strong>
            </div>
            <div>
              <small>{principle?.description}</small>
            </div>
          </div>
        </Col>
      </Row>
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate("/principles");
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
