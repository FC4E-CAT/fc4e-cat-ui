import { useContext, useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { Container, Navbar, Nav, NavItem } from 'react-bootstrap';
import logo from '../logo.svg';
import { UserAPI } from '../api';
import { trimProfileID } from '../utils/Utils';
import { AuthContext } from '../auth/AuthContext';
import { FaUser, FaCog } from 'react-icons/fa';


function Header() {
  const { authenticated, keycloak, registered } = useContext(AuthContext)!;
  const [userProfile, setUserProfile] = useState<UserProfile>();


  const { data } = UserAPI.useGetProfile(
    { token: keycloak?.token, isRegistered: registered },
  );

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
        {!authenticated &&
          <Link to="/login" className="btn btn-primary" >Login</Link>
        }

        {/* if logged in display user id */}
        {authenticated && userProfile?.id &&
            <>
              <Link to="/profile" className="my-2 btn btn-success dropdown-toggle">
                  <span><FaUser /> {trimProfileID(userProfile.id)}</span>
              </Link>
            </>
        }
    
      
        
      </Container>

      
    <Navbar variant="light" expand="lg" className="main-nav bg-light shadow-sm py-0">
      <Container>

        {/* Hamburger button */}
        <Navbar.Toggle aria-controls="basic-navbar-nav" />

        {/* Collapsible part that holds navigation links */}
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
          <NavItem>
            <Link to="/" className="cat-nav-link">HOME</Link>
          </NavItem>
          <NavItem>
            <Link to="/" className="cat-nav-link">SEARCH</Link>
          </NavItem>
          <NavItem>
            <Link to="/" className="cat-nav-link">ASSESS</Link>
          </NavItem>
          <NavItem>
            <Link to="/" className="cat-nav-link">RESOURCES</Link>
          </NavItem>
          
          {authenticated && userProfile?.id &&
          <>
          <NavItem>
            <Link to="/profile" className="cat-nav-link"><FaUser /></Link>
          </NavItem>

          <NavItem>
            <Link to="/" className="cat-nav-link"><FaCog /></Link>
          </NavItem>
          </>
          }
          </Nav>
          
          {authenticated && userProfile?.id &&
          <Nav>
        
          <Navbar.Text className="nav-text">
            Admin:
          </Navbar.Text>
          <NavItem>
              <Link to="/users" className="cat-nav-link" >USERS</Link>
            </NavItem>
          </Nav>
          }

        </Navbar.Collapse>
      </Container>
    </Navbar>
    </div>
  );
}

export { Header };