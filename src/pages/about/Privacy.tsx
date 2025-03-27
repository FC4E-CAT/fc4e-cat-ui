import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function Privacy() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-5">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("privacy_statement")}
          <p></p>
          <p className="lead cat-view-lead">THis is the CAT Privacy Policy</p>
        </h2>
        <Row>
          <h4>Controller details</h4>
          <p>
            Α public limited company (societe anonyme) under the corporate name
            "National Infrastructures for Technology and Research S.A." and the
            distinctive title "GRNET S.A."
          </p>
          <h6>
            <strong>Controller's Contact Details</strong>
          </h6>
          <p>dpo at grnet.gr</p>
          <h6>
            <strong>Processor Details</strong>
          </h6>
          <p>AT Support Team</p>
          <h6>
            <strong>Processor's Contact Details</strong>
          </h6>
          <p>cat at grnet.gr</p>

          <h3>Scope of this Privacy Statement</h3>
          <p>
            The National Infrastructures for research and technology SA (GRNET)
            is bound by the European Regulation (EU) 2016/679 of the European
            Parliament and of the Council of 27 April 2016 on the protection of
            natural persons with regard to the processing of personal data and
            on the free movement of such data (General Data Protection
            Regulation – GDPR).
          </p>
          <p>
            This Privacy Statement describes the policies and procedures in
            place by GRNET to protect the privacy of The Compliance Assessment
            Toolkit (CAT) Service, and in particular the CAT Users.
          </p>
          <p>
            This Privacy Statement sets out the criteria and the conditions
            under which GRNET collects, processes, uses, stores and transfers
            the personal data of the service Users, how the confidentiality of
            such information is ensured as well as any law and/or regulation
            implemented or enacted in accordance with the GDPR and the
            legislation on the protection of electronic privacy, or any law
            which modifies, replaces, adopts or codifies any of the above laws,
            as well as any other applicable national laws on the processing of
            personal data and privacy, as they may exist under applicable law.
          </p>
          <p>
            GRNET reserves the right to modify and update the present Policy
            whenever deemed necessary, whereas any changes shall become
            effective after they are posted on the{" "}
            <a href="http://fc4e-cat.github.io/fc4e-cat-doc/">
              http://fc4e-cat.github.io/fc4e-cat-doc/
            </a>{" "}
            and
            <a href="https://fc4e-cat.github.io/fc4e-doc-pidkb/">
              https://fc4e-cat.github.io/fc4e-doc-pidkb/{" "}
            </a>
          </p>
          <p>
            For the purposes of this Privacy Statement, the terms "data
            controller", "data processor", "third party", "supervisory
            authority", "personal data", "processing", "data subject" shall have
            the meaning ascribed to them by the applicable law on the protection
            of personal data. Moreover, for the purposes of the present, the
            following terms shall also apply:
            <ul>
              <li>
                "Website" - the website accessible through the domain names{" "}
                <a href="https://cat.argo.grnet.gr/">
                  https://cat.argo.grnet.gr/
                </a>{" "}
                , including all of the web pages thereof.
              </li>
              <li>
                "User" - the internet user of the "Website", whom the data refer
                to and whose identity is known or who may be, directly or
                indirectly, identified.
              </li>
            </ul>
          </p>
        </Row>
        <Row>
          <h3>A. Purpose/s for processing the data collected:​</h3>
          <p>
            GRNET collects and processes the personal data of its Clients-Users,
            referred to here below, for the following purposes:
            <ul>
              <li>
                Technical capability for a smooth and uninterrupted operation of
                the "Website".
              </li>
              <li>Troubleshooting connection problems</li>
              <li>Metric Collection</li>
              <li>
                Service Provisioning in respect of compliance assessment and
                knowledge base requests.
              </li>
            </ul>
          </p>
          <p>
            Creating statistics reports and graphics. Information contained in
            statistics reports and graphics statistics do not contain any User's
            personal data.
          </p>
          <p>
            GRNET collects and processes Users-clients' personal data solely and
            exclusively for the purposes mentioned above and only to the extent
            strictly necessary to effectively satisfy such purposes. These data
            are always relevant, reasonable and not more than those required to
            meet the purposes set out above. Moreover they are accurate and,
            where appropriate, subject to updates. Furthermore, such data are
            retained only during the period required for collection and
            processing purposes as aforementioned, and are deleted at the end of
            that period.
          </p>
        </Row>
        <Row>
          <h3>B. Categories of personal data processed​</h3>
          <p>
            (a) When entering and using the Website, either through a user
            account or anonymously
            <ul>
              <li>IP address</li>
              <li>
                Navigation data within the Website through the installation of
                cookies
              </li>
            </ul>
          </p>

          <p>
            (b) When creating a personal account for CAT
            <ul>
              <li>E-mail address</li>
              <li>First Name</li>
              <li>Last Name</li>
              <li>Organization</li>
              <li>Token</li>
            </ul>
          </p>
          <p>
            GRNET does not collect or have access in any way to sensitive
            User-client data (racial or ethnic origin, religion, etc.).
          </p>
        </Row>
        <Row>
          <h3>C. Lawfulness of the processing operation</h3>
          <p>
            The personal data of "Users" are processed in the context of the
            provision of CAT Services and for the purposes described in this
            Privacy Statement, in line with the need (technical and
            organizational) to best perform CAT Services as well as to respond
            to "Users" requests concerning the CAT Service.
          </p>
        </Row>
        <Row>
          <h3>D. Access to personal data</h3>
          <p>
            GRNET may provide access to, or provide data related to, or
            necessary for supporting the Website, to the following natural
            persons or legal entities:
            <ul>
              <li>
                The CAT Support Team, personnel under an employment relationship
                with GRNET.
              </li>
              <li>
                The processing of the Users personal data by the aforementioned
                natural persons and/or legal entities, in their capacity as
                GRNET's partners, may be conducted only under the control and
                upon authorization issued by GRNET. Finally, such partners
                should comply with the same privacy requirements as GRNET in
                accordance with the present Privacy Statement.
              </li>
            </ul>
          </p>
        </Row>

        <Row>
          <h3>E. Recipients of collected personal data</h3>
          <p>
            GRNET SA does not, in any way, transfer/transmit or disclose the
            personal data of the "Users" to any third party business
            organizations, natural persons or legal entities, public authorities
            or agencies or any other organizations, other than those
            specifically referred to herein.
          </p>
          <p>
            The personal data of the"Users" may be communicated or transferred
            to government authorities and/or law enforcement officers, if that
            is required for the above purposes, or within the scope of enforcing
            a court decision or order, or for complying with a provision of law,
            or if so required in order to serve the legitimate interests of
            GRNET as Data Controller, in accordance with applicable law.
          </p>
        </Row>
        <Row>
          <h3>F. Rights of Data Subjects</h3>
          <p>
            GRNET performs all necessary actions both during collection and at
            each subsequent processing stage of the CAT Users personal data, so
            that each User is fully enabled to exercise the rights guaranteed by
            applicable data protection laws, namely the rights to access,
            rectify, erase and restrict processing, as well as the right to data
            portability, which are described below:
          </p>
          <p>
            <ul>
              <li>
                Right of Access: The data subject has the right to request and
                obtain from the Controller, within a time-period of one (1)
                month, confirmation as to whether or not personal data
                concerning him or her, are being processed, and, where that is
                the case, access to the personal data and to certain
                information, as laid out by applicable law. It may also request
                a copy of the personal data undergoing processing as described
                herein by sending an email message to the address: cat@grnet.gr
              </li>
              <li>
                Right to rectification: The data subject has the right to
                require the Controller to rectify inaccurate personal data
                concerning him/her. Taking into account the purposes of the
                processing, the data subject is entitled to have incomplete
                personal data completed, including by means of providing a
                supplementary statement in accordance with the applicable law.
              </li>
              <li>
                Right to erasure: The data subject has the right to obtain from
                the Controller the erasure of all personal data collected and
                processed within the scope of the CAT Service, in accordance
                with the applicable law.
              </li>
              <li>
                Right to restriction of processing: The data subject is entitled
                to obtain from the Controller the restriction of processing of
                his/her data where the accuracy of the data is questioned or
                where any of the other conditions set out by the applicable law,
                is met.
              </li>
              <li>
                Right to data portability: The data subject shall have the right
                to receive any personal data relating to him/her and which
                he/she has provided to the Controller in a structured, commonly
                used and machine readable format, as well as the right to
                transmit such data to another controller without objection by
                the controller to whom such personal data were provided in
                accordance with the law.
              </li>
            </ul>
          </p>
          <p>
            These rights are subject to various restrictions pursuant to
            applicable law, including for example if the fulfillment of the data
            subject's request may disclose personal data of another person or in
            the event that GRNET is required by law to retain such data.
          </p>
          <p>
            To exercise any of the aforementioned rights, the "User" may contact
            the CAT Support Team at the email address referred to hereinabove.
          </p>
          <p className="mt-1 mb-5">
            <table className="table table-bordered mb-4">
              <tr>
                <th>Categories of personal data collected</th>
                <th>Time and place of retention of personal data</th>
              </tr>
              <tr>
                <td>
                  IP address, Data from website navigation through Cookies
                </td>
                <td>18 months (log retention)</td>
              </tr>
              <tr>
                <td>User Name, Name, Surname, e-mail address</td>
                <td>
                  User Name, Name, Surname, Organization, e-mail address, will
                  be deleted on user request
                </td>
              </tr>
            </table>
          </p>
        </Row>
        <Row>
          <h3> H. Privacy and Security of Information</h3>
          <p>
            The processing of personal data by GRNET SA is performed in a manner
            that ensures both confidentiality and security thereof. All
            appropriate organisational and technical measures shall be taken to
            safeguard data against any accidental or unlawful destruction,
            accidental loss, alteration, prohibited dissemination or access or
            any other form of unfair processing. The services provided by GRNET
            SA are constantly evaluated to be in line with the safety
            requirements of international standards. GRNET's Information
            Security Management System (ISMS) has been certified by the
            accredited certification body, EUROCERT SA In particular:
          </p>
          <p>
            <ul>
              <li>
                Access to technical log data is restricted and can only be
                accessed in a secure way by the CAT service staff.
              </li>
              <li>
                {" "}
                When accessing the CAT service adequate security controls are in
                place to keep your personal data safe in accordance with the
                classification of the personal data we have collected from you.
              </li>
              <li>
                We use encryption (HTTPS) to keep data private while in transit.
                Data sent using HTTPS is secured via Transport Layer Security
                protocol (TLS), which provides:
                <ol>
                  <li>
                    Encryption---encrypting the exchanged data to keep it secure
                    from droppers.
                  </li>
                  <li>
                    Data integrity---data cannot be modified or corrupted during
                    transfer, intentionally or otherwise, without being
                    detected.
                  </li>
                  <li>
                    Authentication---proves that your users communicate with the
                    intended website.
                  </li>
                </ol>
              </li>
              <li>
                We review our information collection, storage, and processing
                practices, including physical security measures, to prevent
                unauthorized access to our systems
              </li>
            </ul>
          </p>

          <p>
            Although we follow best security practices to ensure your personal
            data remains secure, there is no absolute guarantee of security when
            using services online. While we strive to protect your personal
            data, you acknowledge that:{" "}
          </p>
          <p>
            <ul>
              <li>
                There are security and privacy limitations on the internet which
                are beyond our control and can have a negative impact on the
                confidentiality, integrity and availability of the information.
              </li>
              <li>
                We cannot be held accountable for activity that results from
                your own neglect to safeguard the security of your login
                credentials and equipment which results in a loss of your
                personal data. If you feel this is not enough, then please do
                not provide any personal data.
              </li>
            </ul>
          </p>
          <p>
            Your personal data will be protected according to the{" "}
            <a
              href="http://www.geant.net/uri/dataprotection-code-of-conduct/v1"
              target="_blank"
            >
              {" "}
              Code of Conduct for Service Providers
            </a>{" "}
            , a common standard for the research and higher education sector to
            protect your privacy.
          </p>
        </Row>

        <Row>
          <h3>G. Personal data retention periods</h3>
          <p>
            The personal data of CAT "Users" shall not be retained for a period
            of time longer than is necessary for the operations of the Service
            and the audits that it undergoes to that effect.
          </p>
        </Row>

        <Row>
          <h3>I. Contact</h3>
          <p>
            For any questions or clarifications regarding this Privacy Statement
            and as well as in the event of any issues related to violation of
            personal data, "Users" may contact the CAT Support team at the
            e-mail address mentioned above. They may also contact the GRNET Data
            Protection Officer (DPO), Vasiliki Konstantinopoulou, at the e-mail
            address: gdprteam@grnet.gr
          </p>
          <h3>K. Recourse/Complaint:</h3>
          <p>
            In case a request of an CAT "User" is not satisfied by the Data
            Controller or by the Data Protection Officer, the User may at any
            time file a complaint with the Competent Supervisory Authority,
            namely the Data Protection Authority http://www.dpa.gr.
          </p>
        </Row>
      </div>
    </div>
  );
}

export default Privacy;
