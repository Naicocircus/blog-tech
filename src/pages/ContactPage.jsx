import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert, InputGroup } from 'react-bootstrap';
import { FaEnvelope, FaPhone, FaMapMarkerAlt, FaGithub, FaTwitter, FaLinkedin, FaPaperPlane, FaCheck } from 'react-icons/fa';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [validated, setValidated] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Add animation when the page loads
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-in');
      }, 100 * index);
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    
    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }
    
    // In a real application, you would send the data to a server
    console.log('Form data:', formData);
    
    // Simulate form submission
    setValidated(true);
    setSubmitted(true);
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Reset state after 5 seconds
    setTimeout(() => {
      setSubmitted(false);
      setValidated(false);
    }, 5000);
  };

  // Contact information
  const contactInfo = [
    {
      id: 1,
      title: 'Email',
      value: 'info@tech-blog.com',
      icon: <FaEnvelope className="text-primary" size={24} />,
      link: 'mailto:info@tech-blog.com'
    },
    {
      id: 2,
      title: 'Phone',
      value: '+39 02 1234567',
      icon: <FaPhone className="text-primary" size={24} />,
      link: 'tel:+390212345678'
    },
    {
      id: 3,
      title: 'Address',
      value: '42 Technology Street, 20100 Milan, Italy',
      icon: <FaMapMarkerAlt className="text-primary" size={24} />,
      link: 'https://maps.google.com/?q=Milan,Italy'
    }
  ];

  // Social media
  const socialMedia = [
    {
      id: 1,
      name: 'GitHub',
      icon: <FaGithub size={24} />,
      link: 'https://github.com/tech-blog'
    },
    {
      id: 2,
      name: 'Twitter',
      icon: <FaTwitter size={24} />,
      link: 'https://twitter.com/tech-blog'
    },
    {
      id: 3,
      name: 'LinkedIn',
      icon: <FaLinkedin size={24} />,
      link: 'https://linkedin.com/company/tech-blog'
    }
  ];

  // FAQ
  const faqs = [
    {
      id: 1,
      question: 'How can I contribute to the blog?',
      answer: 'You can send us your articles or ideas through the contact form. We will evaluate your contribution and contact you to discuss the details.'
    },
    {
      id: 2,
      question: 'Do you offer consulting services?',
      answer: 'Yes, we offer consulting services for electronics, IoT, and software development projects. Contact us for more information.'
    },
    {
      id: 3,
      question: 'Can I republish your articles?',
      answer: 'Our content is protected by copyright. To republish an article, please contact us to obtain authorization.'
    },
    {
      id: 4,
      question: 'How can I report an error in an article?',
      answer: 'You can report errors or inaccuracies through the contact form, specifying the article and the error you found.'
    }
  ];

  return (
    <>
      <div className="tech-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <Container className="py-5 contact-page">
        {/* Header Section */}
        <Row className="mb-5 text-center animate-fade-in">
          <Col>
            <h1 className="text-gradient mb-4">Contact Us</h1>
            <p className="lead text-muted mb-5">
              Have questions, suggestions, or want to collaborate with us? We're here to help!
            </p>
          </Col>
        </Row>
        
        <Row className="mb-5">
          {/* Contact Form */}
          <Col lg={7} className="mb-5 mb-lg-0 animate-fade-in">
            <Card className="border-0 shadow-sm h-100">
              <Card.Body className="p-4">
                <h2 className="text-gradient mb-4 text-center">Send us a message</h2>
                
                {submitted && (
                  <Alert variant="success" className="d-flex align-items-center">
                    <FaCheck className="me-2" /> Thank you for contacting us! We'll get back to you soon.
                  </Alert>
                )}
                
                <Form noValidate validated={validated} onSubmit={handleSubmit}>
                  <Row>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="name">
                        <Form.Label>Full Name</Form.Label>
                        <Form.Control
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Enter your name"
                          required
                          className="bg-dark text-light border-0"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter your name.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                    <Col md={6} className="mb-3">
                      <Form.Group controlId="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="Enter your email"
                          required
                          className="bg-dark text-light border-0"
                        />
                        <Form.Control.Feedback type="invalid">
                          Please enter a valid email address.
                        </Form.Control.Feedback>
                      </Form.Group>
                    </Col>
                  </Row>
                  
                  <Form.Group className="mb-3" controlId="subject">
                    <Form.Label>Subject</Form.Label>
                    <Form.Control
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Enter the subject of your message"
                      required
                      className="bg-dark text-light border-0"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter the subject of your message.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <Form.Group className="mb-4" controlId="message">
                    <Form.Label>Message</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={6}
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Write your message here..."
                      required
                      className="bg-dark text-light border-0"
                    />
                    <Form.Control.Feedback type="invalid">
                      Please enter your message.
                    </Form.Control.Feedback>
                  </Form.Group>
                  
                  <div className="text-center">
                    <Button 
                      variant="primary" 
                      type="submit" 
                      className="btn-glow d-inline-flex align-items-center"
                      disabled={submitted}
                    >
                      <FaPaperPlane className="me-2" /> Send Message
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
          
          {/* Contact Info */}
          <Col lg={5} className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <Card className="border-0 shadow-sm mb-4 text-center">
              <Card.Body className="p-4">
                <h2 className="text-gradient mb-4">Contact Information</h2>
                
                <div className="mb-4 d-flex flex-column align-items-center">
                  {contactInfo.map(info => (
                    <div key={info.id} className="mb-4 text-center">
                      <div className="mb-2">
                        {info.icon}
                      </div>
                      <h5 className="mb-1">{info.title}</h5>
                      <a 
                        href={info.link} 
                        className="text-decoration-none"
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {info.value}
                      </a>
                    </div>
                  ))}
                </div>
                
                <h5 className="mb-3">Follow Us</h5>
                <div className="d-flex justify-content-center gap-3 mb-4">
                  {socialMedia.map(social => (
                    <a 
                      key={social.id}
                      href={social.link}
                      className="btn btn-outline-primary btn-hover-effect"
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.name}
                    >
                      {social.icon}
                    </a>
                  ))}
                </div>
                
                <div className="mt-4">
                  <h5 className="mb-3">Office Hours</h5>
                  <p className="mb-1">Monday - Friday: 9:00 AM - 6:00 PM</p>
                  <p>Saturday - Sunday: Closed</p>
                </div>
              </Card.Body>
            </Card>
            
            <Card className="border-0 shadow-sm text-center">
              <Card.Body className="p-4">
                <h2 className="text-gradient mb-4">Newsletter</h2>
                <p className="mb-3">Subscribe to our newsletter to receive updates on new articles and tech news.</p>
                
                <Form>
                  <InputGroup className="mb-3 border-glow">
                    <Form.Control
                      type="email"
                      placeholder="Your email"
                      className="bg-dark text-light border-0"
                    />
                    <Button variant="primary" className="btn-hover-effect">
                      Subscribe
                    </Button>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    We'll never share your email with third parties.
                  </Form.Text>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        
        {/* FAQ Section */}
        <Row className="mt-5">
          <Col className="text-center mb-4 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-gradient mb-4">Frequently Asked Questions</h2>
            <p className="lead text-muted mb-5">
              Answers to common questions
            </p>
          </Col>
        </Row>
        
        <Row className="mb-5">
          {faqs.map((faq, index) => (
            <Col md={6} key={faq.id} className="mb-4 animate-fade-in" style={{animationDelay: `${0.4 + index * 0.1}s`}}>
              <Card className="border-0 shadow-sm h-100">
                <Card.Body>
                  <h5 className="text-gradient mb-3">{faq.question}</h5>
                  <p className="mb-0">{faq.answer}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Map Section */}
        <Row className="mt-5 animate-fade-in" style={{animationDelay: '0.8s'}}>
          <Col>
            <Card className="border-0 shadow-sm overflow-hidden">
              <div className="ratio ratio-21x9">
                <iframe 
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2798.1627807252636!2d9.18710971555881!3d45.46512797910095!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x4786c6aec34636a1%3A0xab7f4e27101a2e08!2sMilano%20MI!5e0!3m2!1sit!2sit!4v1623159488797!5m2!1sit!2sit" 
                  title="Map of our office location"
                  className="border-0"
                  allowFullScreen=""
                  loading="lazy"
                ></iframe>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default ContactPage; 