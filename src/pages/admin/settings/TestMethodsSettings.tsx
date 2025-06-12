import React, { useContext, useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  useGetAllTestMethods,
  useUpdateTestMethodStatus,
} from "@/api/services/registry";
import { AuthContext } from "@/auth";
import { RegistryResource } from "@/types";
import toast from "react-hot-toast";
import { FaLock } from "react-icons/fa";

interface TestMethodResource extends RegistryResource {
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

const TestMethodsSettings: React.FC = () => {
  const { keycloak, registered } = useContext(AuthContext)!;
  const [testMethods, setTestMethods] = useState<TestMethodResource[]>([]);
  const [enabledMethods, setEnabledMethods] = useState<{
    [key: string]: boolean;
  }>({});
  const [loading, setLoading] = useState(true);

  const {
    data: testMethodsData,
    fetchNextPage: tmFetchNextPage,
    hasNextPage: tmHasNextPage,
    isLoading,
    error,
  } = useGetAllTestMethods({
    size: 20,
    token: keycloak?.token || "",
    isRegistered: registered,
    search: "",
  });

  const updateTestMethodStatus = useUpdateTestMethodStatus(
    keycloak?.token || "",
  );

  useEffect(() => {
    if (testMethodsData?.pages) {
      let allTestMethods: TestMethodResource[] = [];

      testMethodsData.pages.forEach((page) => {
        allTestMethods = [...allTestMethods, ...page.content];
      });

      setTestMethods(allTestMethods);

      const initialEnabledState: { [key: string]: boolean } = {};
      allTestMethods.forEach((method) => {
        initialEnabledState[method.id] = method?.enabled ?? true;
      });
      setEnabledMethods(initialEnabledState);
      setLoading(false);

      if (tmHasNextPage) {
        tmFetchNextPage();
      }
    }
  }, [testMethodsData, tmHasNextPage, tmFetchNextPage]);

  const handleToggleMethod = async (methodId: string) => {
    const newEnabledState = !enabledMethods[methodId];

    try {
      setEnabledMethods((prev) => ({
        ...prev,
        [methodId]: newEnabledState,
      }));

      await updateTestMethodStatus.mutateAsync({
        id: methodId,
        enabled: newEnabledState,
      });

      toast.success(
        `Test method ${newEnabledState ? "enabled" : "disabled"} successfully`,
      );
    } catch (error) {
      setEnabledMethods((prev) => ({
        ...prev,
        [methodId]: !newEnabledState,
      }));

      toast.error("Failed to update test method status. Please try again.");
      console.error("Error updating test method status:", error);
    }
  };

  if (isLoading || loading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading test methods...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          Error loading test methods. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="cat-view-heading-block">
      <div className="col mb-4">
        <h2 className="text-muted cat-view-heading">
          Test Methods Settings
          <p className="lead cat-view-lead">
            Configure which test methods users can selects
          </p>
        </h2>
      </div>

      <Row className="d-flex flex-column-reverse flex-lg-row justify-content-lg-between gy-5">
        <Col lg={7}>
          <div className="mb-4">
            {testMethods.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No test methods found.</p>
              </div>
            ) : (
              <div>
                {testMethods.map((method) => (
                  <>
                    <div
                      key={method.id}
                      className="test-method-settings-item d-flex justify-content-between gap-5 my-1"
                    >
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="mb-0">{method.label}</h6>
                          {method?.used_by_published_motivations && (
                            <FaLock size="18px" />
                          )}
                        </div>
                        <span className="text-muted small">
                          {method.description || "No description available"}
                        </span>
                      </div>
                      <div>
                        <Form.Check
                          type="switch"
                          id={`switch-${method.id}`}
                          checked={enabledMethods[method.id] || false}
                          onChange={() => handleToggleMethod(method.id)}
                          className="test-method-switch"
                        />
                      </div>
                    </div>
                    <div
                      style={{
                        background: "#e9ecef",
                        width: "98%",
                        height: "1px",
                        margin: "0.5rem auto",
                      }}
                    />
                  </>
                ))}
              </div>
            )}
          </div>
        </Col>
        <Col lg={4}>
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-light border-0">
              <h6 className="mb-0 fw-bold text-dark">Information</h6>
            </Card.Header>
            <Card.Body>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Total Methods:</span>
                <span className="small fw-bold">{testMethods.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Enabled:</span>
                <span className="small fw-bold text-success">
                  {Object.values(enabledMethods).filter(Boolean).length}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="small text-muted">Disabled:</span>
                <span className="small fw-bold text-danger">
                  {Object.values(enabledMethods).filter((v) => !v).length}
                </span>
              </div>
              <hr className="my-3" />
              <p className="small text-muted mb-2">
                Disabled test methods will not be available when creating new
                tests or assessments.
              </p>
              <div className="d-flex gap-2">
                <FaLock size="24px" className="mt-1" />
                <p className="small text-muted mb-0">
                  Locked test methods are used in published motivations and
                  cannot be disabled.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default TestMethodsSettings;
