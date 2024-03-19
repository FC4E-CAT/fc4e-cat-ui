import imgFcat from "@/assets/fcat.jpg";
import { Row, Col, Accordion } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";

function About() {
  return (
    <div>
      <h3 className="cat-view-heading mb-4">
        <FaInfoCircle /> about
      </h3>
      <h2>Compliance Assesment Toolkit (CAT)</h2>
      <Row className="mt-2 mb-4">
        <Col>
          <h4>Overview</h4>
          <p>
            The main objective of WP2 is the creation of a Compliance Assessment
            Toolkit for EOSC: a set of concepts, implemented as a graph database
            and accessible via APIs, and supported by user interfaces via the
            APIs. The Compliance Assessment Toolkit will support the EOSC PID
            policy with services to encode, record, and query compliance with
            the policy. To do so, a wide range of compliance requirements (
            TRUST, FAIR, PID Policy, Reproducibility, GDPR, Licences) will be
            evaluated as use cases for definition of a conceptual model. At the
            same time, vocabularies, concepts, and designs are intended to be
            re-usable for other compliance needs: TRUST, FAIR, POSI, CARE, Data
            Commons, etc. This will be followed by a supporting service
            specification (the framework), accompanied by development and
            testing of operational services for PID Policy Compliance
            monitoring. Though primarily aimed at machine-actionable operations,
            the API-based services will be complemented by user interfaces to
            broaden its use.
          </p>
          <hr />
          The component will create the following resources:
          <ol type="1">
            <li>
              <strong>Vocabulary services</strong>, based on a conceptual model,
              that can be used to characterise, describe, and encode compliance
              regimes - with an operational version of the EOSC PID Compliance
              regime deployed. We will also include beta versions of other
              compliance assessment regimes - specifically FAIR and TRUST. These
              can be used as a starting point for operationalisation of
              additional regimes.
            </li>
            <li>
              <strong>API services</strong> (REST APIs) that allows for the
              encoding, recording, and querying of compliance assessments.
              Operational examples will support EOSC PID Policy compliance,
              while FAIR and TRUST will be available as beta versions.
            </li>
            <li>
              <strong>User Interfaces </strong> based on the APIs that support
              the use of the APIs within websites and applications.
            </li>
          </ol>
          <hr />
          <Accordion defaultActiveKey="0">
            <Accordion.Item eventKey="0">
              <Accordion.Header>Functionalities</Accordion.Header>
              <Accordion.Body>
                <ul className="cat-list-bullet-image">
                  <li>
                    CAT should support a procedure on how to enable the
                    assessment and select the type of role in the PID Ecosystem.
                  </li>
                  <li>
                    CAT Vocabulary Management: Record and maintain vocabulary
                    entries.
                  </li>
                  <li>CAT Management of compliance assessment event</li>
                  <li>
                    Query the database to obtain a variety of views - vocabulary
                    listings, object compliance reports and history, compliance.
                    Assessment method comparisons.
                  </li>
                  <li>
                    API endpoints for other systems to use the compliance
                    assessment toolkit.
                  </li>
                  <li>
                    UI Dashboard views - summary of scope of assessment in the
                    graph database
                  </li>
                  <li>
                    UI Object views - summary of the compliance history of an
                    object
                  </li>
                  <li>
                    Easy to use UI with functional consistency (behavior),
                    objects working in the same way throughout the interface.
                  </li>
                  <li>
                    User-friendly interfaces: interfaces that encourage
                    exploration without fear of negative consequences.
                  </li>
                  <li>
                    Wizard-like UI, fully documented so as to help the users
                    understand the what, how and why.
                  </li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
            <Accordion.Item eventKey="1">
              <Accordion.Header>Impact</Accordion.Header>
              <Accordion.Body>
                <ul className="cat-list-bullet-image">
                  <li>
                    Validate - Update with examples the EOSC PID Policy report
                  </li>
                  <li>
                    Operational service for PID Policy compliance assessment in
                    EOSC Standardisation of the compliance assessment landscape
                    <ul className="cat-list-bullet-image">
                      <li>
                        Horizontally - across different compliance assessment
                        regimes
                      </li>
                      <li>
                        Vertically - across different assessment tools and
                        metrics within an assessment regime
                      </li>
                    </ul>
                  </li>
                </ul>
              </Accordion.Body>
            </Accordion.Item>
          </Accordion>
        </Col>
        <Col lg={5}>
          <img src={imgFcat} style={{ maxWidth: "100%" }} />
        </Col>
      </Row>
    </div>
  );
}

export default About;
