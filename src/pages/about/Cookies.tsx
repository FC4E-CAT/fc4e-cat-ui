import { Row } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { FaInfoCircle } from "react-icons/fa";

function Cookies() {
  const { t } = useTranslation();
  return (
    <div className="container rounded bg-white mt-1 mb-6">
      <div className="p-4">
        <h2 className="cat-view-heading text-muted mb-4">
          <FaInfoCircle /> {t("page_cookies.title")}
          <p className="lead cat-view-lead"></p>
        </h2>
        <Row>
          <h4>1. Purpose of this cookie policy</h4>
          <p>
            This Website uses technologies such as <strong>cookies</strong> and{" "}
            <strong>pixel</strong> tags. By browsing the webpage, the User
            agrees to the creation and use of cookies. If User does not wish to
            consent to the use of cookies, User may either disable them or
            discontinue browsing this webpage.
          </p>
          <p>
            For the purpose of this Policy, the following terms shall have the
            following meaning:
            <ul>
              <li>
                Cookie or Cookies: Cookies are small text or message files sent
                from the server of an organization and stored on your computer.
                Cookies do not have access to data stored on your computers hard
                disk or to Cookies placed by other websites, and they may not
                harm or damage your system.
              </li>
              <li>
                Persistence cookies remain during multiple website visits and
                get stored on your hard disk.
              </li>
              <li>
                Session Cookies are temporary cookies that disappear
                automatically after you leave a website;
              </li>
              <li>
                Third Party Cookies are cookies used by the websites of our
                partners, as integrated in our own Website or used by websites
                we link to.
              </li>
            </ul>
          </p>
        </Row>
        <Row>
          <h4>
            2. Which cookies are placed on your device when using our Website?
          </h4>
          <p>
            When you access and/or use the Website, we place one or more Cookies
            on your device for the purposes described herein. The following
            table and relevant information set out the cookies used for the
            Website.It also provides details of third parties setting cookies:
          </p>
          <p className="mt-1 mb-5">
            <table className="table table-bordered mb-4">
              <tr>
                <th>Cookie</th>
                <th>Type</th>
                <th>Cookie Provider</th>
                <th>Cookie Name</th>
                <th>Third party cookie</th>
                <th>Persistent or session Cookie</th>
                <th>Purpose of cookie</th>
              </tr>
              <td>Session</td>
              <td>State</td>
              <td>WEBUI URL </td>
              <td>JSESSIONID</td>
              <td>No</td>
              <td>Session Preserve</td>
              <td>user session information</td>
            </table>
          </p>
        </Row>
        <Row>
          <h4>3. How long are cookies stored on your device?</h4>
          <p>
            The duration for which a cookie will be stored on your browsing
            device depends on whether it is a &quot;persistence&quot; or a
            &quot;session&quot; cookie. Session cookies will be stored on a
            device until you turn off your web browser. &quot;Persistence
            cookies&quot; shall remain on your device after you have finished
            browsing until they expire or until they are deleted by you.
          </p>
        </Row>
        <Row>
          <h4>
            4. How can you disable cookies that have been placed on your device?
          </h4>
          <p>
            You can usually use your web browser to enable, disable, or delete
            cookies. To do so, follow the instructions provided for by your web
            browser (usually located in the &quot;Help&quot;, &quot;Tools&quot;
            or &quot;Edit&quot; settings). You can also set your web browser to
            reject all cookies or to indicate when a cookie is being sent.
          </p>
        </Row>
      </div>
    </div>
  );
}

export default Cookies;
