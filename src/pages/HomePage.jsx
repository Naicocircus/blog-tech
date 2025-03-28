import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';

const HomePage = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Carica i post dal backend
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await ApiService.getPosts({
          limit: 3,
          sortBy: 'createdAt',
          sortOrder: 'desc',
          status: 'published'
        });

        if (response.success && response.data) {
          setFeaturedPosts(response.data);
        } else {
          setError('Errore nel caricamento dei post');
        }
      } catch (err) {
        setError('Errore durante il recupero dei post');
        console.error('Error fetching posts:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  // Add fade-in animation to elements when the page loads
  useEffect(() => {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach((element, index) => {
      setTimeout(() => {
        element.classList.add('fade-in');
      }, 100 * index);
    });
  }, []);

  return (
    <Container className="py-5">
      <div className="home-page">
        <div className="jumbotron bg-light p-5 rounded mb-5 animate-fade-in position-relative overflow-hidden">
          {/* Animated background elements */}
          <div className="tech-circles">
            <div className="circle circle-1"></div>
            <div className="circle circle-2"></div>
            <div className="circle circle-3"></div>
          </div>
          
          <h1 className="display-4 fw-bold">Welcome to <span className="text-gradient">Tech-Blog</span></h1>
          <p className="lead">
            Your reference portal for the world of electronics, Arduino, Raspberry Pi and much more.
          </p>
          <hr className="my-4" />
          <p>
            Explore our articles, tutorials and guides to stay updated on the latest news in the field of technology.
          </p>
          <Button variant="primary" as={Link} to="/blog" className="btn-glow">
            Explore the Blog
            <i className="ms-2 bi bi-arrow-right"></i>
          </Button>
        </div>

        <h2 className="mb-4 text-gradient animate-fade-in">Featured Posts</h2>
        <Row>
          {loading ? (
            <Col>
              <p className="text-center">Caricamento post...</p>
            </Col>
          ) : error ? (
            <Col>
              <p className="text-center text-danger">{error}</p>
            </Col>
          ) : featuredPosts.length > 0 ? (
            featuredPosts.map((post, index) => (
              <Col md={4} key={post._id} className="mb-4">
                <Card className="animate-fade-in h-100" style={{animationDelay: `${index * 150}ms`}}>
                  <div className="card-img-wrapper">
                    <Card.Img 
                      variant="top" 
                      src={post.coverImage || 'https://picsum.photos/300/200'} 
                      alt={post.title}
                    />
                    <div className="card-img-overlay-gradient"></div>
                  </div>
                  <Card.Body>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.excerpt}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                      <Button 
                        variant="outline-primary" 
                        size="sm" 
                        as={Link} 
                        to={`/post/${post._id}`} 
                        className="btn-hover-effect"
                      >
                        Read more
                      </Button>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))
          ) : (
            <Col>
              <p className="text-center">Nessun post disponibile</p>
            </Col>
          )}
        </Row>

        <div className="text-center mt-5 animate-fade-in">
          <Button variant="primary" as={Link} to="/blog" className="btn-lg btn-glow">
            View all posts
            <i className="ms-2 bi bi-grid-3x3-gap"></i>
          </Button>
        </div>
      </div>
    </Container>
  );
};

export default HomePage; 