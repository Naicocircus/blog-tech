import React, { useContext } from 'react';
import { Navbar, Nav, Container, Button, Dropdown } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaUser } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';
import NotificationBell from './NotificationBell';

const NavbarComponent = () => {
  const { isAuthenticated, logout, user } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Navbar bg="light" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/">Tech Blog</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/">Home</Nav.Link>
            <Nav.Link as={Link} to="/blog">Blog</Nav.Link>
            <Nav.Link as={Link} to="/about">Chi siamo</Nav.Link>
            <Nav.Link as={Link} to="/contact">Contatti</Nav.Link>
          </Nav>
          <div className="d-flex align-items-center">
            {isAuthenticated ? (
              <>
                {/* Notifiche */}
                <div className="me-3">
                  <NotificationBell />
                </div>
                
                <Dropdown align="end">
                  <Dropdown.Toggle variant="light" id="dropdown-user" className="d-flex align-items-center">
                    {user?.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.name} 
                        className="rounded-circle me-2" 
                        style={{ width: '30px', height: '30px', objectFit: 'cover' }} 
                      />
                    ) : (
                      <FaUser className="me-2" />
                    )}
                    {user?.name || 'Utente'}
                  </Dropdown.Toggle>

                  <Dropdown.Menu>
                    <Dropdown.Item as={Link} to="/profile">Profilo</Dropdown.Item>
                    {(user?.role === 'author' || user?.role === 'admin') && (
                      <Dropdown.Item as={Link} to="/create-post">Crea Post</Dropdown.Item>
                    )}
                    <Dropdown.Item as={Link} to="/notifications">Notifiche</Dropdown.Item>
                    <Dropdown.Divider />
                    <Dropdown.Item onClick={handleLogout}>Logout</Dropdown.Item>
                  </Dropdown.Menu>
                </Dropdown>
              </>
            ) : (
              <div>
                <Button variant="outline-primary" className="me-2" as={Link} to="/login">Login</Button>
                <Button variant="primary" as={Link} to="/register">Registrati</Button>
              </div>
            )}
          </div>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavbarComponent; 