import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaGithub, FaTwitter, FaLinkedin, FaEnvelope, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-5 mt-5">
      <Container>
        <Row className="mb-4">
          <Col lg={4} className="mb-4 mb-lg-0">
            <h5 className="text-gradient mb-3">Tech-Blog</h5>
            <p className="text-muted">
              Your reference portal for the world of electronics, Arduino, Raspberry Pi and much more.
            </p>
            <div className="d-flex gap-3 mt-3">
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaGithub size={20} />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaTwitter size={20} />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-muted">
                <FaLinkedin size={20} />
              </a>
              <a href="mailto:info@tech-blog.com" className="text-muted">
                <FaEnvelope size={20} />
              </a>
            </div>
          </Col>
          
          <Col lg={2} md={4} sm={6} className="mb-4 mb-sm-0">
            <h6 className="mb-3 text-light">Navigation</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/" className="text-muted text-decoration-none">Home</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog" className="text-muted text-decoration-none">Blog</Link>
              </li>
              <li className="mb-2">
                <Link to="/about" className="text-muted text-decoration-none">About Us</Link>
              </li>
              <li className="mb-2">
                <Link to="/contact" className="text-muted text-decoration-none">Contact</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={2} md={4} sm={6} className="mb-4 mb-sm-0">
            <h6 className="mb-3 text-light">Categories</h6>
            <ul className="list-unstyled">
              <li className="mb-2">
                <Link to="/blog?category=microcontrollers" className="text-muted text-decoration-none">Microcontrollers</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog?category=programming" className="text-muted text-decoration-none">Programming</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog?category=robotics" className="text-muted text-decoration-none">Robotics</Link>
              </li>
              <li className="mb-2">
                <Link to="/blog?category=iot" className="text-muted text-decoration-none">IoT</Link>
              </li>
            </ul>
          </Col>
          
          <Col lg={4} md={4}>
            <h6 className="mb-3 text-light">Subscribe to our newsletter</h6>
            <p className="text-muted mb-3">Get the latest news and updates directly to your inbox.</p>
            <div className="input-group border-glow">
              <input 
                type="email" 
                className="form-control bg-dark text-light border-0" 
                placeholder="Your email address" 
              />
              <button className="btn btn-primary btn-hover-effect" type="button">
                Subscribe
              </button>
            </div>
          </Col>
        </Row>
        
        <hr className="border-secondary" />
        
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mt-4">
          <p className="text-muted mb-3 mb-md-0">
            © {currentYear} Tech-Blog. All rights reserved.
          </p>
          <p className="text-muted mb-0">
            Made with <FaHeart className="text-danger mx-1" /> by Tech-Blog Team
          </p>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 