import {
  useGetAllImperatives,
  useGetMotivationActorCriteria,
  useGetMotivationCriteria,
  useUpdateMotivationActorCriteria,
} from "@/api";

import { AuthContext } from "@/auth";
import { AlertInfo, Criterion, Imperative } from "@/types";
import { useState, useContext, useEffect, useRef } from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import toast from "react-hot-toast";
import { useTranslation } from "react-i18next";
import { FaAward, FaInfo, FaMinusCircle, FaPlusCircle } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { useParams, useNavigate } from "react-router-dom";

export default function MotivationActorCriteria() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;

  const [imperatives, setImperatives] = useState<Map<string, Imperative>>(
    new Map(),
  );
  const [availableCriteria, setAvailableCriteria] = useState<Criterion[]>([]);
  const [selectedCriteria, setSelectedCriteria] = useState<Criterion[]>([]);

  const mutationUpdate = useUpdateMotivationActorCriteria(
    keycloak?.token || "",
    params.mtvId || "",
    params.actId || "",
  );

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const tooltipDeletePrinciple = (
    <Tooltip id="tip-restore">
      {t("page_motivations.remove_principle_actor")}
    </Tooltip>
  );

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

  const {
    data: criData,
    fetchNextPage: criFetchNextPage,
    hasNextPage: criHasNextPage,
  } = useGetMotivationCriteria(params.mtvId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  const {
    data: selCriData,
    fetchNextPage: selCriFetchNextPage,
    hasNextPage: selCriHasNextPage,
  } = useGetMotivationActorCriteria(params.mtvId || "", params.actId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all imperatives in one dictionary
    const tmpImp: Map<string, Imperative> = new Map();
    // iterate over backend pages and gather all items in the imp dictionary, keyed by imp id
    if (impData?.pages) {
      impData.pages.map((page) => {
        page.content.forEach((item) => {
          tmpImp.set(item.id, item);
        });
      });
      if (impHasNextPage) {
        impFetchNextPage();
      }
    }
    setImperatives(tmpImp);
  }, [impData, impHasNextPage, impFetchNextPage]);

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

  function handleUpdateImperative(
    index: number,
    criImp: Imperative | undefined,
  ) {
    if (criImp === undefined) return;
    setSelectedCriteria((prevSelCriteria) =>
      prevSelCriteria.map((selCri, selCriIndx) =>
        selCriIndx === index
          ? {
              ...selCri,
              imperative: criImp,
            }
          : selCri,
      ),
    );
  }

  function handleUpdate() {
    if (selectedCriteria.length > 0) {
      const criImp = selectedCriteria.map((item) => ({
        criterion_id: item.id,
        imperative_id: item.imperative.id,
      }));
      const promise = mutationUpdate
        .mutateAsync(criImp)
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_assign_cri_act_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_assign_cri_act_success"),
          };
          navigate(-1);
        });
      toast.promise(promise, {
        loading: t("page_motivations.toast_assign_cri_act_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  return (
    <div className="pb-4">
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
              <li>{t("page_motivations.cri7")}</li>
              <li>{t("page_motivations.cri5")}</li>
              <li>{t("page_motivations.cri8")}</li>
            </ol>
          </span>
        </Col>
      </Row>
      <Row className="mt-4  pb-4">
        <Col className="px-4">
          <div>
            <strong className="p-1">
              {t("page_motivations.available_criteria_motivation")}{" "}
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {availableCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" />
              {t("page_motivations.info_add_to_asmt_type")}
            </small>
          </div>
          <div className="cat-vh-60 overflow-auto">
            {availableCriteria?.map((item) => (
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
                  {item.principles.map((principle) => (
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
              {t("page_motivations.criteria_in_asmt_type")}
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {selectedCriteria.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaMinusCircle className="me-2" />
              {t("page_motivations.cinfo_remove_from_asmt_type")}
            </small>
          </div>
          <div>
            <div className="cat-vh-60 overflow-auto">
              {selectedCriteria?.map((item, index) => (
                <div key={item.cri} className="mb-4 p-2 cat-select-item">
                  <div className="d-inline-flex align-items-center">
                    <div>
                      <FaAward className="me-2" />
                      <strong>
                        {item.cri} - {item.label}
                      </strong>
                      <select
                        className="ms-2 badge badge-sm bg-light text-success border border-success"
                        value={item.imperative.id}
                        onChange={(e) => {
                          handleUpdateImperative(
                            index,
                            imperatives.get(e.target.value),
                          );
                        }}
                      >
                        {Array.from(imperatives.values()).map((impItem) => (
                          <option key={impItem.id} value={impItem.id}>
                            {impItem.label}
                          </option>
                        ))}
                      </select>
                      <OverlayTrigger
                        placement="top"
                        overlay={tooltipDeletePrinciple}
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-4"
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
                    {item.principles.map((principle) => (
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
            navigate(-1);
          }}
        >
          {t("buttons.back")}
        </Button>
        <Button
          variant="success"
          onClick={() => {
            handleUpdate();
          }}
        >
          {t("buttons.save")}
        </Button>
      </div>
    </div>
  );
}
