import { Col, Row, Container } from 'react-bootstrap';
import { FaEnvelope, FaYoutube, FaTwitter } from 'react-icons/fa';
import logoDans from '../assets/logo-dans.svg'
import logoDatacite from '../assets/logo-datacite.svg'
import logoGrnet from '../assets/logo-grnet.png'
import logoGwdg from '../assets/logo-gwdg.svg'

function Footer() {

  return (
    <footer className="border-top">
     <Container className="text-left">
      <Row className="mt-4">
        <Col sm>
          <h6>Contact and Service</h6>
          <ul className="list-unstyled">
            <li><a href="#">Contact</a></li>
            <li><a href="#">Terms and Conditions</a></li>
            <li><a href="#">Data Licenses</a></li>
            <li><a href="#">Privacy</a></li>
          </ul>
        
        </Col>
        <Col sm>
          <h6>About CAT</h6>
          <ul className="list-unstyled">
            <li><a href="#">Our Team</a></li>
            <li><a href="#">GitHub</a></li>
            <li><a href="#">Disclaimer</a></li>
          </ul>
        </Col>
        <Col sm>
          <h6>Follow Us</h6>
          <ul className="list-unstyled">
            <li><a href="#"><FaEnvelope /> Newsletter</a></li>
            <li><a href="#"><FaYoutube /> Youtube</a></li>
            <li><a href="#"><FaTwitter /> Twitter</a></li>
          </ul>
        </Col>
        <Col sm>
          <h6>Partners</h6>
            <img className="cat-logo-sm" src={logoDans} alt="DANS"/>
            <img className="cat-logo-sm" src={logoGrnet} alt="GRNET"/>
            <img className="cat-logo-sm" src={logoDatacite} alt="DATACITE"/>
            <img className="cat-logo-sm" src={logoGwdg} alt="GWDG"/>
        </Col>
      </Row>
     </Container>
    </footer>
  );
}

export { Footer };