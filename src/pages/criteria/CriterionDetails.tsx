import { AuthContext } from "@/auth";
import { useState, useContext, useEffect, useRef } from "react";
import { Button, Col, Row } from "react-bootstrap";

import { FaFile, FaTrash } from "react-icons/fa";

import { useParams, useNavigate } from "react-router-dom";
import { CriterionModal } from "./components/CriterionModal";
import { AlertInfo, Criterion } from "@/types";
import { DeleteModal } from "@/components/DeleteModal";
import toast from "react-hot-toast";
import { useDeleteCriterion, useGetCriterion } from "@/api/services/criteria";

interface DeleteModalConfig {
  show: boolean;
  title: string;
  message: string;
  itemId: string;
  itemName: string;
}

export default function CriterionDetails() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: "Delete Criterion",
      message: "Are you sure you want to delete the following criterion?",
      itemId: "",
      itemName: "",
    },
  );

  const [criterion, setCriterion] = useState<Criterion>();
  const [showUpdate, setShowUpdate] = useState(false);
  const { data: criterionData } = useGetCriterion({
    id: params.id!,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const mutationDelete = useDeleteCriterion(keycloak?.token || "");

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const handleDeleteConfirmed = () => {
    if (deleteModalConfig.itemId) {
      const promise = mutationDelete
        .mutateAsync(deleteModalConfig.itemId)
        .catch((err) => {
          alert.current = {
            message: "Error during criterion deletion!",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Criterion succesfully deleted.",
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
    setCriterion(criterionData);
  }, [criterionData]);

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
        handleDelete={handleDeleteConfirmed}
      />
      <CriterionModal
        criterion={criterion || null}
        show={showUpdate}
        onHide={() => {
          setShowUpdate(false);
        }}
      />
      <div className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Criterion Details
            {criterion && (
              <p className="lead cat-view-lead">
                Criterion id:{" "}
                <strong className="badge bg-secondary">{criterion.id}</strong>
              </p>
            )}
          </h2>
        </Col>
        <Col md="auto">
          {criterionData && (
            <Button
              variant="danger"
              onClick={() => {
                setDeleteModalConfig({
                  ...deleteModalConfig,
                  show: true,
                  itemId: criterionData.id,
                  itemName: `${criterionData.label} - ${criterionData.cri}`,
                });
              }}
            >
              <FaTrash className="me-2" />
              Delete Criterion
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
            <strong>Cri:</strong> {criterion?.cri}
          </div>
          <div>
            <strong>Label:</strong> {criterion?.label}
          </div>
          <div>
            <div>
              <strong>Description:</strong>
            </div>
            <div>
              <small>{criterion?.description}</small>
            </div>
          </div>
        </Col>
      </Row>
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate("/criteria");
          }}
        >
          Back
        </Button>
      </div>
    </div>
  );
}
