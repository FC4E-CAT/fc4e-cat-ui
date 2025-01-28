import { AuthContext } from "@/auth";
import { AlertInfo, MetricTest } from "@/types";
import { useState, useContext, useEffect, useRef, useMemo } from "react";
import { Button, Col, Row, OverlayTrigger, Tooltip } from "react-bootstrap";
import toast from "react-hot-toast";
import { FaAward, FaMinusCircle, FaPlus, FaPlusCircle } from "react-icons/fa";
import { FaTrashCan } from "react-icons/fa6";
import { useParams, useNavigate, Link } from "react-router-dom";

import { relMtvMetricTest } from "@/config";
import {
  useGetMotivationMetricTests,
  useUpdateMotivationMetricTests,
} from "@/api";
import { RegistryTest, RegistryTestHeader } from "@/types/tests";
import { useGetAllTests } from "@/api/services/registry";
import { TestModal } from "@/pages/tests/components/TestModal";
import { useTranslation } from "react-i18next";
import { SearchBox } from "@/components/SearchBox";

export default function MotivationMetricTests() {
  const navigate = useNavigate();
  const params = useParams();
  const { t } = useTranslation();
  const { keycloak, registered } = useContext(AuthContext)!;
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [availableTests, setAvailableTests] = useState<RegistryTestHeader[]>(
    [],
  );
  const [selectedTests, setSelectedTests] = useState<RegistryTestHeader[]>([]);

  const alert = useRef<AlertInfo>({
    message: "",
  });

  const [searchInput, setSearchInput] = useState("");

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };
  const handleSearchClear = () => {
    setSearchInput("");
  };

  const {
    data: testData,
    fetchNextPage: testFetchNextPage,
    hasNextPage: testHasNextPage,
  } = useGetAllTests({
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all available tests in one array
    let tmpTests: RegistryTest[] = [];

    const selTests =
      selectedTests.map((item) => {
        return item.id;
      }) || [];

    // iterate over backend pages and gather all items in the test array
    if (testData?.pages) {
      testData.pages.map((page) => {
        tmpTests = [...tmpTests, ...page.content];
      });
      if (testHasNextPage) {
        testFetchNextPage();
      }
    }
    setAvailableTests(
      tmpTests
        .map((item) => {
          return {
            id: item.test.id,
            tes: item.test.tes,
            label: item.test.label,
            description: item.test.description,
          };
        })
        .filter((item) => !selTests.includes(item.id)),
    );
  }, [testData, testHasNextPage, testFetchNextPage, selectedTests]);

  const mutationUpdate = useUpdateMotivationMetricTests(
    keycloak?.token || "",
    params.mtvId || "",
    params.mtrId || "",
  );

  const {
    data: selTestData,
    fetchNextPage: selTestFetchNextPage,
    hasNextPage: selTestHasNextPage,
  } = useGetMotivationMetricTests(params.mtvId || "", params.mtrId || "", {
    size: 5,
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    // gather all motivation metric tests in one array
    let tmpSelTests: MetricTest[] = [];

    // iterate over backend pages and gather all items in the mtv array
    if (selTestData?.pages) {
      selTestData.pages.map((page) => {
        if (page.metric) tmpSelTests = [...tmpSelTests, ...page.metric.tests];
      });
      if (selTestHasNextPage) {
        selTestFetchNextPage();
      }
    }
    setSelectedTests(
      tmpSelTests.map((item) => {
        return {
          id: item.db_id,
          tes: item.id,
          label: item.name,
          description: item.description,
        };
      }),
    );
  }, [selTestData, selTestHasNextPage, selTestFetchNextPage]);

  function handleUpdate() {
    if (selectedTests) {
      const metricTests = selectedTests.map((test) => {
        return { test_id: test.id, relation: relMtvMetricTest };
      });
      const promise = mutationUpdate
        .mutateAsync(metricTests)
        .catch((err) => {
          alert.current = {
            message: t("page_motivations.toast_assign_metric_fail"),
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: t("page_motivations.toast_assign_metric_success"),
          };
          navigate(`/admin/motivations/${params.mtvId}#metrics`);
        });
      toast.promise(promise, {
        loading: t("page_motivations.toast_assign_metric_progress"),
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  const filteredTests = useMemo(() => {
    return availableTests.filter((item) => {
      const query = searchInput.toLowerCase();
      return (
        item.tes.toLowerCase().includes(query) ||
        item.label.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    });
  }, [searchInput, availableTests]);

  return (
    <div className="pb-4">
      <TestModal
        show={showCreateTest}
        onHide={() => {
          setShowCreateTest(false);
        }}
      />
      <Row className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            {t("page_motivations.assign_tests")}
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                {t("page_motivations.for_motivation")}
                <strong className="badge bg-light text-secondary mx-2">
                  {params.mtvId}
                </strong>
                {t("page_motivations.and_metric")}
                <strong className="badge bg-light text-secondary ms-2">
                  {params.mtrId}
                </strong>
                <br />
                <span className="text-sm">
                  {t("page_motivations.metric_includes")}
                </span>
              </p>
            )}
          </h2>
        </Col>
      </Row>
      <Row className="mt-4  pb-4">
        <Col className="px-4">
          <div className="d-flex justify-content-between">
            <div>
              <strong className="p-1">
                {t("page_motivations.available_tests")}
              </strong>
              <span className="ms-1 badge bg-primary rounded-pill fs-6">
                {availableTests.length}
              </span>
            </div>
            <div>
              <Button
                size="sm"
                variant="warning"
                onClick={() => {
                  setShowCreateTest(true);
                }}
              >
                <FaPlus /> {t("page_tests.create_new_test")}
              </Button>
            </div>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" />{" "}
              {t("page_motivations.info_assign_to_metric")}
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
            {filteredTests?.map((item) => (
              <div
                key={item.id}
                className="mb-4 p-2 cat-select-item"
                onClick={() => {
                  setSelectedTests([...selectedTests, item]);
                }}
              >
                <div className="d-inline-flex align-items-center">
                  <FaAward className="me-2" />
                  <strong>
                    {item.tes} - {item.label}
                  </strong>
                </div>

                <div className="text-muted text-sm">{item.description}</div>
              </div>
            ))}
          </div>
        </Col>
        <Col>
          <div>
            <strong className="p-1">
              {t("page_motivations.tests_assigned")}
            </strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {selectedTests.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaMinusCircle className="me-2" />{" "}
              {t("page_motivations.info_remove_from_metric")}
            </small>
          </div>
          <div>
            <div className="cat-vh-60 overflow-auto">
              {selectedTests?.map((item) => (
                <div key={item.id} className={"mb-4 p-2 cat-select-item"}>
                  <div className="d-inline-flex align-items-center">
                    <div>
                      <FaAward className="me-2" />
                      <strong>
                        {item.tes} - {item.label}
                      </strong>
                      <OverlayTrigger
                        placement="top"
                        overlay={<Tooltip>{t("tip_remove_test")}</Tooltip>}
                      >
                        <Button
                          size="sm"
                          variant="light"
                          className="ms-2"
                          onClick={() => {
                            setSelectedTests(
                              selectedTests.filter(
                                (selItem) => selItem.id != item.id,
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
                </div>
              ))}
            </div>
          </div>
        </Col>
      </Row>
      <div className="d-flex justify-content-between">
        <Link
          className="btn btn-secondary"
          to={`/admin/motivations/${params.mtvId}#metrics`}
        >
          {t("buttons.back")}
        </Link>
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
