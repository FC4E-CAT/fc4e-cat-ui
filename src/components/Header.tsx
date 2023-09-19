import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Container,
  Navbar,
  Nav,
  NavItem,
  Dropdown,
  NavDropdown,
} from "react-bootstrap";
import logo from "@/logo.svg";
import { useGetProfile } from "@/api";
import { trimProfileID } from "@/utils";
import { AuthContext } from "@/auth";
import { FaUser, FaCog, FaShieldAlt } from "react-icons/fa";
import { UserProfile } from "@/types";

function Header() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();

  const { data } = useGetProfile({
    token: keycloak?.token || "",
    isRegistered: registered,
  });

  useEffect(() => {
    setUserProfile(data);
  }, [data]);

  return (
    <div className="mb-4">
      <Container className="d-flex justify-content-between my-2">
        {/* Branding logos */}
        <Link to="/">
          <img
            src={logo}
            height="46"
            className="d-inline-block align-top"
            alt="FAIRCORE4EOSC CAT"
          />
        </Link>

        {/* login button */}
        {!authenticated && (
          <Link to="/login" className="btn btn-primary my-2">
            Login
          </Link>
        )}

        {/* if logged in display user id */}
        {authenticated && userProfile?.id && (
          <>
            <Dropdown>
              <Dropdown.Toggle variant="primary" id="dropdown-basic">
                <FaUser /> {trimProfileID(userProfile.id)}
              </Dropdown.Toggle>

              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/logout">
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
            {/* <Link to="/profile" className="my-2 btn btn-success dropdown-toggle">
                  <span><FaUser /> {trimProfileID(userProfile.id)}</span>
              </Link> */}
          </>
        )}
      </Container>

      <Navbar
        variant="light"
        expand="lg"
        className="main-nav bg-light shadow-sm py-0"
      >
        <Container>
          {/* Hamburger button */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          {/* Collapsible part that holds navigation links */}
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <NavItem>
                <Link to="/" className="cat-nav-link">
                  HOME
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/" className="cat-nav-link cat-text-faded">
                  SEARCH
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/assess" className="cat-nav-link">
                  ASSESS
                </Link>
              </NavItem>
              <NavItem>
                <Link to="#" className="cat-nav-link cat-text-faded">
                  RESOURCES
                </Link>
              </NavItem>

              {authenticated && userProfile?.id && (
                <>
                  <NavItem>
                    <Link to="/profile" className="cat-nav-link">
                      <FaUser />
                    </Link>
                  </NavItem>

                  <NavItem>
                    <Link to="/" className="cat-nav-link cat-text-faded">
                      <FaCog />
                    </Link>
                  </NavItem>
                </>
              )}
            </Nav>

            {authenticated && userProfile?.user_type === "Admin" && (
              <Nav>
                <NavDropdown
                  title={
                    <span className="text-dark">
                      <FaShieldAlt /> ADMIN
                    </span>
                  }
                  className="cat-nav-item"
                >
                  <NavDropdown.Item as={Link} to="/users">
                    Users
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/validations">
                    Validations
                  </NavDropdown.Item>
                </NavDropdown>
              </Nav>
            )}
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </div>
  );
}

export { Header };
