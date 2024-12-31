import { AuthContext } from "@/auth";
import { AlertInfo, MetricTest } from "@/types";
import { useState, useContext, useEffect, useRef } from "react";
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
import { MotivationTestModal } from "./components/MotivationTestModal";

export default function MotivationMetricTests() {
  const navigate = useNavigate();
  const params = useParams();

  const { keycloak, registered } = useContext(AuthContext)!;
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [availableTests, setAvailableTests] = useState<RegistryTestHeader[]>(
    [],
  );
  const [selectedTests, setSelectedTests] = useState<RegistryTestHeader[]>([]);

  const alert = useRef<AlertInfo>({
    message: "",
  });

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
            message: "Error during assigning Tests to Metric",
          };
          throw err;
        })
        .then(() => {
          alert.current = {
            message: "Test Assignment to Metric succeeded!",
          };
          navigate(`/admin/motivations/${params.mtvId}#metrics`);
        });
      toast.promise(promise, {
        loading: "Assinging tests to metric...",
        success: () => `${alert.current.message}`,
        error: () => `${alert.current.message}`,
      });
    }
  }

  return (
    <div className="pb-4">
      <MotivationTestModal
        show={showCreateTest}
        onHide={() => {
          setShowCreateTest(false);
        }}
      />
      <Row className="cat-view-heading-block row border-bottom">
        <Col>
          <h2 className="text-muted cat-view-heading ">
            Assign tests to metric
            {params.mtvId && params.actId && (
              <p className="lead cat-view-lead">
                For Motivation:
                <strong className="badge bg-light text-secondary mx-2">
                  {params.mtvId}
                </strong>
                and Metric:
                <strong className="badge bg-light text-secondary ms-2">
                  {params.mtrId}
                </strong>
                <br />
                <span className="text-sm">
                  Each metric includes one or more tests
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
              <strong className="p-1">Available Tests</strong>
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
                <FaPlus /> Create New Test
              </Button>
            </div>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaPlusCircle className="me-2" /> Click an item below to assign it
              to this Metric...
            </small>
          </div>
          <div className="cat-vh-60 overflow-auto">
            {availableTests?.map((item) => (
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
            <strong className="p-1">Tests assigned to this metric</strong>
            <span className="badge bg-primary rounded-pill fs-6">
              {selectedTests.length}
            </span>
          </div>
          <div className="alert alert-primary p-2 mt-1">
            <small>
              <FaMinusCircle className="me-2" /> Click an item below to remove
              it from this metric...
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
                        overlay={<Tooltip>Delete Test</Tooltip>}
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
          Back
        </Link>
        <Button
          variant="success"
          onClick={() => {
            handleUpdate();
          }}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
