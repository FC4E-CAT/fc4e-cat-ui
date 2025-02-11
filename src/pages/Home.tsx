import { useGetStatistics } from "@/api/services/registry";
import { Card, Col, ListGroup, Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaCheckCircle, FaCube, FaInfoCircle, FaUser } from "react-icons/fa";
import { Link } from "react-router-dom";

function Home() {
  const { data } = useGetStatistics();
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="page-center text-center p-4">
        <h2>{t("page_home.title")}</h2>
        <Link to="/about" className="btn btn-light border mt-4">
          <FaInfoCircle className="me-2 text-muted" /> {t("buttons.about")}...
        </Link>
      </div>

      <div className="px-5 pb-5">
        <Row>
          <Col>
            <Card>
              <Card.Header>
                <FaUser /> Users
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Total:</strong>
                    <span className="ms-2">
                      {data?.user_statistics.total_users}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Validated:</strong>
                    <span className="ms-2">
                      {data?.user_statistics.validated_users}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Banned:</strong>
                    <span className="ms-2">
                      {data?.user_statistics.banned_users}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Identified:</strong>
                    <span className="ms-2">
                      {data?.user_statistics.identified_users}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Header>
                <FaUser /> Validations
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Total:</strong>
                    <span className="ms-2">
                      {data?.validation_statistics.total_validations}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Accepted:</strong>
                    <span className="ms-2">
                      {data?.validation_statistics.accepted_validations}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Pending:</strong>
                    <span className="ms-2">
                      {data?.validation_statistics.pending_validations}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Header>
                <FaCheckCircle /> Assessments
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Total:</strong>
                    <span className="ms-2">
                      {data?.assessment_statistics.total_assessments}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Private:</strong>
                    <span className="ms-2">
                      {data?.assessment_statistics.private_assessments}
                    </span>
                  </ListGroup.Item>
                  <ListGroup.Item>
                    <strong>Public:</strong>
                    <span className="ms-2">
                      {data?.assessment_statistics.public_assessments}
                    </span>
                  </ListGroup.Item>
                  {data?.assessment_statistics.assessment_per_role !==
                    undefined &&
                    data?.assessment_statistics.assessment_per_role.length >
                      0 && (
                      <ListGroup.Item>
                        Number of assessments per role:
                        <ul>
                          {data.assessment_statistics.assessment_per_role.map(
                            (item) => {
                              return (
                                <li key={item.actor}>
                                  <strong>{item.actor}</strong>
                                  <span className="m-2">
                                    {item.total_assessments}
                                  </span>
                                </li>
                              );
                            },
                          )}
                        </ul>
                      </ListGroup.Item>
                    )}
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
          <Col>
            <Card>
              <Card.Header>
                <FaCube /> Subjects
              </Card.Header>
              <Card.Body>
                <ListGroup>
                  <ListGroup.Item>
                    <strong>Total:</strong>
                    <span className="ms-2">
                      {data?.subject_statistics.total_subjects}
                    </span>
                  </ListGroup.Item>
                </ListGroup>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
}

export default Home;
