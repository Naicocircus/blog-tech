import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import { FaSave, FaTimes, FaImage, FaTags, FaCode, FaEye, FaArrowLeft, FaUpload, FaEdit } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    tags: '',
    excerpt: '',
    content: '',
    status: 'published'
  });
  const [coverImage, setCoverImage] = useState(null);
  const [coverImagePreview, setCoverImagePreview] = useState('');
  const [preview, setPreview] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Verifica se l'utente è autenticato e ha il ruolo di autore o admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await ApiService.getMe();
        if (!response.success || !['author', 'admin'].includes(response.data.role)) {
          setError('Non hai i permessi per creare post');
          setTimeout(() => {
            navigate('/');
          }, 3000);
        }
      } catch (err) {
        setError('Errore di autenticazione');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    };
    
    checkAuth();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setCoverImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setCoverImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Prepara i dati del post
      const postData = new FormData();
      postData.append('title', formData.title);
      postData.append('category', formData.category);
      postData.append('content', formData.content);
      postData.append('excerpt', formData.excerpt);
      postData.append('status', formData.status);
      
      // Gestione dei tag
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
        postData.append('tags', JSON.stringify(tagsArray));
      }
      
      // Aggiungi l'immagine di copertina solo se è stata caricata
      if (coverImage instanceof File) {
        postData.append('image', coverImage);
      }
      
      // Invia i dati al server
      const response = await ApiService.createPost(postData);
      
      if (response.success) {
        setSuccess('Post creato con successo!');
        setTimeout(() => {
          navigate(`/post/${response.data._id}`);
        }, 2000);
      } else {
        setError(response.message || 'Errore durante la creazione del post');
      }
    } catch (err) {
      setError('Errore durante la creazione del post: ' + (err.message || 'Errore sconosciuto'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Sei sicuro di voler annullare? Tutte le modifiche andranno perse.')) {
      navigate('/blog');
    }
  };

  const togglePreview = () => {
    setPreview(!preview);
  };

  const handleSaveDraft = async () => {
    setFormData({
      ...formData,
      status: 'draft'
    });
    
    // Attendi che lo stato sia aggiornato prima di inviare il form
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 0);
  };

  // Categories for the dropdown
  const categories = [
    'Microcontrollers',
    'Programming',
    'Robotics',
    'IoT',
    'Artificial Intelligence',
    'Electronics',
    'Tutorials',
    'Hardware',
    'Software',
    'Other'
  ];

  // Parse tags from comma-separated string to array
  const parsedTags = formData.tags ? formData.tags.split(',').map(tag => tag.trim()) : [];

  return (
    <>
      <div className="tech-circles">
        <div className="circle circle-1"></div>
        <div className="circle circle-2"></div>
        <div className="circle circle-3"></div>
      </div>
      
      <Container className="py-5 create-post-page">
        <Link to="/blog" className="btn btn-outline-primary mb-4 btn-hover-effect">
          <FaArrowLeft className="me-2" /> Torna al Blog
        </Link>
        
        {error && (
          <Alert variant="danger" className="mb-4 fade-in">
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert variant="success" className="mb-4 fade-in">
            {success}
          </Alert>
        )}
        
        <div 
          className={`fade-in ${animationComplete ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
        >
          <Row className="mb-4">
            <Col>
              <h1 className="text-gradient">Crea un nuovo post</h1>
              <p className="lead text-muted">Condividi le tue conoscenze e intuizioni con la community tech</p>
            </Col>
          </Row>
          
          <Row>
            <Col lg={preview ? 6 : 12}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaEdit className="me-2 text-primary" /> Titolo *
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        placeholder="Inserisci il titolo del post"
                        required
                        className="bg-dark text-light border-0"
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaCode className="me-2 text-primary" /> Categoria *
                      </Form.Label>
                      <Form.Select
                        name="category"
                        value={formData.category}
                        onChange={handleChange}
                        required
                        className="bg-dark text-light border-0"
                      >
                        <option value="">Seleziona una categoria</option>
                        {categories.map((category, index) => (
                          <option key={index} value={category}>{category}</option>
                        ))}
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaTags className="me-2 text-primary" /> Tags
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="Inserisci i tag separati da virgola (es: javascript, react, web)"
                        className="bg-dark text-light border-0"
                      />
                      <Form.Text className="text-muted">
                        Separa i tag con una virgola
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaImage className="me-2 text-primary" /> Immagine di copertina
                      </Form.Label>
                      <div className="d-flex align-items-center">
                        <Form.Control
                          type="file"
                          accept="image/*"
                          onChange={handleImageChange}
                          className="bg-dark text-light border-0"
                          style={{ display: 'none' }}
                          id="coverImageInput"
                        />
                        <Button 
                          variant="outline-primary" 
                          onClick={() => document.getElementById('coverImageInput').click()}
                          className="btn-hover-effect"
                        >
                          <FaUpload className="me-2" /> Carica immagine
                        </Button>
                        {coverImagePreview && (
                          <span className="ms-3 text-light">
                            Immagine selezionata
                          </span>
                        )}
                      </div>
                      {coverImagePreview && (
                        <div className="mt-2 border-glow" style={{ maxHeight: '200px', overflow: 'hidden', borderRadius: '10px' }}>
                          <img 
                            src={coverImagePreview} 
                            alt="Preview" 
                            className="img-fluid w-100" 
                            style={{ objectFit: 'cover' }}
                          />
                        </div>
                      )}
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaEdit className="me-2 text-primary" /> Excerpt (Breve descrizione) *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={2}
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        placeholder="Inserisci una breve descrizione del post (max 200 caratteri)"
                        required
                        maxLength={200}
                        className="bg-dark text-light border-0"
                      />
                      <Form.Text className="text-muted">
                        {formData.excerpt.length}/200 caratteri
                      </Form.Text>
                    </Form.Group>
                    
                    <Form.Group className="mb-4">
                      <Form.Label className="d-flex align-items-center">
                        <FaCode className="me-2 text-primary" /> Contenuto *
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={10}
                        name="content"
                        value={formData.content}
                        onChange={handleChange}
                        placeholder="Scrivi il contenuto del tuo post..."
                        required
                        className="bg-dark text-light border-0"
                      />
                      <Form.Text className="text-muted">
                        Puoi usare tag HTML per formattare il tuo contenuto.
                      </Form.Text>
                    </Form.Group>
                    
                    <div className="d-flex justify-content-between mt-4">
                      <Button 
                        variant="outline-danger" 
                        onClick={handleCancel}
                        className="btn-hover-effect"
                        disabled={loading}
                      >
                        <FaTimes className="me-2" /> Annulla
                      </Button>
                      
                      <div>
                        <Button 
                          type="button" 
                          variant="outline-primary" 
                          className="me-2 btn-hover-effect"
                          onClick={togglePreview}
                        >
                          <FaEye className="me-2" /> {preview ? 'Nascondi anteprima' : 'Anteprima'}
                        </Button>
                        
                        <Button 
                          type="button" 
                          variant="outline-secondary"
                          className="me-2 btn-hover-effect"
                          onClick={handleSaveDraft}
                          disabled={loading || !formData.title || !formData.category || !formData.content}
                        >
                          <FaSave className="me-2" /> Salva bozza
                        </Button>
                        
                        <Button 
                          type="submit" 
                          variant="primary"
                          className="btn-glow"
                          disabled={loading || !formData.title || !formData.category || !formData.content}
                        >
                          {loading ? 'Pubblicazione...' : (
                            <><FaSave className="me-2" /> Pubblica post</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
            
            {preview && (
              <Col lg={6}>
                <Card className="border-0 shadow-sm mb-4 fade-in">
                  <Card.Header className="bg-dark border-0">
                    <h4 className="mb-0">Anteprima</h4>
                  </Card.Header>
                  {coverImagePreview && (
                    <div style={{ height: '200px', overflow: 'hidden' }}>
                      <img 
                        src={coverImagePreview} 
                        alt={formData.title} 
                        className="img-fluid w-100" 
                        style={{ objectFit: 'cover' }}
                      />
                    </div>
                  )}
                  <Card.Body>
                    <h2>{formData.title || 'Titolo del post'}</h2>
                    
                    {formData.category && (
                      <Badge bg="primary" className="me-2 mb-3">
                        {formData.category}
                      </Badge>
                    )}
                    
                    {parsedTags.length > 0 && parsedTags.map((tag, index) => (
                      <Badge 
                        bg="secondary" 
                        key={index} 
                        className="me-1 mb-3"
                      >
                        {tag}
                      </Badge>
                    ))}
                    
                    <div className="mt-3">
                      <p className="lead">
                        {formData.excerpt || (formData.content ? formData.content.substring(0, 150) + '...' : 'Estratto del post')}
                      </p>
                      
                      <hr />
                      
                      <div 
                        className="post-content"
                        dangerouslySetInnerHTML={{ __html: formData.content || 'Contenuto del post' }}
                      />
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            )}
          </Row>
        </div>
      </Container>
    </>
  );
};

export default CreatePostPage; 