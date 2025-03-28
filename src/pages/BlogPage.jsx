import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Alert } from 'react-bootstrap';
import { FaArrowRight, FaMicrochip, FaCode, FaRobot, FaTools, FaBrain, FaWifi, FaCalendarAlt } from 'react-icons/fa';
import ApiService from '../services/api';
import SearchBar from '../components/SearchBar';
import Pagination from '../components/Pagination';

const BlogPage = () => {
  // Stati per la ricerca e i filtri
  const [searchParams, setSearchParams] = useState({
    searchTerm: '',
    category: '',
    tags: '',
    sortBy: 'createdAt',
    sortOrder: 'desc',
    fromDate: null,
    toDate: null,
    status: 'published'
  });
  
  // Stati per i dati e lo stato dell'UI
  const [animatedItems, setAnimatedItems] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });
  const [suggestions, setSuggestions] = useState([]);
  const [availableCategories] = useState([
    'Microcontrollers',
    'Programming',
    'Robotics',
    'Artificial Intelligence',
    'IoT',
    'Hardware',
    'Software',
    'Other'
  ]);

  // Fetch posts from backend with filters
  const fetchPosts = async (page = 1) => {
    try {
      setLoading(true);
      
      // Costruisci i parametri di ricerca
      const params = {
        page,
        limit: pagination.limit,
        sortBy: searchParams.sortBy,
        sortOrder: searchParams.sortOrder,
        status: 'published'
      };
      
      // Aggiungi i filtri se presenti
      if (searchParams.searchTerm) params.search = searchParams.searchTerm;
      if (searchParams.category) params.category = searchParams.category;
      if (searchParams.tags) params.tags = searchParams.tags;
      if (searchParams.fromDate) params.fromDate = searchParams.fromDate.toISOString();
      if (searchParams.toDate) params.toDate = searchParams.toDate.toISOString();
      
      console.log('Fetching posts with params:', params);
      
      const response = await ApiService.getPosts(params);
      console.log('API Response Structure:', response);
      
      if (response.success) {
        setPosts(Array.isArray(response.data) ? response.data : []);
        setPagination({
          ...pagination,
          page,
          total: response.total || 0,
          pages: response.pages || 0
        });
        setSuggestions(Array.isArray(response.suggestions) ? response.suggestions : []);
      } else {
        setError('Errore nel recupero dei post: ' + response.message);
        console.error('Errore nella risposta:', response);
      }
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Errore durante la connessione al server: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Carica i post all'avvio
  useEffect(() => {
    fetchPosts();
  }, []);

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedItems(posts.map(post => post._id));
    }, 100);
    return () => clearTimeout(timer);
  }, [posts]);

  // Gestisci la ricerca
  const handleSearch = (params) => {
    setSearchParams(params);
    fetchPosts(1); // Resetta alla prima pagina quando si effettua una nuova ricerca
  };

  // Gestisci il cambio pagina
  const handlePageChange = (newPage) => {
    fetchPosts(newPage);
  };

  // Get category icon
  const getCategoryIcon = (category) => {
    switch(category.toLowerCase()) {
      case 'microcontrollers':
        return <FaMicrochip />;
      case 'programming':
        return <FaCode />;
      case 'robotics':
        return <FaRobot />;
      case 'artificial intelligence':
        return <FaBrain />;
      case 'iot':
        return <FaWifi />;
      case 'hardware':
        return <FaTools />;
      default:
        return null;
    }
  };

  if (loading && posts.length === 0) {
    return (
      <Container className="py-5 text-center">
        <h2>Caricamento post...</h2>
      </Container>
    );
  }

  return (
    <>
      <div className="tech-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <Container className="py-5 blog-page fade-in">
        <Row className="mb-4">
          <Col>
            <h1 className="text-gradient mb-4">Blog</h1>
            <p className="lead text-muted">Esplora gli ultimi articoli su elettronica, programmazione e tecnologia</p>
          </Col>
        </Row>
        
        <Row className="mb-4">
          <Col md={12} lg={10} className="mx-auto">
            <SearchBar 
              onSearch={handleSearch}
              suggestions={suggestions}
              availableCategories={availableCategories}
              initialValues={searchParams}
            />
          </Col>
        </Row>
        
        {error && (
          <Alert variant="danger" className="mb-4">
            {error}
          </Alert>
        )}
        
        {loading && posts.length > 0 && (
          <div className="text-center mb-4">
            <p>Aggiornamento risultati...</p>
          </div>
        )}
        
        <Row>
          {posts.length > 0 ? (
            posts.map((post, index) => (
              <Col md={6} lg={4} className="mb-4" key={post._id}>
                <Card 
                  className={`h-100 border-0 ${animatedItems.includes(post._id) ? 'fade-in' : ''}`} 
                  style={{ 
                    animationDelay: `${index * 0.1}s`,
                    opacity: animatedItems.includes(post._id) ? 1 : 0,
                    transform: animatedItems.includes(post._id) ? 'translateY(0)' : 'translateY(20px)',
                    transition: 'opacity 0.5s ease, transform 0.5s ease'
                  }}
                >
                  <div className="card-img-wrapper">
                    <Card.Img variant="top" src={post.coverImage || 'https://picsum.photos/800/400'} alt={post.title} />
                    <div className="card-img-overlay-gradient"></div>
                  </div>
                  <Card.Body>
                    <div className="d-flex align-items-center mb-2">
                      <Badge bg="primary" className="me-2">
                        {getCategoryIcon(post.category)} {post.category}
                      </Badge>
                      <small className="text-muted">
                        <FaCalendarAlt className="me-1" />
                        {new Date(post.createdAt).toLocaleDateString()}
                      </small>
                    </div>
                    <Card.Title>{post.title}</Card.Title>
                    <Card.Text>{post.excerpt}</Card.Text>
                    <div className="d-flex justify-content-between align-items-center">
                      <small className="text-muted">
                        {post.author && post.author.name ? `Di ${post.author.name}` : 'Autore sconosciuto'}
                      </small>
                      <Link to={`/post/${post._id}`} className="btn btn-sm btn-outline-primary btn-hover-effect">
                        Leggi di più <FaArrowRight className="ms-1" />
                      </Link>
                    </div>
                  </Card.Body>
                  <Card.Footer className="bg-transparent">
                    <div>
                      {post.tags && post.tags.map(tag => (
                        <Badge 
                          bg="secondary" 
                          className="me-1 mb-1 clickable" 
                          key={tag}
                          style={{ opacity: 0.7, cursor: 'pointer' }}
                          onClick={() => {
                            handleSearch({
                              ...searchParams,
                              tags: tag
                            });
                          }}
                        >
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </Card.Footer>
                </Card>
              </Col>
            ))
          ) : (
            <Col className="text-center py-5">
              <h3 className="text-muted">Nessun post trovato</h3>
              <p>Prova a modificare i criteri di ricerca</p>
            </Col>
          )}
        </Row>
        
        <Pagination 
          currentPage={pagination.page} 
          totalPages={pagination.pages} 
          onPageChange={handlePageChange} 
        />
      </Container>
    </>
  );
};

export default BlogPage; 