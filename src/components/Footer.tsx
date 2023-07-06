import { Col, Row, Container } from 'react-bootstrap';
import { FaEnvelope, FaYoutube, FaTwitter } from 'react-icons/fa';
import logoDans from '../assets/logo-dans.svg'
import logoDatacite from '../assets/logo-datacite.svg'
import logoGrnet from '../assets/logo-grnet.png'
import logoGwdg from '../assets/logo-gwdg.svg'
import { Link } from 'react-router-dom';

function Footer() {

  return (
    <footer className="border-top">
     <Container className="text-left">
      <Row className="mt-4">
        <Col sm>
          <h6>Contact and Service</h6>
          <ul className="list-unstyled">
            <li><Link to="/">Contact</Link></li>
            <li><Link to="/">Terms and Conditions</Link></li>
            <li><Link to="/">Data Licenses</Link></li>
            <li><Link to="/">Privacy</Link></li>
          </ul>
        
        </Col>
        <Col sm>
          <h6>About CAT</h6>
          <ul className="list-unstyled">
            <li><Link to="/">Our Team</Link></li>
            <li><Link to="/">GitHub</Link></li>
            <li><Link to="/">Disclaimer</Link></li>
          </ul>
        </Col>
        <Col sm>
          <h6>Follow Us</h6>
          <ul className="list-unstyled">
            <li><Link to="/"><FaEnvelope /> Newsletter</Link></li>
            <li><Link to="/"><FaYoutube /> Youtube</Link></li>
            <li><Link to="/"><FaTwitter /> Twitter</Link></li>
          </ul>
        </Col>
        <Col sm>
          <h6>Partners</h6>
            <a href="https://dans.knaw.nl/en" target="_blank" rel="noreferrer"><img className="cat-logo-sm" src={logoDans} alt="DANS"/></a>
            <a href="https://www.grnet.gr/en" target="_blank" rel="noreferrer"><img className="cat-logo-sm" src={logoGrnet} alt="GRNET"/></a>
            <a href="https://www.datacite.org" target="_blank" rel="noreferrer"><img className="cat-logo-sm" src={logoDatacite} alt="DATACITE"/></a>
            <a href="https://www.gwdg.de/" target="_blank" rel="noreferrer"><img className="cat-logo-sm" src={logoGwdg} alt="GWDG"/></a>
        </Col>
      </Row>
     </Container>
    </footer>
  );
}

export { Footer };