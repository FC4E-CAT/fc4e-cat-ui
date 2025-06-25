import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { FaLock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ROUTES from "../routes";

export interface SettingsItem {
  id: string;
  label: string;
  description?: string;
  enabled?: boolean;
  used_by_published_motivations?: boolean;
}

interface SettingsLayoutProps {
  title: string;
  description: string;
  items: SettingsItem[];
  enabledItems: { [key: string]: boolean };
  isLoading: boolean;
  error: unknown;
  onToggleItem: (itemId: string) => void;
  itemTypeName: string;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({
  title,
  description,
  items,
  enabledItems,
  isLoading,
  error,
  onToggleItem,
  itemTypeName,
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  if (isLoading) {
    return (
      <Container fluid className="py-4">
        <div className="text-center">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading {itemTypeName}...</p>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container fluid className="py-4">
        <Alert variant="danger">
          Error loading {itemTypeName}. Please try again later.
        </Alert>
      </Container>
    );
  }

  return (
    <div className="cat-view-heading-block">
      <div className="col mb-4">
        <h2 className="text-muted cat-view-heading">
          {title}
          <p className="lead cat-view-lead">{description}</p>
        </h2>
      </div>

      <Row className="d-flex flex-column-reverse flex-lg-row justify-content-lg-between gy-5">
        <Col lg={7}>
          <div className="mb-4">
            {items.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-muted">No {itemTypeName} found.</p>
              </div>
            ) : (
              <div>
                {items.map((item) => (
                  <React.Fragment key={item.id}>
                    <div className="test-method-settings-item d-flex justify-content-between gap-5 my-1">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h6 className="mb-0">{item.label}</h6>
                          {item.used_by_published_motivations && (
                            <FaLock size="18px" className="text-warning" />
                          )}
                        </div>
                        <span className="text-muted small">
                          {item.description || "No description available"}
                        </span>
                      </div>
                      <div>
                        <Form.Check
                          type="switch"
                          id={`switch-${item.id}`}
                          checked={enabledItems[item.id] || false}
                          onChange={() => onToggleItem(item.id)}
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
                  </React.Fragment>
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
                <span className="small text-muted">Total Items:</span>
                <span className="small fw-bold">{items.length}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="small text-muted">Enabled:</span>
                <span className="small fw-bold text-success">
                  {Object.values(enabledItems).filter(Boolean)?.length}
                </span>
              </div>
              <div className="d-flex justify-content-between mb-3">
                <span className="small text-muted">Disabled:</span>
                <span className="small fw-bold text-danger">
                  {Object.values(enabledItems).filter((v) => !v)?.length}
                </span>
              </div>
              <hr className="my-3" />
              <p className="small text-muted mb-2">
                Disabled {itemTypeName} will not be available when creating new
                tests or assessments.
              </p>
              <div className="d-flex gap-2">
                <FaLock
                  size="18px"
                  className="mt-1 text-warning"
                  style={{ flexShrink: 0 }}
                />
                <p className="small text-muted mb-0">
                  Locked {itemTypeName} are used in published motivations and
                  cannot be disabled.
                </p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Button
        className="mt-4"
        variant="secondary"
        onClick={() => {
          navigate(ROUTES.ADMIN.SETTINGS.ROOT);
        }}
      >
        {t("buttons.back")}
      </Button>
    </div>
  );
};

export default SettingsLayout;
