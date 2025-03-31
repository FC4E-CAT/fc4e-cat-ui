import { AuthContext } from "@/auth";
import { AlertInfo, Criterion, Principle } from "@/types";
import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import toast from "react-hot-toast";
import {
  FaAward,
  FaExclamationTriangle,
  FaInfo,
  FaMinusCircle,
  FaPlus,
  FaPlusCircle,
  FaTags,
} from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";
import MotivationPrinciplesModal from "./components/MotivationPrinciplesModal";

import { relMtvPrincpleCriterion } from "@/config";
import {
  useGetAllCriteria,
  useGetAllPrinciples,
  useGetMotivationCriteria,
  useUpdateMotivationPrinciplesCriteria,
} from "@/api";
import { CriterionModal } from "../criteria/components/CriterionModal";
import { useTranslation } from "react-i18next";
import { SearchBox } from "@/components/SearchBox";

export default function MotivationCriteriaPrinciples() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
  const [availablePrinciples, setAvailablePrinciples] = useState<Principle[]>(
    [],
  );
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);
  const [targetCriterion, setTargetCriterion] = useState<Criterion | null>(
    null,
  );
  const [showManagePrinciples, setShowManagePrinciples] = useState(false);

  const [showCreate, setShowCreate] = useState(false);

  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const {
    data: priData,
    fetchNextPage: priFetchNextPage,
    hasNextPage: priHasNextPage,
  } = useGetAllPrinciples({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all available principles in one array
    let tmpPri: Principle[] = [];

    // iterate over backend pages and gather all items in the pri array
    if (priData?.pages) {
      priData.pages.map((page) => {
        tmpPri = [...tmpPri, ...page.content];
      });
      if (priHasNextPage) {
        priFetchNextPage();
      }
    }
    setAvailablePrinciples(tmpPri);
  }, [priData, priHasNextPage, priFetchNextPage]);

  const mutationUpdate = useUpdateMotivationPrinciplesCriteria(
    keycloak?.token || "",
    params.mtvId || "",
  );

  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetAllCriteria({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  const {
    data: selCriData,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationCriteria(params.mtvId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all motivation actor criteria in one array
    let tmpSelCri: Criterion[] = [];

    // iterate over backend pages and gather all items in the mtv array
    if (selCriData?.pages) {
      selCriData.pages.map((page) => {
        tmpSelCri = [...tmpSelCri, ...page.content];
      });
      if (selCriHasNextPage) {
        selCriFetchNextPage();
      }
    }
    setSelectedCriteria(tmpSelCri);
  }, [selCriData, selCriHasNextPage, selCriFetchNextPage]);

  useEffect(() => {
    // gather all motivation criteria in one array
    let tmpCri: Criterion[] = [];

    const selCri =
      selectedCriteria.map((item) => {
        return item.cri;
      }) || [];

    // iterate over backend pages and gather all items in the mtv array
    if (criData?.pages) {
      criData.pages.map((page) => {
        tmpCri = [...tmpCri, ...page.content];
      });
      if (criHasNextPage) {
        criFetchNextPage();
      }
    }
    setAvailableCriteria(tmpCri.filter((item) => !selCri.includes(item.cri)));
  }, [criData, criHasNextPage, criFetchNextPage, selectedCriteria]);

  function handleUpdate() {
    if (selectedCriteria) {
      const priCri = selectedCriteria.flatMap((cri) =>
        cri.principles.map((pri) => ({
          criterion_id: cri.id,
          principle_id: pri.id,
          annotation_url: "",
          annotation_text: "",
          relation: relMtvPrincpleCriterion,
        })),
      );
      const promise = mutationUpdate
        .mutateAsync(priCri)
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_manage_cri_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_manage_cri_success"),
          };
          navigate(`/admin/motivations/${params.mtvId}`);
        });
      toast.promise(promise, {
        loading: t("page_motivations.toast_manage_cri_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  const handleUpdatePrinciples = (
    criterionId: string,
    principles: Principle[],
  ) => {
    setSelectedCriteria((prevSelCriteria) =>
      prevSelCriteria.map((criterion) =>
        criterion.id === criterionId
          ? { ...criterion, principles: principles }
          : criterion,
      ),
    );
  };

  const allPrinciplesSet = selectedCriteria.every(
    (item) => item.principles && item.principles.length > 0,
  );

  const filteredCriteria = useMemo(() => {
    return availableCriteria.filter((item) => {
      const query = searchInput.toLowerCase();
      return (
        item.cri.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [searchInput, availableCriteria]);

  return (
    <div className="pb-4">
      <CriterionModal
        id=""
        show={showCreate}
        onHide={() => {
          setShowCreate(false);
        }}
      />
      <MotivationPrinciplesModal
        principles={availablePrinciples}
        criterion={targetCriterion}
        show={showManagePrinciples}
        onHide={() => {
          setShowManagePrinciples(false);
          setTargetCriterion(null);
        }}
        handleUpdatePrinciples={handleUpdatePrinciples}
      />
      <Row className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            {t("page_motivations.manage_criteria")}
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                {t("page_motivations.for_motivation")}
                <strong className="badge bg-light text-secondary mx-2">
                  {params.mtvId}
                </strong>
                {t("page_motivations.and_actor")}
                <strong className="badge bg-light text-secondary ms-2">
                  {params.actId}
                </strong>
                <br />
                <span className="text-sm">{t("page_motivations.cri1")}</span>
              </p>
            )}
          </h2>
        </Col>
      </Row>
      <Row className=" border-bottom pb-2 bg-light">
        <Col className="mt-2 px-2">
          <FaInfo className="text-warning float-start" size={40} />
          <span className="text-sm">
            {t("page_motivations.cri2")}{" "}
            <span className="">{params.actId}</span>
            <br />
            {t("page_motivations.cri3")}
          </span>
        </Col>
        <Col className="mt-2 px-2">
          <span className="text-sm">
            <ol>
              <li>{t("page_motivations.cri4")}</li>
              <li>{t("page_motivations.cri5")}</li>
              <li>{t("page_motivations.cri6")}</li>
            </ol>
          </span>
        </Col>
      </Row>
      <Row className="mt-4  pb-4">
        <Col className="px-4">
          <div className="d-flex justify-content-between">
            <div>
              <strong className="p-1">
                {t("page_motivations.available_criteria")}
              </strong>
              <span className="ms-1 badge bg-primary rounded-pill fs-6">
                {availableCriteria.length}
              </span>
            </div>
            <div>
              <Button
                size="sm"
                variant="warning"
                onClick={() => {
                  setShowCreate(true);
                }}
              >
                <FaPlus /> {t("page_motivations.create_new_criterion")}
              </Button>
            </div>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" />{" "}
              {t("page_motivations.info_add_to_motivation")}
            </small>
          </div>
          <div>
            <SearchBox
              searchInput={searchInput}
              handleChange={handleSearchChange}
              handleClear={handleSearchClear}
            />
          </div>
          <div className="cat-vh-60 overflow-auto">
            {filteredCriteria?.map((item) => (
              <div
                key={item.cri}
                className="mb-4 p-2 cat-select-item"
                onClick={() => {
                  setSelectedCriteria([...selectedCriteria, item]);
                }}
              >
                <div className="d-inline-flex align-items-center">
                  <FaAward className="me-2" />
                  <strong>
                    {item.cri} - {item.label}
                  </strong>
                  <span className="ms-2 badge badge-sm bg-light text-success border border-success">
                    {item.imperative.label}
                  </span>
                </div>

                <div className="text-muted text-sm">{item.description}</div>
                <div>
                  {item.principles &&
                    item.principles.map((principle) => (
                      <span
                        key={principle.id}
                        className="badge bg-light text-dark me-1 text-ms border"
                      >
                        {principle.pri} - {principle.label}
                      </span>
                    ))}
                </div>
              </div>
            ))}
          </div>
        </Col>
        <Col>
          <div>
            <strong className="p-1">
              {t("page_motivations.criteria_in_motivation")}
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {selectedCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaMinusCircle className="me-2" />{" "}
              {t("page_motivations.info_remove_from_motivation")}
            </small>
          </div>
          <div>
            <div className="cat-vh-60 overflow-auto">
              {selectedCriteria?.map((item) => (
                <div
                  key={item.cri}
                  className={`mb-4 p-2 cat-select-item ${!item.principles || item.principles.length === 0 ? "border rounded border-danger" : null}`}
                >
                  {(!item.principles || item.principles.length === 0) && (
                    <div className="text-danger mb-1">
                      <small>
                        <FaExclamationTriangle />{" "}
                        {t("page_motivations.no_principles")}
                      </small>
                    </div>
                  )}
                  <div className="d-inline-flex align-items-center">
                    <div>
                      <FaAward className="me-2" />
                      <strong>
                        {item.cri} - {item.label}
                      </strong>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {t("page_motivations.tip_manage_principles")}
                          </Tooltip>
                        }
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-4"
                          onClick={() => {
                            setTargetCriterion(item);
                            setShowManagePrinciples(true);
                          }}
                        >
                          <FaTags className="text-dark" />
                        </Button>
                      </OverlayTrigger>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip>
                            {t("page_motivations.tip_remove_criterion")}
                          </Tooltip>
                        }
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-2"
                          onClick={() => {
                            setSelectedCriteria(
                              selectedCriteria.filter(
                                (selItem) => selItem.cri != item.cri,
                              ),
                            );
                          }}
                        >
                          <FaTrashCan className="text-danger" />
                        </Button>
                      </OverlayTrigger>
                    </div>
                  </div>

                  <div className="text-muted text-sm">{item.description}</div>
                  <div>
                    {item.principles &&
                      item.principles.map((principle) => (
                        <span
                          key={principle.pri}
                          className="badge bg-light text-dark me-1 text-ms border"
                        >
                          {principle.pri} - {principle.label}
                        </span>
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <div className="d-flex justify-content-between">
        <Button
          variant="secondary"
          onClick={() => {
            navigate(`/admin/motivations/${params.mtvId}`);
          }}
        >
          {t("buttons.back")}
        </Button>
        <Button
          variant="success"
          onClick={() => {
            handleUpdate();
          }}
          disabled={!allPrinciplesSet}
        >
          {t("buttons.save")}
        </Button>
      </div>
    </div>
  );
}
