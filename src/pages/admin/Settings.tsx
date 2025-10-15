import React from "react";
import { Link } from "react-router-dom";
import { FaCog, FaRuler, FaChartLine, FaCode, FaUserCog } from "react-icons/fa";
import { Row, Col, Card } from "react-bootstrap";
import ROUTES from "@/routes";

const Settings: React.FC = () => {
  const settingsOptions = [
    {
      section: "TESTS",
      items: [
        {
          title: "Test Methods",
          description: "Configure test method types and validation rules",
          icon: <FaCog size={24} className="text-muted me-3" />,
          path: ROUTES.ADMIN.SETTINGS.TEST_METHODS,
        },
      ],
    },
    {
      section: "METRICS",
      items: [
        {
          title: "Metric Types",
          description: "Configure which metric types are available for metrics",
          icon: <FaRuler size={24} className="text-muted me-3" />,
          path: ROUTES.ADMIN.SETTINGS.METRIC_TYPES,
        },
        {
          title: "Algorithms",
          description: "Configure which algorithms are available for metrics",
          icon: <FaCode size={24} className="text-muted me-3" />,
          path: ROUTES.ADMIN.SETTINGS.ALGORITHMS,
        },
        {
          title: "Benchmark Types",
          description:
            "Configure which benchmark types are available for metrics",
          icon: <FaChartLine size={24} className="text-muted me-3" />,
          path: ROUTES.ADMIN.SETTINGS.BENCHMARK_TYPES,
        },
      ],
    },
    {
      section: "SYSTEM",
      items: [
        {
          title: "Zenodo",
          description: "Enable or disable Zenodo integration features",
          icon: (
            <img
              className="me-3"
              src="/zenodo.svg"
              style={{ height: "1.5rem" }}
            />
          ),
          path: ROUTES.ADMIN.SETTINGS.ZENODO,
        },
        {
          title: "AAI Autocomplete Values",
          description: "Manage AAI autocomplete values and configurations",
          icon: <FaUserCog size={24} className="text-muted me-3" />,
          path: ROUTES.ADMIN.SETTINGS.AAI_AUTOCOMPLETE,
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

      <Row className="mt-3 ps-2">
        {settingsOptions.map((section, sectionIndex) => (
          <div key={sectionIndex} className="mb-4">
            <h6 className="settings-section-header">{section.section}</h6>
            <div className="d-flex flex-column flex-lg-row gap-lg-4 gap-1">
              {section.items.map((item, itemIndex) => (
                <Col key={itemIndex} lg={3} md={12}>
                  <Link className="text-decoration-none" to={item.path}>
                    <Card className="mb-2 settings-section-card">
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
                </Col>
              ))}
            </div>
          </div>
        ))}
      </Row>
    </>
  );
};

export default Settings;
