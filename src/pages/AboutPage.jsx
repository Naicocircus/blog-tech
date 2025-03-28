import React, { useEffect } from 'react';
import { Container, Row, Col, Card, Image } from 'react-bootstrap';
import { FaCode, FaLaptopCode, FaMicrochip, FaServer } from 'react-icons/fa';

const AboutPage = () => {
  // Add animation when the page loads
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-in');
      }, 100 * index);
    });
  }, []);

  // Team members
  const teamMembers = [
    {
      id: 1,
      name: 'Mark Ross',
      role: 'Founder & Editor-in-Chief',
      bio: 'Electronics engineer with 10+ years of experience. Passionate about microcontrollers and IoT.',
      image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80'
    },
    {
      id: 2,
      name: 'Laura White',
      role: 'Developer & Writer',
      bio: 'Expert in embedded programming and software development. Loves sharing tutorials and practical guides.',
      image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80'
    },
    {
      id: 3,
      name: 'Alex Green',
      role: 'Hardware Expert & Reviewer',
      bio: 'Specialized in hardware design and robotics. Reviews the latest technological devices.',
      image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=300&h=300&q=80'
    }
  ];

  // Blog values
  const values = [
    {
      id: 1,
      title: 'Innovation',
      description: 'We explore and share the latest developments in technology and electronics.',
      icon: <FaMicrochip className="text-primary" size={40} />
    },
    {
      id: 2,
      title: 'Education',
      description: 'We believe in sharing knowledge through tutorials, guides, and educational articles.',
      icon: <FaLaptopCode className="text-primary" size={40} />
    },
    {
      id: 3,
      title: 'Community',
      description: 'We build a community of technology enthusiasts who can learn and grow together.',
      icon: <FaCode className="text-primary" size={40} />
    },
    {
      id: 4,
      title: 'Quality',
      description: 'We are committed to providing high-quality, accurate, and up-to-date content.',
      icon: <FaServer className="text-primary" size={40} />
    }
  ];

  return (
    <>
      <div className="tech-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <Container className="py-5 about-page">
        {/* Header Section */}
        <Row className="mb-5 text-center animate-fade-in">
          <Col>
            <h1 className="text-gradient mb-4">About Us</h1>
            <p className="lead text-muted mb-5">
              Discover the story, mission, and people behind Tech-Blog
            </p>
          </Col>
        </Row>
        
        {/* About Section */}
        <Row className="mb-5 align-items-center">
          <Col lg={6} className="mb-4 mb-lg-0 animate-fade-in">
            <h2 className="text-gradient mb-4">Our Story</h2>
            <p>
              Tech-Blog was born in 2020 from the passion of a group of engineers and technology enthusiasts who wanted to create a platform to share knowledge in the fields of electronics, programming, and new technologies.
            </p>
            <p>
              What started as a small personal blog has grown into a comprehensive resource for anyone interested in the world of microcontrollers, IoT, robotics, and software development.
            </p>
            <p>
              Today, Tech-Blog is a vibrant community of technology enthusiasts sharing ideas, projects, and innovative solutions.
            </p>
          </Col>
          <Col lg={6} className="animate-fade-in" style={{animationDelay: '0.2s'}}>
            <div className="position-relative border-glow rounded overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Tech workspace" 
                fluid 
                className="w-100"
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{opacity: 0.3}}></div>
            </div>
          </Col>
        </Row>
        
        {/* Mission Section */}
        <Row className="mb-5 align-items-center flex-lg-row-reverse">
          <Col lg={6} className="mb-4 mb-lg-0 animate-fade-in" style={{animationDelay: '0.3s'}}>
            <h2 className="text-gradient mb-4">Our Mission</h2>
            <p>
              Our mission is to make technology accessible to everyone by providing high-quality educational content that inspires, informs, and guides our readers.
            </p>
            <p>
              We believe that knowledge should be freely shared and that everyone should have the opportunity to learn and grow in the field of technology.
            </p>
            <p>
              We are committed to:
            </p>
            <ul>
              <li>Providing detailed tutorials and guides for all skill levels</li>
              <li>Sharing the latest news and trends in the world of technology</li>
              <li>Creating an inclusive community where enthusiasts can connect</li>
              <li>Inspiring the next generation of innovators and creators</li>
            </ul>
          </Col>
          <Col lg={6} className="animate-fade-in" style={{animationDelay: '0.4s'}}>
            <div className="position-relative border-glow rounded overflow-hidden">
              <Image 
                src="https://images.unsplash.com/photo-1573164713988-8665fc963095?ixlib=rb-1.2.1&auto=format&fit=crop&w=1350&q=80" 
                alt="Electronics workspace" 
                fluid 
                className="w-100"
              />
              <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark" style={{opacity: 0.3}}></div>
            </div>
          </Col>
        </Row>
        
        {/* Values Section */}
        <Row className="mb-5">
          <Col className="text-center mb-4 animate-fade-in" style={{animationDelay: '0.5s'}}>
            <h2 className="text-gradient mb-4">Our Values</h2>
            <p className="lead text-muted mb-5">
              Principles that guide our work and our community
            </p>
          </Col>
        </Row>
        
        <Row className="mb-5">
          {values.map((value, index) => (
            <Col md={6} lg={3} key={value.id} className="mb-4 animate-fade-in" style={{animationDelay: `${0.6 + index * 0.1}s`}}>
              <Card className="h-100 border-0 text-center">
                <Card.Body>
                  <div className="mb-3">
                    {value.icon}
                  </div>
                  <Card.Title className="text-gradient">{value.title}</Card.Title>
                  <Card.Text>{value.description}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Team Section */}
        <Row className="mb-4">
          <Col className="text-center mb-4 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <h2 className="text-gradient mb-4">Our Team</h2>
            <p className="lead text-muted mb-5">
              The creative minds behind Tech-Blog
            </p>
          </Col>
        </Row>
        
        <Row>
          {teamMembers.map((member, index) => (
            <Col md={4} key={member.id} className="mb-4 animate-fade-in" style={{animationDelay: `${0.9 + index * 0.1}s`}}>
              <Card className="h-100 border-0 text-center">
                <div className="mx-auto mt-4 position-relative" style={{width: '150px', height: '150px'}}>
                  <Image 
                    src={member.image} 
                    alt={member.name} 
                    roundedCircle 
                    className="border-glow" 
                    style={{width: '150px', height: '150px', objectFit: 'cover'}}
                  />
                </div>
                <Card.Body>
                  <Card.Title className="text-gradient">{member.name}</Card.Title>
                  <Card.Subtitle className="mb-3 text-muted">{member.role}</Card.Subtitle>
                  <Card.Text>{member.bio}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
        
        {/* Stats Section */}
        <Row className="mt-5 text-center">
          <Col className="mb-4 animate-fade-in" style={{animationDelay: '1.2s'}}>
            <h2 className="text-gradient mb-5">Tech-Blog in Numbers</h2>
          </Col>
        </Row>
        
        <Row className="text-center mb-5">
          <Col md={3} className="mb-4 animate-fade-in" style={{animationDelay: '1.3s'}}>
            <h2 className="text-gradient display-4">100+</h2>
            <p className="text-muted">Published Articles</p>
          </Col>
          <Col md={3} className="mb-4 animate-fade-in" style={{animationDelay: '1.4s'}}>
            <h2 className="text-gradient display-4">50K+</h2>
            <p className="text-muted">Monthly Readers</p>
          </Col>
          <Col md={3} className="mb-4 animate-fade-in" style={{animationDelay: '1.5s'}}>
            <h2 className="text-gradient display-4">30+</h2>
            <p className="text-muted">Open Source Projects</p>
          </Col>
          <Col md={3} className="mb-4 animate-fade-in" style={{animationDelay: '1.6s'}}>
            <h2 className="text-gradient display-4">10K+</h2>
            <p className="text-muted">Community Members</p>
          </Col>
        </Row>
      </Container>
    </>
  );
};

export default AboutPage; 