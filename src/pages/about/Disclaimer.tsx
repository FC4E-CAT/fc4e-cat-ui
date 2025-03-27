import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function Disclaimer() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("disclaimer")}
          <p></p>
          <p className="lead cat-view-lead">
            This disclaimer states the conditions applicable to information on
            the Compliance Assessment Toolkit (CAT) websites and the services
            provided through CAT sites.
          </p>
        </h2>
        <Row>
          <h5>Use of the CAT websites</h5>
          <p>
            DANS and GRNET take the greatest possible care to ensure the
            correctness, completeness and timeliness of the information on the
            CAT websites, but it may contain inaccuracies and omissions. DANS or
            GRNET are not liable for any damage resulting from the use of this
            information, including damage due to incorrectness or incompleteness
            of the Information. Information from Third Parties
          </p>

          <h5>Information from Third Parties</h5>
          <p>
            The CAT websites may refer to information from third parties, for
            example through links to other websites or training materials. DANS,
            and GRNET are not liable for this information from third parties.
          </p>

          <h5>Content in Individual Self-Assessments</h5>
          <p>
            DANS and GRNET are not responsible for the content of
            self-assessments contributed by users of our websites, or for the
            published assessment reports in Zenodo based on the
            self-assessments. The intellectual property rights are vested in the
            publisher of the self-assessment, and access conditions are
            determined by the publisher of the self-assessment. DANS and GRNET
            are not liable for damage resulting from incomplete or incorrect
            information in these self-assessments or reports based on them. DANS
            and GRNET are also not liable for damage resulting from incorrect
            inferences based on self assessments or their associated published
            reports in Zenodo.
          </p>

          <h5>Content in the Identifier Knowledge Base</h5>
          <p>
            DANS and GRNET provides curated content on Identifiers and their
            characteristics via a Knowledge Base that can be accessed via the
            CAT websites. DANS and GRNET are not liable for damage resulting
            from incomplete or incorrect information in the Knowledge Base, or
            any application of the information presented in the Knowledge Base.
          </p>
          <p>
            By using the information offered and/ or purchasing services, the
            user declares to agree with the applicability of this disclaimer.
          </p>
          <p>
            Any inaccuracies found or questions about this disclaimer can be
            reported via the Helpdesk.
          </p>
        </Row>
      </div>
    </div>
  );
}

export default Disclaimer;
