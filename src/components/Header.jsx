import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaUser, FaPen, FaCode } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import ApiService from '../services/api';

const Header = () => {
  const navigate = useNavigate();
  const { isAuthenticated, logout } = useContext(AuthContext);

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      logout();
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      logout();
      navigate('/login');
    }
  };

  return (
    <Navbar expand="lg" variant="dark" className="py-3 sticky-top">
      <Container>
        <Navbar.Brand as={Link} to="/" className="fw-bold brand-logo d-flex align-items-center">
          <FaCode className="me-2" />
          <span className="text-gradient">Tech-Blog</span>
        </Navbar.Brand>
        
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={NavLink} to="/" className="mx-2">
              Home
            </Nav.Link>
            <Nav.Link as={NavLink} to="/blog" className="mx-2">
              Blog
            </Nav.Link>
            <Nav.Link as={NavLink} to="/about" className="mx-2">
              About Us
            </Nav.Link>
            <Nav.Link as={NavLink} to="/contact" className="mx-2">
              Contact
            </Nav.Link>
          </Nav>
          
          <Nav>
            {isAuthenticated ? (
              <>
                <Button 
                  as={Link} 
                  to="/create-post" 
                  variant="outline-primary" 
                  className="me-2 btn-hover-effect"
                >
                  <FaPen className="me-2" /> New Post
                </Button>
                <Button 
                  as={Link} 
                  to="/profile" 
                  variant="primary"
                  className="me-2 btn-glow"
                >
                  <FaUser className="me-2" /> Profile
                </Button>
                <Button 
                  onClick={handleLogout}
                  variant="outline-danger"
                  className="btn-hover-effect"
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  as={Link} 
                  to="/login" 
                  variant="outline-primary" 
                  className="me-2 btn-hover-effect"
                >
                  Login
                </Button>
                <Button 
                  as={Link} 
                  to="/register" 
                  variant="primary"
                  className="btn-glow"
                >
                  Register
                </Button>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 