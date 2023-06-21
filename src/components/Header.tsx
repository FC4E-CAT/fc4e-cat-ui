import { Link } from "react-router-dom";
import { Container, Navbar } from 'react-bootstrap';
import logo from '../logo.svg';

function Header() {
    return (
        <Navbar variant="light" expand="lg" className="main-nav shadow-sm">
        <Container>

          {/* Branding logos */}
          <Navbar.Brand href="/">
            <img
              src={logo}
              height="40"
              className="d-inline-block align-top"
              alt="FAIRCORE4EOSC CAT"
            />
          </Navbar.Brand>

          {/* Hamburger button */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          {/* Collapsible part that holds navigation links */}
          <Navbar.Collapse id="basic-navbar-nav">
           <Link to="/login" className="btn btn-primary" >Login</Link>
          </Navbar.Collapse>

        </Container>
      </Navbar>
    );
}

export default Header;