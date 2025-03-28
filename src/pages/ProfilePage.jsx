import React, { useState, useEffect, useCallback, useContext } from 'react';
import { Container, Row, Col, Card, Button, Form, Tab, Nav, Table, Badge, Alert, Image } from 'react-bootstrap';
import { FaEdit, FaTrash, FaUser, FaEnvelope, FaInfoCircle, FaSave, FaSignOutAlt, FaFileAlt, FaCheck, FaClock, FaUpload, FaTimes, FaKey } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import ApiService from '../services/api';
import AuthContext from '../context/AuthContext';

const ProfilePage = () => {
  const { logout } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('posts');
  const [editMode, setEditMode] = useState(false);
  const [animatedItems, setAnimatedItems] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const navigate = useNavigate();
  
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    bio: '',
    role: '',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80'
  });
  
  const [posts, setPosts] = useState([]);

  const [originalUserData, setOriginalUserData] = useState({});

  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const fetchUserData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await ApiService.getMe();
      console.log('getMe response:', response);
      
      if (!response.success) {
        throw new Error(response.message || 'Failed to load profile data');
      }

      setUserData({
        name: response.data.name,
        email: response.data.email,
        bio: response.data.bio || '',
        role: response.data.role || 'user',
        avatar: response.data.avatar
      });

      // Get user posts using getPostsByAuthor
      const postsResponse = await ApiService.getPostsByAuthor(response.data._id);
      console.log('Posts response:', postsResponse);
      
      if (postsResponse.success) {
        setPosts(postsResponse.data);
        console.log('Posts set in state:', postsResponse.data);
      }
    } catch (error) {
      console.error('Error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user data and posts
  useEffect(() => {
    fetchUserData();
  }, [fetchUserData]);

  // Animation effect when component mounts
  useEffect(() => {
    const timer = setTimeout(() => {
      if (posts && Array.isArray(posts)) {
        setAnimatedItems(posts.map(post => post._id));
      }
    }, 100);
    return () => clearTimeout(timer);
  }, [posts]);

  const handleUserDataChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploadingAvatar(true);
      setError(''); // Reset any previous errors
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await ApiService.uploadAvatar(formData);
      
      if (response.success) {
        // Aggiorna immediatamente l'avatar nell'interfaccia
        setUserData(prev => ({
          ...prev,
          avatar: response.data.avatar || response.data.url
        }));
        setSuccessMessage('Avatar aggiornato con successo!');
        
        // Ricarica i dati utente per assicurarsi che tutto sia sincronizzato
        await fetchUserData();
      } else {
        throw new Error(response.message || 'Errore durante l\'upload dell\'avatar');
      }
    } catch (err) {
      console.error('Errore upload avatar:', err);
      setError(err.message || 'Errore durante l\'upload dell\'avatar');
    } finally {
      setUploadingAvatar(false);
      // Pulisci i messaggi dopo 3 secondi
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
    }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    // Verifica se ci sono modifiche
    const hasChanges = 
      userData.name !== originalUserData.name || 
      userData.bio !== originalUserData.bio ||
      userData.email !== originalUserData.email;
    
    if (!hasChanges) {
      setEditMode(false);
      setSuccessMessage('No changes were made');
      setTimeout(() => setSuccessMessage(''), 3000);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Sending profile update:', userData);
      
      // Invia solo i campi modificati
      const dataToUpdate = {
        name: userData.name,
        bio: userData.bio,
        email: userData.email
      };
      
      const response = await ApiService.updateProfile(dataToUpdate);
      console.log('Profile update response:', response);
      
      if (response.success) {
        setEditMode(false);
        setSuccessMessage('Profile updated successfully!');
        // Aggiorna i dati utente solo se la risposta contiene dati
        if (response.data) {
          setUserData(response.data);
        } else {
          // Se non ci sono dati nella risposta, ricarica i dati utente
          fetchUserData();
        }
      } else {
        setError(response.message || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Error updating profile: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
    
    setTimeout(() => {
      setSuccessMessage('');
      setError('');
    }, 3000);
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      try {
        const response = await ApiService.deletePost(postId);
        
        if (response.success) {
          setPosts(posts.filter(post => post._id !== postId));
          setSuccessMessage('Post deleted successfully!');
        } else {
          setError(response.message || 'Failed to delete post');
        }
      } catch (err) {
        setError('Error deleting post');
        console.error(err);
      }
      
      // Clear messages after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
        setError('');
      }, 3000);
    }
  };

  const handleLogout = async () => {
    try {
      await ApiService.logout();
      logout(); // Chiama la funzione logout dal contesto
      navigate('/login');
    } catch (err) {
      console.error('Error during logout:', err);
      logout(); // Chiama comunque logout in caso di errore
      navigate('/login');
    }
  };

  const getStatusBadge = (status) => {
    switch(status) {
      case 'published':
        return <Badge bg="success" className="d-flex align-items-center"><FaCheck className="me-1" /> Published</Badge>;
      case 'draft':
        return <Badge bg="warning" text="dark" className="d-flex align-items-center"><FaClock className="me-1" /> Draft</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  const handleEditMode = () => {
    // Salva una copia dei dati originali prima di entrare in modalità modifica
    setOriginalUserData(userData);
    setEditMode(true);
  };

  const handleCancelEdit = () => {
    // Ripristina i dati originali quando si annulla la modifica
    setUserData(originalUserData);
    setEditMode(false);
  };

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    
    // Validazione
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Le password non coincidono');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nuova password deve essere di almeno 6 caratteri');
      return;
    }

    try {
      setLoading(true);
      const response = await ApiService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.success) {
        setSuccessMessage('Password aggiornata con successo');
        setShowPasswordForm(false);
        setPasswordData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        });
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Errore durante l\'aggiornamento della password');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Render the posts section
  const renderPosts = () => {
    console.log('Rendering posts:', posts);
    
    if (!posts || posts.length === 0) {
      return (
        <div className="text-center py-5">
          <h4>No Posts Yet</h4>
          <p className="text-muted">Start creating your first post!</p>
        </div>
      );
    }

    return (
      <div className="row">
        {posts.map(post => (
          <div key={post._id} className="col-md-4 mb-4">
            <div className="card">
              <img 
                src={post.coverImage} 
                className="card-img-top"
                alt={post.title}
                style={{ height: '200px', objectFit: 'cover' }}
              />
              <div className="card-body">
                <h5 className="card-title">{post.title}</h5>
                <p className="card-text">{post.excerpt}</p>
                <div className="d-flex justify-content-between">
                  <Link to={`/post/${post._id}`} className="btn btn-primary">
                    View
                  </Link>
                  <button 
                    className="btn btn-danger"
                    onClick={() => handleDeletePost(post._id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Container className="py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading profile...</p>
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
      
      <Container className="py-5 profile-page fade-in">
        {successMessage && (
          <Alert 
            variant="success" 
            className="mb-4 fade-in"
            onClose={() => setSuccessMessage('')} 
            dismissible
          >
            {successMessage}
          </Alert>
        )}

        {error && (
          <Alert 
            variant="danger" 
            className="mb-4 fade-in"
            onClose={() => setError('')} 
            dismissible
          >
            {error}
          </Alert>
        )}
        
        <Row className="mb-4">
          <Col>
            <h1 className="text-gradient">My Dashboard</h1>
            <p className="lead text-muted">Manage your profile and posts</p>
          </Col>
        </Row>
        
        <Tab.Container activeKey={activeTab} onSelect={setActiveTab}>
          <Row>
            <Col lg={3} className="mb-4">
              <Card className="border-0 shadow-sm text-center mb-4">
                <Card.Body>
                  <div className="position-relative mb-3 mx-auto" style={{ width: '120px', height: '120px' }}>
                    <Image 
                      src={userData.avatar} 
                      roundedCircle 
                      className="border-glow" 
                      style={{ width: '120px', height: '120px', objectFit: 'cover' }}
                    />
                    <div 
                      className="position-absolute bottom-0 end-0 bg-primary rounded-circle p-2"
                      style={{ cursor: 'pointer' }}
                      onClick={() => document.getElementById('avatarUpload').click()}
                    >
                      <FaUpload color="white" size={14} />
                    </div>
                    <input
                      type="file"
                      id="avatarUpload"
                      className="d-none"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      disabled={uploadingAvatar}
                    />
                  </div>
                  <h4>{userData.name}</h4>
                  <p className="text-muted mb-2">{userData.email}</p>
                  <Badge bg={userData.role === 'author' ? 'primary' : 'secondary'} className="mb-3">
                    {userData.role.charAt(0).toUpperCase() + userData.role.slice(1)}
                  </Badge>
                  <div className="d-grid">
                    <Button 
                      variant="outline-primary" 
                      className="btn-hover-effect"
                      onClick={() => setActiveTab('profile')}
                    >
                      <FaEdit className="me-2" /> Edit Profile
                    </Button>
                  </div>
                </Card.Body>
              </Card>
              
              <Card className="border-0 shadow-sm">
                <Card.Body className="p-0">
                  <Nav variant="pills" className="flex-column">
                    <Nav.Item>
                      <Nav.Link 
                        eventKey="posts" 
                        className="d-flex align-items-center py-3 px-4 border-0"
                      >
                        <FaFileAlt className="me-2" /> My Posts
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        eventKey="profile" 
                        className="d-flex align-items-center py-3 px-4 border-0"
                      >
                        <FaUser className="me-2" /> Profile
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link 
                        onClick={handleLogout}
                        className="d-flex align-items-center py-3 px-4 border-0 text-danger"
                        style={{ cursor: 'pointer' }}
                      >
                        <FaSignOutAlt className="me-2" /> Logout
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </Card.Body>
              </Card>
            </Col>
            
            <Col lg={9}>
              <Tab.Content>
                <Tab.Pane eventKey="posts">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">My Posts</h3>
                        {userData.role === 'author' && (
                          <Link to="/create-post" className="btn btn-primary">
                            Create New Post
                          </Link>
                        )}
                      </div>
                      {renderPosts()}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
                
                <Tab.Pane eventKey="profile">
                  <Card className="border-0 shadow-sm">
                    <Card.Body>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h3 className="mb-0">Profile Information</h3>
                        {editMode ? (
                          <div>
                            <Button
                              variant="secondary"
                              className="btn-hover-effect me-2"
                              onClick={handleCancelEdit}
                              type="button"
                            >
                              <FaTimes className="me-2" /> Cancel
                            </Button>
                            <Button
                              variant="success"
                              className="btn-hover-effect"
                              type="submit"
                              form="profileForm"
                            >
                              <FaSave className="me-2" /> Save Changes
                            </Button>
                          </div>
                        ) : (
                          <Button
                            variant="primary"
                            className="btn-hover-effect"
                            onClick={handleEditMode}
                            type="button"
                          >
                            <FaEdit className="me-2" /> Edit Profile
                          </Button>
                        )}
                      </div>
                      
                      <Form id="profileForm" onSubmit={handleSaveProfile}>
                        <Row>
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                <FaUser className="me-2" />
                                Full Name
                              </Form.Label>
                              <Form.Control
                                type="text"
                                name="name"
                                value={userData.name}
                                onChange={handleUserDataChange}
                                disabled={!editMode}
                                className="bg-dark text-light border-0"
                              />
                            </Form.Group>
                          </Col>
                          
                          <Col md={6}>
                            <Form.Group className="mb-3">
                              <Form.Label>
                                <FaEnvelope className="me-2" />
                                Email Address
                              </Form.Label>
                              <Form.Control
                                type="email"
                                name="email"
                                value={userData.email}
                                onChange={handleUserDataChange}
                                disabled={!editMode}
                                className="bg-dark text-light border-0"
                              />
                              <Form.Text className="text-muted">
                                {editMode ? 'Make sure to use a valid email address' : ''}
                              </Form.Text>
                            </Form.Group>
                          </Col>
                        </Row>
                        
                        <Form.Group className="mb-3">
                          <Form.Label>
                            <FaInfoCircle className="me-2" />
                            Bio
                          </Form.Label>
                          <Form.Control
                            as="textarea"
                            rows={4}
                            name="bio"
                            value={userData.bio}
                            onChange={handleUserDataChange}
                            disabled={!editMode}
                            placeholder="Tell us about yourself..."
                            className="bg-dark text-light border-0"
                          />
                        </Form.Group>
                      </Form>

                      <div className="mt-4 mb-2">
                        <Button
                          variant="outline-primary"
                          className="d-flex align-items-center btn-hover-effect"
                          onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                          <FaKey className="me-2" /> {showPasswordForm ? 'Nascondi Form Password' : 'Cambia Password'}
                        </Button>
                      </div>

                      {showPasswordForm && (
                        <Card className="border-0 shadow-sm mt-3 password-form-card">
                          <Card.Body className="bg-dark text-light rounded">
                            <h5 className="mb-3 text-gradient">Cambio Password</h5>
                            <Form onSubmit={handleChangePassword}>
                              <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                  <FaKey className="me-2" size={14} />
                                  Password Attuale
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="currentPassword"
                                  value={passwordData.currentPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  className="bg-dark text-light border-0 focus-ring-primary"
                                />
                              </Form.Group>
                              
                              <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                  <FaKey className="me-2" size={14} />
                                  Nuova Password
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="newPassword"
                                  value={passwordData.newPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  minLength={6}
                                  className="bg-dark text-light border-0 focus-ring-primary"
                                />
                                <Form.Text className="text-muted">
                                  La password deve essere di almeno 6 caratteri
                                </Form.Text>
                              </Form.Group>
                              
                              <Form.Group className="mb-3">
                                <Form.Label className="d-flex align-items-center">
                                  <FaKey className="me-2" size={14} />
                                  Conferma Nuova Password
                                </Form.Label>
                                <Form.Control
                                  type="password"
                                  name="confirmPassword"
                                  value={passwordData.confirmPassword}
                                  onChange={handlePasswordChange}
                                  required
                                  className="bg-dark text-light border-0 focus-ring-primary"
                                />
                              </Form.Group>
                              
                              <div className="d-flex justify-content-end mt-3">
                                <Button 
                                  variant="secondary" 
                                  type="button" 
                                  className="me-2 btn-hover-effect"
                                  onClick={() => setShowPasswordForm(false)}
                                  disabled={loading}
                                >
                                  <FaTimes className="me-2" /> Annulla
                                </Button>
                                <Button 
                                  variant="primary" 
                                  type="submit" 
                                  className="btn-hover-effect"
                                  disabled={loading}
                                >
                                  {loading ? (
                                    <>
                                      <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                      Aggiornamento...
                                    </>
                                  ) : (
                                    <>
                                      <FaSave className="me-2" /> Aggiorna Password
                                    </>
                                  )}
                                </Button>
                              </div>
                            </Form>
                          </Card.Body>
                        </Card>
                      )}
                    </Card.Body>
                  </Card>
                </Tab.Pane>
              </Tab.Content>
            </Col>
          </Row>
        </Tab.Container>
      </Container>
    </>
  );
};

export default ProfilePage; 