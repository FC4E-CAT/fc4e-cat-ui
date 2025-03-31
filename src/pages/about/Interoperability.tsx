import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function Interoperability() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("interoperability_guidelines")}
          <p></p>
          <p className="lead cat-view-lead">
            The CAT is Designed for Interoperability{" "}
          </p>
        </h2>
        <Row>
          <p>
            The Compliance Assessment Toolkit (CAT) is designed for
            interoperability. It offers four main information sources that each
            provide a rich set of REST-based or GraphQL-based API calls with
            supporting documentation. The CAT implements an encoding of PID
            Policy Compliance Assessment, and this encoding, together with
            assessment results, is available via the CAT API. The CAT also
            offers a comprehensive Knowledge Base on Identifiers and its
            ecosystem, and this is supported by a substantial number of GraphQL
            endpoints. CAT makes use of and assists with maintenance of a set of
            vocabularies, and these are available via an API for integration
            into other systems. CAT is also developing and testing monitoring
            services (for example for monitoring persistence and resolvability
            of Identifiers) - these services are currently in prototyping and
            will be made available operationally at a later date.
          </p>
        </Row>
        <Row>
          <h3>Accessing the CAT Vocabularies</h3>
          <p>
            The CAT Vocabularies can be accessed via the user interface or the
            API, depending on the need of the end user. These vocabularies are:
            <ul>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/438b7eb5-83c5-4ccc-8f85-0f583d148519"
                  target="_blank"
                  rel="noreferrer"
                >
                  Criteria Imperatives
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/9c735525-960e-4f13-a74d-4eb23ea9c308"
                  target="_blank"
                  rel="noreferrer"
                >
                  EOSC PID Policy Roles (Actors)
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/3af07c11-11a7-42ed-b0e4-d22cbeb367fb"
                  target="_blank"
                  rel="noreferrer"
                >
                  General Glossary of PID Roles
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/2a062144-1766-40e7-b8da-6a4b1d5f9f00"
                  target="_blank"
                  rel="noreferrer"
                >
                  Glossary for Compliance Assessment
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/#:~:text=Metric%20and%20Benchmark,MSCR%20testers"
                  target="_blank"
                  rel="noreferrer"
                >
                  Metric and Benchmark Types
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/#:~:text=Motivation%20Typology,MSCR%20testers"
                  target="_blank"
                  rel="noreferrer"
                >
                  Motivation Typology
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/c7dde918-9433-4d22-8e5f-346d808a6d52"
                  target="_blank"
                  rel="noreferrer"
                >
                  Predictability of Assessment Test Results
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/3c897302-bb60-49f5-ab1c-23b08867cd68"
                  target="_blank"
                  rel="noreferrer"
                >
                  Test Result Typology
                </a>
              </li>
              <li>
                <a
                  href="https://mscr-vocabularies-test.2.rahtiapp.fi/terminology/525d5237-5053-4c61-8724-1feead00fa2a"
                  target="_blank"
                  rel="noreferrer"
                >
                  Test Typology
                </a>
              </li>
            </ul>
            The CAT API also serves as a facade for the vocabulary server, the
            above codelists can be obtained from a set of{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/#/Registry%20Codelist"
              target="_blank"
              rel="noreferrer"
            >
              REST API Calls
            </a>
            .
          </p>
        </Row>
        <Row>
          <h3>Accessing the CAT API</h3>
          <p>
            CAT is designed to perform assessments based on encodings for
            multiple Motivations - the reason why an assessment is performed.
            There can be many of these Motivations, for example FAIR-related,
            EOSC PID Policy-related, EOSC Node Federation-related, and so on.
            Each of these Motivations requires a different set of criteria,
            principles, metrics, tests, benchmarks, and guidance to be
            implemented. For each of these families of motivations (clustered by
            the overlap in criteria, metrics, tests, etc.) there is or will be
            an instance of CAT, and the API associated with that instance will
            present a set of principles, criteria, metrics, tests, and
            assessments focused on that Motivation. For EOSC PID Policy and
            related or derived compliance assessments, the API can be accessed{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/"
              target="_blank"
              rel="noreferrer"
            >
              here
            </a>
            .
          </p>
        </Row>
        <Row>
          <h3>Using CAT Assessments and Encodings</h3>
          <p>
            Firstly, the API supports registry-like functions for a number of
            concepts: the principles, criteria, metrics, tests, and benchmarks
            associated with a Motivation are reliably available from these API
            endpoints, provides a compact identifier for referencing the concept
            reliably, and defines it unambiguously. Secondly, guidance (best
            practices, recommendations, standards) associated with these
            concepts are available at different levels of granularity via the
            API. Assessments of compliance with the criteria are also available
            via the API, provided that these assessments have been published by
            the owner. In future, the CAT aims to support the updating of
            assessments via the API from external sources, allowing one of a
            number of implementation architectures to become feasible.
          </p>
        </Row>
        <Row>
          <h3>CAT Encoding and Assessment of PID Policy</h3>
          <p>
            The following examples of CAT encodings for PID Policy may be of
            interest to end users:
            <ul>
              <li>
                List of{" "}
                <a
                  href="https://api.cat.argo.grnet.gr/swagger-ui/#/Motivation/get_v1_registry_motivations"
                  target="_blank"
                  rel="noreferrer"
                >
                  Motivations
                </a>
              </li>
              <li>
                List of{" "}
                <a
                  href="https://api.cat.argo.grnet.gr/swagger-ui/#/Principle/get_v1_registry_principles"
                  target="_blank"
                  rel="noreferrer"
                >
                  Principles
                </a>
              </li>
              <li>
                List of{" "}
                <a
                  href="https://api.cat.argo.grnet.gr/swagger-ui/#/Criterion/get_v1_registry_criteria"
                  target="_blank"
                  rel="noreferrer"
                >
                  Criteria
                </a>
              </li>
              <li>
                List of{" "}
                <a
                  href="https://api.cat.argo.grnet.gr/swagger-ui/#/Metrics/get_v1_registry_metrics"
                  target="_blank"
                  rel="noreferrer"
                >
                  Metrics
                </a>
              </li>
              <li>
                List of{" "}
                <a
                  href="https://api.cat.argo.grnet.gr/swagger-ui/#/Test/get_v1_registry_tests"
                  target="_blank"
                  rel="noreferrer"
                >
                  Tests
                </a>
              </li>
            </ul>
            Moreover, the{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/#/Assessment"
              target="_blank"
              rel="noreferrer"
            >
              assessments that are publicly available can be retrieved
            </a>
            , as well as{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/#/Assessment/get_v2_assessments_public__id_"
              target="_blank"
              rel="noreferrer"
            >
              details for each assessment
            </a>
            . Interested in the scope of assessments in the CAT? Use the{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/#/Statistics"
              target="_blank"
              rel="noreferrer"
            >
              statistics request
            </a>{" "}
            to get summary values from the API. The subjects of assessment refer
            to the services or objects being assessed - in the case of PID
            Policy, these will be the services offered by actors in the
            ecosystem.{" "}
            <a
              href="https://api.cat.argo.grnet.gr/swagger-ui/#/Subject"
              target="_blank"
              rel="noreferrer"
            >
              Listings and details of the subjects
            </a>{" "}
            of assessment can also be obtained from the API.
          </p>
        </Row>
        <Row>
          <h3>Using the CAT Knowledge Base</h3>
          <p>
            The CAT Knowledge Base offers a comprehensive inventory of
            Identifiers (PID services), together with information about its
            resolution infrastructure, its ecosystem (Stack), its
            characteristics, the entities it can be used for, and applications.
            The Knowledge Base serves as a registry of Identifiers and PID
            Systems, the associated Authorities, Schemes, and Standards, and
            offers compact identifiers for each of these. This allows reliable
            referencing and unambiguous description of these elements of the PID
            Ecosystem. It also offers API endpoints that describe features and
            characteristics of each of these Identifiers in respect of
            resolution infrastructure, general attributes, and other useful
            selection criteria.
          </p>
        </Row>
      </div>
    </div>
  );
}

export default Interoperability;
