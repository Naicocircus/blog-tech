import React, { useState, useContext } from 'react';
import { Form, Button, Card, Alert, Container, Row, Col } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { FaGoogle } from 'react-icons/fa';
import AuthContext from '../context/AuthContext';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validazione
    if (!email || !password) {
      return setError('Per favore, compila tutti i campi');
    }

    if (!validateEmail(email)) {
      return setError('Per favore, inserisci un indirizzo email valido');
    }

    if (password.length < 6) {
      return setError('La password deve essere di almeno 6 caratteri');
    }
    
    try {
      setError('');
      setLoading(true);
      
      const response = await login({ email, password });
      
      if (response.success) {
        navigate('/', { replace: true });
      } else {
        setError(response.message || 'Login fallito');
      }
      
    } catch (err) {
      setError('Impossibile effettuare il login. Verifica le tue credenziali.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = 'https://blog-tech-be.onrender.com/api/auth/google';
  };

  return (
    <Container className="py-5 auth-page">
      <Row className="justify-content-center">
        <Col md={6}>
          <div className="text-center mb-4">
            <h1 className="text-gradient">Accedi</h1>
            <p className="lead text-muted">Bentornato! Accedi al tuo account.</p>
          </div>
          
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Inserisci la tua email"
                    required
                    className="bg-dark text-light border-0"
                  />
                </Form.Group>
                
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci la tua password"
                    required
                    className="bg-dark text-light border-0"
                  />
                </Form.Group>
                
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <Form.Check
                    type="checkbox"
                    label="Ricordami"
                    className="text-muted"
                  />
                  <Link to="/forgot-password" className="text-primary">Password dimenticata?</Link>
                </div>
                
                <div className="d-grid gap-2">
                  <Button 
                    variant="primary" 
                    type="submit" 
                    disabled={loading}
                    className="btn-glow"
                  >
                    {loading ? 'Accesso in corso...' : 'Accedi'}
                  </Button>

                  <Button
                    variant="outline-primary"
                    onClick={handleGoogleLogin}
                    className="d-flex align-items-center justify-content-center gap-2"
                  >
                    <FaGoogle /> Accedi con Google
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
          
          <div className="text-center mt-4">
            <p className="text-muted">
              Non hai un account? <Link to="/register" className="text-primary">Registrati ora</Link>
            </p>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage; 