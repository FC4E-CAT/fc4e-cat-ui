import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function AcceptableUse() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("acceptable_use_policy")}
        </h2>
        <Row>
          <h3>Introduction</h3>
          <p>
            This Acceptable Use Policy (“AUP”) defines the rules and conditions
            that govern your access to and use (including transmission,
            processing, and storage of data) of the resources and services
            (“Services”) as granted by the National Infrastructures for Research
            and Technology (GRNET) for the purpose of providing high-quality
            international and national networking services to support research
            and educational activities to Greek academic and research
            institutions along with the public and private sector.
          </p>
        </Row>
        <Row>
          <h3>Requirements</h3>
          <p>
            <ol>
              <li>
                You shall only use the Services in a manner consistent with the
                purposes and limitations described above; you shall show
                consideration towards other users including by not causing harm
                to the Services; you have an obligation to collaborate in the
                resolution of issues arising from your use of the Services.
              </li>
              <li>
                You shall only use the Services for lawful purposes and not
                breach, attempt to breach, nor circumvent administrative or
                security controls.
              </li>
              <li>
                You shall respect intellectual property and confidentiality
                agreements.
              </li>
              <li>
                You shall protect your access credentials (e.g. passwords,
                private keys or multi-factor tokens); no intentional sharing is
                permitted.
              </li>
              <li>
                You shall keep your registered information correct and up to
                date.
              </li>
              <li>
                You shall promptly report known or suspected security breaches,
                credential compromise, or misuse to the security contact stated
                below; and report any compromised credentials to the relevant
                issuing authorities.{" "}
              </li>
              <li>
                Reliance on the Services shall only be to the extent specified
                by any applicable service level agreements listed below. Use
                without such agreements is at your own risk.
              </li>
              <li>
                Your personal data will be processed in accordance with the
                privacy statements referenced below.
              </li>
              <li>
                Your use of the Services may be restricted or suspended, for
                administrative, operational, or security reasons, without prior
                notice and without compensation.
              </li>
              <li>
                If you violate these rules, you may be liable for the
                consequences, which may include your account being suspended and
                a report being made to your home organisation or to law
                enforcement.
              </li>
            </ol>
          </p>
        </Row>
        <Row>
          <h3>Revisions to this Acceptable Use Policy</h3>
          <p>
            The National Infrastructures for Research and Technology (GRNET)
            reserves the right to revise, amend, and/or modify this AUP at any
            time. Notice of any revision, amendment, and/or modification to this
            AUP will be posted on the landing page for the Services. You agree
            that your use of the Services, beyond a period of one calendar month
            after a notice of such change has been provided on the Services for
            the first time, shall constitute your consent to the revised,
            amended, and/or modified version of the AUP.
          </p>
        </Row>
        <Row>
          <h3>Contact Details</h3>
          <p>
            <ul>
              <li>
                The administrative contact for this AUP is: pmo AT
                einfra.grnet.gr{" "}
              </li>
              <li>
                The security contact for this AUP is: security AT
                einfra.grnet.gr{" "}
              </li>
            </ul>
          </p>
        </Row>
      </div>
    </div>
  );
}

export default AcceptableUse;
