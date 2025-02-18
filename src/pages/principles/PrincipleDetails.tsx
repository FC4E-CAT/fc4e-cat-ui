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
import { MotivationRefList } from "@/components/MotivationRefList";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;

  // Delete Modal
  const [deleteModalConfig, setDeleteModalConfig] = useState<DeleteModalConfig>(
    {
      show: false,
      title: t("page_principles.modal_delete_title"),
      message: t("page_principles.modal_delete_message"),
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
            message: t("page_principles.toast_delete_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_principles.toast_delete_success"),
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
        loading: t("page_principles.toast_delete_progress"),
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
        handleDelete={handleDeleteConfirmed}
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
            {t("page_principles.details_title")}
            {principle && (
              <p className="lead cat-view-lead">
                {t("page_principles.principle_id")}:{" "}
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
              {t("buttons.delete")}
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
            {t("buttons.update_details")}
          </Button>
        </Col>
        <Col>
          <div>
            <strong>{t("fields.pri")}:</strong> {principle?.pri}
          </div>
          <div>
            <strong>{t("fields.label")}:</strong> {principle?.label}
          </div>
          <div>
            <div>
              <strong>{t("fields.description")}:</strong>
            </div>
            <div>
              <small>{principle?.description}</small>
            </div>
          </div>
          <div>
            <div>
              <strong>{t("fields.used_in_motivations")}:</strong>
            </div>
            <div className="ms-2">
              <MotivationRefList
                motivations={principle?.used_by_motivations || []}
              />
            </div>
          </div>
        </Col>
      </Row>
      <div className="mt-4">
        <Button
          variant="secondary"
          onClick={() => {
            navigate("/admin/principles");
          }}
        >
          {"buttons.back"}
        </Button>
      </div>
    </div>
  );
}
