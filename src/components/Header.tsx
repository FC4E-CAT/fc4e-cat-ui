import { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavItem, Dropdown } from "react-bootstrap";
import logo from "@/logo.svg";
import { useGetProfile } from "@/api";
import { trimProfileID } from "@/utils";
import { AuthContext } from "@/auth";
import { FaUser, FaShieldAlt } from "react-icons/fa";
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
    <div>
      <Container>
        <Navbar variant="light" expand="lg">
          <Navbar.Brand>
            {" "}
            {/* Branding logos */}
            <Link to="/">
              <img
                src={logo}
                height="46"
                className="d-inline-block align-top"
                alt="FAIRCORE4EOSC CAT"
              />
            </Link>
          </Navbar.Brand>
          {/* Hamburger button */}
          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          {/* Collapsible part that holds navigation links */}
          <Navbar.Collapse id="main-navbar-collapse">
            <Nav className="me-auto">
              {authenticated && userProfile?.id && (
                <>
                  <NavItem>
                    <Link to="/validations" className="cat-nav-link">
                      VALIDATIONS
                    </Link>
                  </NavItem>
                </>
              )}

              <NavItem>
                <Link to="/assess" className="cat-nav-link">
                  ASSESSMENTS
                </Link>
              </NavItem>
              <NavItem>
                <Link to="/pid-selection" className="cat-nav-link">
                  PID SELECTION
                </Link>
              </NavItem>
            </Nav>

            <Nav>
              {/* login button */}
              {!authenticated && (
                <Link
                  id="login-button"
                  to="/login"
                  className="btn btn-primary my-2"
                >
                  Login
                </Link>
              )}

              {/* if logged in display user id */}
              {authenticated && userProfile?.id && (
                <Dropdown>
                  <Dropdown.Toggle variant="primary" id="dropdown-basic">
                    <FaUser /> {trimProfileID(userProfile.id)}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">
                      Profile
                    </Dropdown.Item>

                    {userProfile?.user_type === "Admin" && (
                      <>
                        <Dropdown.Divider />
                        <Dropdown.Item as={Link} to="/motivations">
                          <FaShieldAlt /> Motivations
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/admin/users">
                          <FaShieldAlt /> Users
                        </Dropdown.Item>
                        <Dropdown.Item
                          id="admin_validation"
                          as={Link}
                          to="/admin/validations"
                        >
                          <FaShieldAlt /> Validations
                        </Dropdown.Item>
                        <Dropdown.Item as={Link} to="/assessments/view">
                          <FaShieldAlt /> Assessments
                        </Dropdown.Item>
                        <Dropdown.Divider />
                      </>
                    )}
                    <Dropdown.Item as={Link} to="/logout">
                      Logout
                    </Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              )}
            </Nav>
          </Navbar.Collapse>
        </Navbar>
      </Container>
    </div>
  );
}

export { Header };
