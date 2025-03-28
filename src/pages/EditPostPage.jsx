import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Badge, Alert } from 'react-bootstrap';
import { FaSave, FaTimes, FaImage, FaTags, FaCode, FaEye, FaArrowLeft, FaUpload, FaEdit, FaTrash } from 'react-icons/fa';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ApiService from '../services/api';

const EditPostPage = () => {
  const { id } = useParams();
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
  const [loadingPost, setLoadingPost] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimationComplete(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // Carica i dati del post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoadingPost(true);
        const response = await ApiService.getPost(id);
        
        if (response.success) {
          const post = response.data;
          setFormData({
            title: post.title || '',
            category: post.category || '',
            tags: post.tags ? post.tags.join(', ') : '',
            excerpt: post.excerpt || '',
            content: post.content || '',
            status: post.status || 'published'
          });
          
          if (post.coverImage) {
            setCoverImagePreview(post.coverImage);
          }
        } else {
          setError('Impossibile caricare il post: ' + (response.message || 'Errore sconosciuto'));
          setTimeout(() => {
            navigate('/blog');
          }, 3000);
        }
      } catch (err) {
        setError('Errore durante il caricamento del post: ' + (err.message || 'Errore sconosciuto'));
        console.error(err);
      } finally {
        setLoadingPost(false);
      }
    };
    
    fetchPost();
  }, [id, navigate]);

  // Verifica se l'utente è autenticato e ha il ruolo di autore o admin
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await ApiService.getMe();
        if (!response.success || !['author', 'admin'].includes(response.data.role)) {
          setError('Non hai i permessi per modificare i post');
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
      // Verifica che sia un'immagine
      if (!file.type.match('image.*')) {
        setError('Per favore seleziona un file immagine valido');
        return;
      }
      
      // Verifica la dimensione del file (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('L\'immagine è troppo grande. Massimo 5MB.');
        return;
      }
      
      // Crea un oggetto URL per l'anteprima
      const reader = new FileReader();
      reader.onloadend = () => {
        // Crea un'immagine per il ridimensionamento
        const img = new Image();
        img.onload = () => {
          // Crea un canvas per ridimensionare l'immagine
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Calcola le dimensioni ridotte mantenendo l'aspect ratio
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          
          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          
          // Imposta le dimensioni del canvas
          canvas.width = width;
          canvas.height = height;
          
          // Disegna l'immagine sul canvas
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Converte il canvas in un blob
          canvas.toBlob((blob) => {
            // Crea un nuovo file dalla blob con un nome più corto
            const resizedFile = new File([blob], 
              file.name.length > 30 
                ? file.name.substring(0, 30) 
                : file.name, 
              { type: 'image/jpeg' }
            );
            
            // Imposta l'immagine ridimensionata
            setCoverImage(resizedFile);
            setCoverImagePreview(canvas.toDataURL('image/jpeg'));
            console.log('Immagine ridimensionata:', resizedFile.size, 'bytes');
          }, 'image/jpeg', 0.85); // Qualità JPEG = 85%
        };
        
        // Carica l'immagine dal risultato del FileReader
        img.src = reader.result;
      };
      
      // Avvia la lettura del file
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
      
      // Aggiungi i campi base del form
      postData.append('title', formData.title);
      postData.append('category', formData.category);
      postData.append('content', formData.content);
      postData.append('excerpt', formData.excerpt || formData.content.substring(0, 150) + '...');
      postData.append('status', formData.status);
      
      // Gestione dei tag
      if (formData.tags) {
        const tagsArray = formData.tags.split(',').map(tag => tag.trim());
        postData.append('tags', JSON.stringify(tagsArray));
        console.log('Tags aggiunti:', tagsArray);
      }
      
      // Gestione dell'immagine
      if (coverImage) {
        console.log('Aggiungo coverImage al FormData:', coverImage.name, coverImage.type, coverImage.size);
        postData.append('coverImage', coverImage);
      } else if (coverImagePreview && !coverImagePreview.includes('blob:')) {
        // Se non c'è un nuovo file ma c'è una preview dall'URL
        console.log('Utilizzo URL esistente per coverImage:', coverImagePreview);
        postData.append('coverImage', coverImagePreview);
      }
      
      // Log per debugging
      console.log('FormData creato con i campi:');
      for (let pair of postData.entries()) {
        console.log(pair[0], ':', typeof pair[1] === 'object' ? `File: ${pair[1].name}` : pair[1]);
      }
      
      // Invia i dati al server
      const response = await ApiService.updatePost(id, postData);
      
      if (response.success) {
        setSuccess('Post aggiornato con successo!');
        setTimeout(() => {
          navigate(`/post/${id}`);
        }, 2000);
      } else {
        const errorMsg = response.message || 'Errore durante l\'aggiornamento del post';
        console.error('Error details:', response);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = 'Errore durante l\'aggiornamento del post: ' + (err.message || 'Errore sconosciuto');
      console.error('Exception details:', err);
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (window.confirm('Sei sicuro di voler annullare? Tutte le modifiche andranno perse.')) {
      navigate(`/post/${id}`);
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

  const handleDeletePost = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo post? Questa azione non può essere annullata.')) {
      try {
        setLoading(true);
        const response = await ApiService.deletePost(id);
        
        if (response.success) {
          setSuccess('Post eliminato con successo!');
          setTimeout(() => {
            navigate('/blog');
          }, 2000);
        } else {
          setError(response.message || 'Errore durante l\'eliminazione del post');
        }
      } catch (err) {
        setError('Errore durante l\'eliminazione del post: ' + (err.message || 'Errore sconosciuto'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
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

  if (loadingPost) {
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
      
      <Container className="py-5 edit-post-page">
        <Link to={`/post/${id}`} className="btn btn-outline-primary mb-4 btn-hover-effect">
          <FaArrowLeft className="me-2" /> Torna al Post
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
              <h1 className="text-gradient">Modifica post</h1>
              <p className="lead text-muted">Aggiorna il tuo post e condividilo con la community tech</p>
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
                        <FaTags className="me-2 text-primary" /> Tag (separati da virgola)
                      </Form.Label>
                      <Form.Control
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                        placeholder="es. arduino, sensori, tutorial"
                        className="bg-dark text-light border-0"
                      />
                      {parsedTags.length > 0 && (
                        <div className="mt-2">
                          {parsedTags.map((tag, index) => (
                            <Badge 
                              bg="secondary" 
                              key={index} 
                              className="me-1 mb-1"
                            >
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
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
                          <FaUpload className="me-2" /> Carica nuova immagine
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
                        <FaEdit className="me-2 text-primary" /> Estratto
                      </Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        name="excerpt"
                        value={formData.excerpt}
                        onChange={handleChange}
                        placeholder="Breve descrizione del post (max 200 caratteri)"
                        maxLength={200}
                        className="bg-dark text-light border-0"
                      />
                      <Form.Text className="text-muted">
                        Se non specificato, verrà generato automaticamente dai primi 150 caratteri del contenuto.
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
                      <div>
                        <Button 
                          variant="outline-danger" 
                          onClick={handleCancel}
                          className="btn-hover-effect me-2"
                          disabled={loading}
                        >
                          <FaTimes className="me-2" /> Annulla
                        </Button>
                        
                        <Button 
                          variant="danger" 
                          onClick={handleDeletePost}
                          className="btn-hover-effect"
                          disabled={loading}
                        >
                          <FaTrash className="me-2" /> Elimina post
                        </Button>
                      </div>
                      
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
                          <FaSave className="me-2" /> Salva come bozza
                        </Button>
                        
                        <Button 
                          type="submit" 
                          variant="primary"
                          className="btn-glow"
                          disabled={loading || !formData.title || !formData.category || !formData.content}
                        >
                          {loading ? 'Aggiornamento...' : (
                            <><FaSave className="me-2" /> Aggiorna post</>
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

export default EditPostPage; 