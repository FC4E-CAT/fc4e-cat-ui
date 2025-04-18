import { Row } from "react-bootstrap";
import { FaInfoCircle } from "react-icons/fa";
import { useTranslation } from "react-i18next";

function Terms() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("page_terms.title")}
        </h2>
        <Row>
          <p>
            By registering as a user you declare that you have read, understood
            and will abide by the following conditions of use:
          </p>
          <p>
            <ol>
              <li>
                You shall only use the resources/services to perform work, or
                transmit or store data consistent with the stated goals,
                policies and conditions of use as defined by the body or bodies
                granting you access.
              </li>
              <li>
                You shall provide appropriate acknowledgement of support or
                citation for your use of the resources/services provided as
                required by the body or bodies granting you access.
              </li>
              <li>
                You shall not use the resources/services for any purpose that is
                unlawful and not (attempt to) breach or circumvent any
                administrative or security controls.
              </li>
              <li>
                You shall respect intellectual property and confidentiality
                agreements.
              </li>
              <li>
                You shall protect your access credentials (e.g. private keys,
                tokens or passwords).
              </li>
              <li>
                You shall keep all your registered information correct and up to
                date.
              </li>
              <li>
                You shall immediately report any known or suspected security
                breach or misuse of the resources/services or access credentials
                to the specified incident reporting locations and to the
                relevant credential issuing authorities.
              </li>
              <li>
                You use the resources/services at your own risk. There is no
                guarantee that the resources/services will be available at any
                time or that their integrity or confidentiality will be
                preserved or that they will suit any purpose.
              </li>
              <li>
                You agree that logged information, including personal data
                provided by you for registration purposes, may be used for
                administrative, operational, accounting, monitoring and security
                purposes. You agree that this logged information may be
                disclosed to other authorised participants via secured
                mechanisms, only for the same purposes and only as far as
                necessary to provide the services.
              </li>
              <li>
                You agree that the body or bodies granting you access and
                resource/service providers are entitled to regulate, suspend or
                terminate your access without prior notice and without
                compensation, within their domain of authority, and you shall
                immediately comply with their instructions.{" "}
              </li>
              <li>
                You are liable for the consequences of your violation of any of
                these conditions of use, which may include but are not limited
                to the reporting of your violation to your home institute and,
                if the activities are thought to be illegal, to appropriate law
                enforcement agencies.
              </li>
            </ol>
          </p>
        </Row>
      </div>
    </div>
  );
}

export default Terms;
