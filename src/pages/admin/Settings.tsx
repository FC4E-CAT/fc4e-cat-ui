import React from "react";
import { Link } from "react-router-dom";
import { FaBorderNone, FaCog } from "react-icons/fa";
import { Row, Col, Card } from "react-bootstrap";

const Settings: React.FC = () => {
  const settingsOptions = [
    {
      section: "TESTS",
      items: [
        {
          title: "Test Methods",
          description: "Configure test method types and validation rules",
          icon: <FaCog size={24} className="text-muted me-3" />,
          path: "/admin/settings/test-methods",
        },
      ],
    },
    {
      section: "METRICS",
      items: [
        {
          title: "Metric Definitions",
          description: "Define and manage metric calculation rules",
          icon: <FaBorderNone size={24} className="text-muted me-3" />,
          path: "/admin/settings/metric-definitions",
        },
      ],
    },
  ];

  return (
    <>
      <div className="cat-view-heading-block row">
        <div className="col">
          <h2 className="text-muted cat-view-heading">
            Settings
            <p className="lead cat-view-lead">
              Configure system settings and manage application components
            </p>
          </h2>
        </div>
      </div>

      <Row className="mt-4 ps-2">
        <Col lg={8}>
          {settingsOptions.map((section, sectionIndex) => (
            <div key={sectionIndex} className="mb-5">
              <h6 className="settings-section-header">{section.section}</h6>
              {section.items.map((item, itemIndex) => (
                <Link
                  key={itemIndex}
                  to={item.path}
                  className="text-decoration-none"
                  style={{ color: "inherit" }}
                >
                  <Card className="mb-3 settings-section-card">
                    <Card.Body>
                      <div className="d-flex align-items-center mb-2">
                        {item.icon}
                        <h6 className="mb-0 fw-normal text-dark">
                          {item.title}
                        </h6>
                      </div>
                      <span>{item.description}</span>
                    </Card.Body>
                  </Card>
                </Link>
              ))}
            </div>
          ))}
        </Col>
      </Row>
    </>
  );
};

export default Settings;
