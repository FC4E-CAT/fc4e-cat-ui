import { Routes, Route, Link } from "react-router-dom"
import { Container, Navbar } from 'react-bootstrap';
import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import KeycloakLogin from "./KeycloakLogin";




function Main() {
  return (
<div className="page-center">
    <h2>Welcome to Compliance Assesment Tool</h2>
</div>
  )
}


function App() {


  return (
    <div className="App">
      {/* Main Navigation bar */}
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

      {/* Main content container - Renders views based on routes */}
      <Container>
        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/login" element={<KeycloakLogin />} />
        </Routes>
      </Container>

    </div>
  );
}

export default App;

