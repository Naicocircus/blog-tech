import React, { useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Container, Spinner } from 'react-bootstrap';
import AuthContext from '../context/AuthContext';

const GoogleCallback = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuthStatus } = useContext(AuthContext);

  useEffect(() => {
    const token = new URLSearchParams(location.search).get('token');
    if (token) {
      localStorage.setItem('token', token);
      checkAuthStatus();
      navigate('/');
    } else {
      navigate('/login');
    }
  }, [location, navigate, checkAuthStatus]);

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
      <div className="text-center">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Completamento accesso in corso...</p>
      </div>
    </Container>
  );
};

export default GoogleCallback; 