import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Badge, Form, Button, Image, Alert } from 'react-bootstrap';
import { FaUser, FaCalendarAlt, FaTag, FaHeart, FaComment, FaShare, FaArrowLeft, FaEdit, FaTrash } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ApiService from '../services/api';
import ReactionButtons from '../components/ReactionButtons';
import ShareButtons from '../components/ShareButtons';
import ShareLinkModal from '../components/ShareLinkModal';
import '../styles/ShareButtons.css';

const PostDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [animationComplete, setAnimationComplete] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [comments, setComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [commentSuccess, setCommentSuccess] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [editingComment, setEditingComment] = useState(null);
  const [editCommentContent, setEditCommentContent] = useState('');
  const [showShareModal, setShowShareModal] = useState(false);
  const [shareStats, setShareStats] = useState(null);
  
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
        setLoading(true);
        const response = await ApiService.getPost(id);
        
        if (response.success) {
          setPost(response.data);
          setLikeCount(response.data.likes || 0);
        } else {
          setError('Impossibile caricare il post: ' + (response.message || 'Errore sconosciuto'));
        }
      } catch (err) {
        setError('Errore durante il caricamento del post: ' + (err.message || 'Errore sconosciuto'));
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  // Carica i commenti del post
  useEffect(() => {
    const fetchComments = async () => {
      if (!id) return;
      
      try {
        setLoadingComments(true);
        const response = await ApiService.getComments(id);
        
        if (response.success) {
          setComments(response.data.comments || []);
        } else {
          setCommentError('Impossibile caricare i commenti: ' + (response.message || 'Errore sconosciuto'));
        }
      } catch (err) {
        setCommentError('Errore durante il caricamento dei commenti: ' + (err.message || 'Errore sconosciuto'));
        console.error(err);
      } finally {
        setLoadingComments(false);
      }
    };
    
    fetchComments();
  }, [id]);

  // Verifica se l'utente è autenticato
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await ApiService.getMe();
        if (response.success) {
          setCurrentUser(response.data);
        }
      } catch (err) {
        console.error('Errore durante il controllo dell\'autenticazione:', err);
      }
    };
    
    checkAuth();
  }, []);

  // Caricamento delle statistiche di condivisione
  useEffect(() => {
    const fetchShareStats = async () => {
      if (!post?._id) return;
      
      try {
        const response = await ApiService.getShareStats(post._id);
        if (response.success) {
          setShareStats(response.data);
        }
      } catch (error) {
        console.error('Errore nel caricamento delle statistiche di condivisione:', error);
      }
    };
    
    fetchShareStats();
  }, [post]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    setCommentError('');
    setCommentSuccess('');
    
    if (!comment.trim()) return;
    
    try {
      const commentData = {
        content: comment,
        parentComment: replyTo
      };
      
      const response = await ApiService.createComment(id, commentData);
      
      if (response.success) {
        setCommentSuccess('Commento aggiunto con successo!');
        setComment('');
        setReplyTo(null);
        
        // Aggiorna la lista dei commenti
        if (replyTo) {
          // Se è una risposta, aggiorna il commento padre
          const updatedComments = comments.map(c => {
            if (c._id === replyTo) {
              return {
                ...c,
                replies: [...(c.replies || []), response.data]
              };
            }
            return c;
          });
          setComments(updatedComments);
        } else {
          // Se è un nuovo commento, aggiungilo alla lista
          setComments([response.data, ...comments]);
        }
        
        // Nascondi il messaggio di successo dopo 3 secondi
        setTimeout(() => {
          setCommentSuccess('');
        }, 3000);
      } else {
        setCommentError(response.message || 'Errore durante l\'invio del commento');
      }
    } catch (err) {
      setCommentError('Errore durante l\'invio del commento: ' + (err.message || 'Errore sconosciuto'));
      console.error(err);
    }
  };

  const handleReply = (commentId) => {
    setReplyTo(commentId);
    setEditingComment(null);
    
    // Scorri fino al form dei commenti
    document.getElementById('comment-form').scrollIntoView({ behavior: 'smooth' });
  };

  const handleCancelReply = () => {
    setReplyTo(null);
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment._id);
    setEditCommentContent(comment.content);
    setReplyTo(null);
  };

  const handleCancelEdit = () => {
    setEditingComment(null);
    setEditCommentContent('');
  };

  const handleUpdateComment = async (commentId) => {
    setCommentError('');
    setCommentSuccess('');
    
    if (!editCommentContent.trim()) return;
    
    try {
      const response = await ApiService.updateComment(commentId, editCommentContent);
      
      if (response.success) {
        setCommentSuccess('Commento aggiornato con successo!');
        
        // Aggiorna la lista dei commenti
        const updatedComments = comments.map(c => {
          if (c._id === commentId) {
            return {
              ...c,
              content: editCommentContent
            };
          }
          
          // Controlla anche nelle risposte
          if (c.replies && c.replies.length > 0) {
            const updatedReplies = c.replies.map(r => {
              if (r._id === commentId) {
                return {
                  ...r,
                  content: editCommentContent
                };
              }
              return r;
            });
            
            return {
              ...c,
              replies: updatedReplies
            };
          }
          
          return c;
        });
        
        setComments(updatedComments);
        setEditingComment(null);
        setEditCommentContent('');
        
        // Nascondi il messaggio di successo dopo 3 secondi
        setTimeout(() => {
          setCommentSuccess('');
        }, 3000);
      } else {
        setCommentError(response.message || 'Errore durante l\'aggiornamento del commento');
      }
    } catch (err) {
      setCommentError('Errore durante l\'aggiornamento del commento: ' + (err.message || 'Errore sconosciuto'));
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Sei sicuro di voler eliminare questo commento?')) return;
    
    setCommentError('');
    setCommentSuccess('');
    
    try {
      const response = await ApiService.deleteComment(commentId);
      
      if (response.success) {
        setCommentSuccess('Commento eliminato con successo!');
        
        // Aggiorna la lista dei commenti
        const updatedComments = comments.filter(c => c._id !== commentId);
        setComments(updatedComments);
        
        // Nascondi il messaggio di successo dopo 3 secondi
        setTimeout(() => {
          setCommentSuccess('');
        }, 3000);
      } else {
        setCommentError(response.message || 'Errore durante l\'eliminazione del commento');
      }
    } catch (err) {
      setCommentError('Errore durante l\'eliminazione del commento: ' + (err.message || 'Errore sconosciuto'));
      console.error(err);
    }
  };

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(likeCount - 1);
    } else {
      setLikeCount(likeCount + 1);
    }
    setIsLiked(!isLiked);
  };

  const handleEdit = () => {
    navigate(`/edit-post/${id}`);
  };

  const handleDelete = async () => {
    if (window.confirm('Sei sicuro di voler eliminare questo post? Questa azione non può essere annullata.')) {
      try {
        const response = await ApiService.deletePost(id);
        
        if (response.success) {
          alert('Post eliminato con successo!');
          navigate('/blog');
        } else {
          setError(response.message || 'Errore durante l\'eliminazione del post');
        }
      } catch (err) {
        setError('Errore durante l\'eliminazione del post: ' + (err.message || 'Errore sconosciuto'));
        console.error(err);
      }
    }
  };

  // Verifica se l'utente corrente è l'autore del post o un admin
  const canEditPost = () => {
    if (!currentUser || !post) return false;
    
    return (
      currentUser.role === 'admin' || 
      (post.author && post.author._id === currentUser._id)
    );
  };

  // Verifica se l'utente corrente è l'autore del commento o un admin
  const canEditComment = (comment) => {
    if (!currentUser || !comment) return false;
    
    return (
      currentUser.role === 'admin' || 
      (comment.author && comment.author._id === currentUser._id)
    );
  };

  // Funzione per aggiornare le statistiche dopo una condivisione
  const updateShareStats = async () => {
    if (!post?._id) return;
    
    try {
      const response = await ApiService.getShareStats(post._id);
      if (response.success) {
        setShareStats(response.data);
      }
    } catch (error) {
      console.error('Errore nell\'aggiornamento delle statistiche di condivisione:', error);
    }
  };

  if (loading) {
    return (
      <Container className="py-5 text-center">
        <h2>Caricamento post...</h2>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-5">
        <Alert variant="danger">{error}</Alert>
        <Link to="/blog" className="btn btn-primary mt-3">
          <FaArrowLeft className="me-2" /> Torna al Blog
        </Link>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container className="py-5 post-detail-page">
        <div className="text-center">
          <h2>Post non trovato</h2>
          <Link to="/blog" className="btn btn-primary mt-3">
            <FaArrowLeft className="me-2" /> Torna al Blog
          </Link>
        </div>
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
      
      <ShareLinkModal 
        show={showShareModal}
        onHide={() => setShowShareModal(false)}
        url={window.location.href}
        title={post?.title}
        postId={post?._id}
        onShareComplete={updateShareStats}
      />
      
      <Container className="py-5 post-detail-page">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <Link to="/blog" className="btn btn-outline-primary btn-hover-effect">
            <FaArrowLeft className="me-2" /> Torna al Blog
          </Link>
          
          <div className="d-flex gap-2">
            <Button 
              variant="outline-primary" 
              className="btn-hover-effect"
              onClick={() => setShowShareModal(true)}
            >
              <FaShare className="me-2" /> Condividi
            </Button>
            
            {canEditPost() && (
              <>
                <Button 
                  variant="outline-primary" 
                  className="btn-hover-effect"
                  onClick={handleEdit}
                >
                  <FaEdit className="me-2" /> Modifica
                </Button>
                <Button 
                  variant="outline-danger" 
                  className="btn-hover-effect"
                  onClick={handleDelete}
                >
                  <FaTrash className="me-2" /> Elimina
                </Button>
              </>
            )}
          </div>
        </div>
        
        <div 
          className={`fade-in ${animationComplete ? 'opacity-100' : 'opacity-0'}`}
          style={{ transition: 'opacity 0.5s ease, transform 0.5s ease' }}
        >
          <Row className="mb-4">
            <Col>
              <div className="position-relative mb-4">
                <Image 
                  src={post.coverImage || 'https://picsum.photos/1080/720'} 
                  alt={post.title} 
                  fluid 
                  className="w-100 border-glow" 
                  style={{ 
                    height: '400px', 
                    objectFit: 'cover', 
                    borderRadius: '15px',
                  }}
                  onError={(e) => {
                    e.target.src = 'https://picsum.photos/1080/720';
                  }}
                />
                <div 
                  className="position-absolute bottom-0 start-0 w-100 p-4"
                  style={{ 
                    background: 'linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(0,0,0,0) 100%)',
                    borderRadius: '0 0 15px 15px'
                  }}
                >
                  <div className="d-flex gap-3 mb-2">
                    <Badge bg="primary" className="d-flex align-items-center">
                      <FaTag className="me-1" /> {post.category}
                    </Badge>
                    {post.tags && post.tags.map(tag => (
                      <Badge bg="secondary" key={tag} style={{ opacity: 0.8 }}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <h1 className="text-white">{post.title}</h1>
                  <div className="d-flex text-light mt-2">
                    <div className="me-3">
                      <FaUser className="me-1" /> {post.author ? post.author.name : 'Autore sconosciuto'}
                    </div>
                    <div>
                      <FaCalendarAlt className="me-1" /> {new Date(post.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </div>
            </Col>
          </Row>
          
          <Row>
            <Col lg={8}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <div 
                    className="post-content"
                    dangerouslySetInnerHTML={{ __html: post.content }}
                  />
                  
                  <div className="d-flex justify-content-between align-items-center mt-4 pt-4 border-top">
                    <div className="d-flex gap-3">
                      <ReactionButtons 
                        postId={id} 
                        onReactionChange={(data) => {
                          if (data.type === 'like') {
                            setLikeCount(data.likesCount);
                            setIsLiked(data.liked);
                          }
                        }}
                      />
                      <Button variant="outline-primary" className="d-flex align-items-center btn-hover-effect">
                        <FaComment className="me-2" /> {post.comments ? post.comments.length : 0}
                      </Button>
                    </div>
                    <ShareButtons 
                      url={window.location.href} 
                      title={post?.title}
                      postId={post?._id}
                      onShareComplete={updateShareStats}
                    />
                  </div>
                </Card.Body>
              </Card>
              
              <h3 className="mb-4 text-gradient">Commenti ({comments.length})</h3>
              
              {commentError && (
                <Alert variant="danger" className="mb-4">
                  {commentError}
                </Alert>
              )}
              
              {commentSuccess && (
                <Alert variant="success" className="mb-4">
                  {commentSuccess}
                </Alert>
              )}
              
              {loadingComments ? (
                <div className="text-center py-4">
                  <p>Caricamento commenti...</p>
                </div>
              ) : comments.length === 0 ? (
                <Card className="border-0 shadow-sm mb-4">
                  <Card.Body className="text-center py-4">
                    <p className="mb-0">Non ci sono ancora commenti. Sii il primo a commentare!</p>
                  </Card.Body>
                </Card>
              ) : (
                comments.map((comment, index) => (
                  <div key={comment._id} className="mb-4">
                    <Card 
                      className="border-0 shadow-sm mb-2 fade-in"
                      style={{ 
                        animationDelay: `${0.3 + index * 0.1}s`,
                      }}
                    >
                      <Card.Body>
                        {editingComment === comment._id ? (
                          <Form className="mb-3">
                            <Form.Group>
                              <Form.Control
                                as="textarea"
                                rows={3}
                                value={editCommentContent}
                                onChange={(e) => setEditCommentContent(e.target.value)}
                                className="bg-dark text-light border-0 mb-2"
                              />
                            </Form.Group>
                            <div className="d-flex gap-2">
                              <Button 
                                variant="primary" 
                                size="sm"
                                onClick={() => handleUpdateComment(comment._id)}
                                disabled={!editCommentContent.trim()}
                              >
                                Salva
                              </Button>
                              <Button 
                                variant="outline-secondary" 
                                size="sm"
                                onClick={handleCancelEdit}
                              >
                                Annulla
                              </Button>
                            </div>
                          </Form>
                        ) : (
                          <>
                            <div className="d-flex justify-content-between mb-2">
                              <div className="d-flex align-items-center">
                                <Image 
                                  src={comment.author.avatar || 'https://picsum.photos/40'} 
                                  alt={comment.author.name} 
                                  roundedCircle 
                                  width={40} 
                                  height={40} 
                                  className="me-2"
                                  style={{ objectFit: 'cover' }}
                                  onError={(e) => {
                                    e.target.src = 'https://picsum.photos/40';
                                  }}
                                />
                                <h5 className="mb-0">{comment.author.name}</h5>
                              </div>
                              <small className="text-muted">{new Date(comment.createdAt).toLocaleDateString()}</small>
                            </div>
                            <p className="mb-2">{comment.content}</p>
                            <div className="d-flex gap-2">
                              {currentUser && (
                                <Button 
                                  variant="link" 
                                  className="p-0 text-primary"
                                  onClick={() => handleReply(comment._id)}
                                >
                                  Rispondi
                                </Button>
                              )}
                              {canEditComment(comment) && (
                                <>
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-primary"
                                    onClick={() => handleEditComment(comment)}
                                  >
                                    Modifica
                                  </Button>
                                  <Button 
                                    variant="link" 
                                    className="p-0 text-danger"
                                    onClick={() => handleDeleteComment(comment._id)}
                                  >
                                    Elimina
                                  </Button>
                                </>
                              )}
                            </div>
                          </>
                        )}
                      </Card.Body>
                    </Card>
                    
                    {/* Risposte ai commenti */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="ms-4 mt-2">
                        {comment.replies.map((reply, replyIndex) => (
                          <Card 
                            key={reply._id} 
                            className="border-0 shadow-sm mb-2 fade-in"
                            style={{ 
                              animationDelay: `${0.4 + replyIndex * 0.1}s`,
                            }}
                          >
                            <Card.Body>
                              {editingComment === reply._id ? (
                                <Form className="mb-3">
                                  <Form.Group>
                                    <Form.Control
                                      as="textarea"
                                      rows={3}
                                      value={editCommentContent}
                                      onChange={(e) => setEditCommentContent(e.target.value)}
                                      className="bg-dark text-light border-0 mb-2"
                                    />
                                  </Form.Group>
                                  <div className="d-flex gap-2">
                                    <Button 
                                      variant="primary" 
                                      size="sm"
                                      onClick={() => handleUpdateComment(reply._id)}
                                      disabled={!editCommentContent.trim()}
                                    >
                                      Salva
                                    </Button>
                                    <Button 
                                      variant="outline-secondary" 
                                      size="sm"
                                      onClick={handleCancelEdit}
                                    >
                                      Annulla
                                    </Button>
                                  </div>
                                </Form>
                              ) : (
                                <>
                                  <div className="d-flex justify-content-between mb-2">
                                    <div className="d-flex align-items-center">
                                      <Image 
                                        src={reply.author.avatar || 'https://picsum.photos/30'} 
                                        alt={reply.author.name} 
                                        roundedCircle 
                                        width={30} 
                                        height={30} 
                                        className="me-2"
                                        style={{ objectFit: 'cover' }}
                                        onError={(e) => {
                                          e.target.src = 'https://picsum.photos/30';
                                        }}
                                      />
                                      <h6 className="mb-0">{reply.author.name}</h6>
                                    </div>
                                    <small className="text-muted">{new Date(reply.createdAt).toLocaleDateString()}</small>
                                  </div>
                                  <p className="mb-2">{reply.content}</p>
                                  <div className="d-flex gap-2">
                                    {canEditComment(reply) && (
                                      <>
                                        <Button 
                                          variant="link" 
                                          className="p-0 text-primary"
                                          onClick={() => handleEditComment(reply)}
                                        >
                                          Modifica
                                        </Button>
                                        <Button 
                                          variant="link" 
                                          className="p-0 text-danger"
                                          onClick={() => handleDeleteComment(reply._id)}
                                        >
                                          Elimina
                                        </Button>
                                      </>
                                    )}
                                  </div>
                                </>
                              )}
                            </Card.Body>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              )}
              
              {currentUser ? (
                <Card className="border-0 shadow-sm mt-4 fade-in" style={{ animationDelay: '0.5s' }} id="comment-form">
                  <Card.Body>
                    <h4 className="mb-3">
                      {replyTo ? 'Rispondi al commento' : 'Lascia un commento'}
                    </h4>
                    
                    {replyTo && (
                      <div className="mb-3">
                        <Alert variant="info" className="d-flex justify-content-between align-items-center">
                          <span>Stai rispondendo a un commento</span>
                          <Button 
                            variant="link" 
                            className="p-0 text-danger"
                            onClick={handleCancelReply}
                          >
                            Annulla
                          </Button>
                        </Alert>
                      </div>
                    )}
                    
                    <Form onSubmit={handleSubmitComment}>
                      <Form.Group className="mb-3">
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="Scrivi il tuo commento..."
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          className="bg-dark text-light border-0"
                        />
                      </Form.Group>
                      <Button 
                        type="submit" 
                        variant="primary"
                        className="btn-glow"
                        disabled={!comment.trim()}
                      >
                        Invia commento
                      </Button>
                    </Form>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm mt-4 fade-in" style={{ animationDelay: '0.5s' }}>
                  <Card.Body className="text-center">
                    <p>Accedi per lasciare un commento</p>
                    <Link to="/login" className="btn btn-primary btn-glow">
                      Accedi
                    </Link>
                  </Card.Body>
                </Card>
              )}
            </Col>
            
            <Col lg={4}>
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h4 className="mb-3">Autore</h4>
                  {post.author ? (
                    <div className="d-flex align-items-center">
                      <Image 
                        src={post.author.avatar || 'https://picsum.photos/60'} 
                        alt={post.author.name} 
                        roundedCircle 
                        width={60} 
                        height={60} 
                        className="me-3"
                        style={{ objectFit: 'cover' }}
                        onError={(e) => {
                          e.target.src = 'https://picsum.photos/60';
                        }}
                      />
                      <div>
                        <h5 className="mb-1">{post.author.name}</h5>
                        <p className="mb-0 text-muted">{post.author.bio || 'Nessuna bio disponibile'}</p>
                      </div>
                    </div>
                  ) : (
                    <p>Autore sconosciuto</p>
                  )}
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm mb-4">
                <Card.Body>
                  <h4 className="mb-3">Informazioni</h4>
                  <div className="mb-2">
                    <strong>Categoria:</strong> {post.category}
                  </div>
                  <div className="mb-2">
                    <strong>Data:</strong> {new Date(post.createdAt).toLocaleDateString()}
                  </div>
                  <div className="mb-2">
                    <strong>Tempo di lettura:</strong> {post.readTime || 5} min
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div>
                      <strong>Tag:</strong>
                      <div className="mt-2">
                        {post.tags.map(tag => (
                          <Badge 
                            bg="secondary" 
                            key={tag} 
                            className="me-1 mb-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
};

export default PostDetailPage; 