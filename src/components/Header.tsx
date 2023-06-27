import { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar } from 'react-bootstrap';
import logo from '../logo.svg';
import user from '../assets/user.svg';
import { UserAPI } from '../api';
import { AuthContext } from '../auth/AuthContext';

function Header() {
  const { authenticated, setAuthenticated, keycloak, setKeycloak } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();


  const { data } = UserAPI.useGetProfile(
    { token: keycloak?.token },
  );

  useEffect(() => {
    setUserProfile(data);
  }, [data]);

  return (
    <Navbar variant="light" expand="lg" className="main-nav shadow-sm">
      <Container>

        {/* Branding logos */}
        <Navbar.Brand>
          <Link to="/">
            <img
              src={logo}
              height="40"
              className="d-inline-block align-top"
              alt="FAIRCORE4EOSC CAT"
            />
          </Link>
        </Navbar.Brand>

        {/* Hamburger button */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible part that holds navigation links */}
        <Navbar.Collapse id="basic-navbar-nav">
          {!authenticated &&
            <Link to="/login" className="btn btn-primary" >Login</Link>
          }
          {authenticated &&
            <>
              <Link to="/users" className="btn btn-primary" >Users</Link>
              <Link to="/profile" className="navbar-collapse collapse justify-content-end">
                <div
                  id="nav-dropdown-dark-example"
                  title={userProfile?.id}
                >
                  <img src={user} alt="mdo" className="rounded-circle" width="32" height="32" />
                  <span>{userProfile?.id}</span>
                </div>
              </Link>
            </>
          }
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

export { Header };