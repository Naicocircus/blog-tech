import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Button, Badge, Pagination } from 'react-bootstrap';
import { FaCheckDouble, FaCheck, FaTrash } from 'react-icons/fa';
import ApiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import './NotificationsPage.css';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });
  const [unreadOnly, setUnreadOnly] = useState(false);
  const navigate = useNavigate();

  // Carica le notifiche
  const fetchNotifications = async (page = 1, limit = 20, unreadOnly = false) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await ApiService.getNotifications({
        page,
        limit,
        unreadOnly: unreadOnly.toString()
      });
      
      if (response.success) {
        setNotifications(response.data.notifications);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Errore durante il caricamento delle notifiche');
      }
    } catch (error) {
      setError('Errore durante il caricamento delle notifiche');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Carica le notifiche all'avvio
  useEffect(() => {
    fetchNotifications(pagination.page, pagination.limit, unreadOnly);
  }, [unreadOnly]);

  // Gestisce il cambio pagina
  const handlePageChange = (page) => {
    fetchNotifications(page, pagination.limit, unreadOnly);
  };

  // Segna una notifica come letta
  const markAsRead = async (notificationId) => {
    try {
      await ApiService.markNotificationAsRead(notificationId);
      
      // Aggiorna lo stato locale
      setNotifications(prevNotifications =>
        prevNotifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        )
      );
    } catch (error) {
      console.error('Errore durante la marcatura della notifica come letta:', error);
    }
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      
      // Aggiorna lo stato locale
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
    } catch (error) {
      console.error('Errore durante la marcatura di tutte le notifiche come lette:', error);
    }
  };

  // Elimina una notifica
  const deleteNotification = async (notificationId) => {
    try {
      await ApiService.deleteNotification(notificationId);
      
      // Rimuovi la notifica dallo stato locale
      setNotifications(prevNotifications =>
        prevNotifications.filter(n => n._id !== notificationId)
      );
    } catch (error) {
      console.error('Errore durante l\'eliminazione della notifica:', error);
    }
  };

  // Naviga al link della notifica
  const navigateToNotification = (notification) => {
    if (!notification.read) {
      markAsRead(notification._id);
    }
    
    if (notification.link) {
      navigate(notification.link);
    }
  };

  // Formatta la data della notifica
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('it-IT', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Rendering condizionale dell'icona in base al tipo di notifica
  const getNotificationIcon = (type, reactionType) => {
    switch (type) {
      case 'comment':
        return <i className="bi bi-chat-text-fill text-primary"></i>;
      case 'reply':
        return <i className="bi bi-reply-fill text-info"></i>;
      case 'mention':
        return <i className="bi bi-at text-warning"></i>;
      case 'like':
        return <i className="bi bi-heart-fill text-danger"></i>;
      case 'reaction':
        return getReactionIcon(reactionType);
      case 'share':
        return <i className="bi bi-share-fill text-success"></i>;
      case 'follow':
        return <i className="bi bi-person-plus-fill text-info"></i>;
      case 'system':
        return <i className="bi bi-gear-fill text-secondary"></i>;
      default:
        return <i className="bi bi-bell-fill"></i>;
    }
  };

  // Ottieni l'icona della reazione
  const getReactionIcon = (reactionType) => {
    switch (reactionType) {
      case 'thumbsUp':
        return <span className="reaction-icon">👍</span>;
      case 'heart':
        return <span className="reaction-icon">❤️</span>;
      case 'clap':
        return <span className="reaction-icon">👏</span>;
      case 'wow':
        return <span className="reaction-icon">😮</span>;
      case 'sad':
        return <span className="reaction-icon">😢</span>;
      default:
        return <i className="bi bi-emoji-smile text-warning"></i>;
    }
  };

  // Renderizza le pagine della paginazione
  const renderPaginationItems = () => {
    const items = [];
    
    // Prima pagina
    items.push(
      <Pagination.Item
        key="first"
        onClick={() => handlePageChange(1)}
        disabled={pagination.page === 1}
      >
        1
      </Pagination.Item>
    );
    
    // Ellipsis se necessario
    if (pagination.page > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }
    
    // Pagine intorno alla pagina corrente
    for (let i = Math.max(2, pagination.page - 1); i <= Math.min(pagination.pages - 1, pagination.page + 1); i++) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === pagination.page}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Ellipsis se necessario
    if (pagination.page < pagination.pages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }
    
    // Ultima pagina
    if (pagination.pages > 1) {
      items.push(
        <Pagination.Item
          key="last"
          onClick={() => handlePageChange(pagination.pages)}
          active={pagination.page === pagination.pages}
        >
          {pagination.pages}
        </Pagination.Item>
      );
    }
    
    return items;
  };

  return (
    <Container className="py-5">
      <Row className="mb-4">
        <Col>
          <h1 className="display-5 mb-0">Le tue notifiche</h1>
          <p className="text-muted mt-2">
            Gestisci tutte le tue attività recenti
          </p>
        </Col>
        <Col xs="auto" className="d-flex align-items-center">
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="unreadOnly"
              checked={unreadOnly}
              onChange={(e) => setUnreadOnly(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="unreadOnly">
              Solo non lette
            </label>
          </div>
          
          <Button 
            variant="outline-primary" 
            className="d-flex align-items-center"
            onClick={markAllAsRead}
          >
            <FaCheckDouble className="me-2" />
            Segna tutte come lette
          </Button>
        </Col>
      </Row>
      
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Caricamento...</span>
          </div>
        </div>
      ) : error ? (
        <Card body className="text-center text-danger">{error}</Card>
      ) : notifications.length === 0 ? (
        <Card body className="text-center text-muted">Nessuna notifica</Card>
      ) : (
        <>
          <Row>
            <Col>
              <Card className="notification-list-card">
                {notifications.map(notification => (
                  <div 
                    key={notification._id} 
                    className={`notification-list-item ${notification.read ? 'read' : 'unread'}`}
                  >
                    <div className="d-flex align-items-start">
                      <div className="notification-list-icon">
                        {getNotificationIcon(notification.type, notification.reactionType)}
                      </div>
                      
                      <div 
                        className="notification-list-content"
                        onClick={() => navigateToNotification(notification)}
                      >
                        <div className="notification-list-text">
                          {notification.read ? null : (
                            <Badge bg="primary" pill className="me-2">Nuovo</Badge>
                          )}
                          {notification.content}
                        </div>
                        <div className="notification-list-meta">
                          {notification.sender && (
                            <img 
                              src={notification.sender.avatar} 
                              alt={notification.sender.name}
                              className="notification-sender-avatar"
                            />
                          )}
                          <span className="notification-list-time">
                            {formatDate(notification.createdAt)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="notification-list-actions">
                        {!notification.read && (
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="me-2"
                            onClick={() => markAsRead(notification._id)}
                            title="Segna come letta"
                          >
                            <FaCheck />
                          </Button>
                        )}
                        <Button 
                          variant="outline-danger" 
                          size="sm"
                          onClick={() => deleteNotification(notification._id)}
                          title="Elimina"
                        >
                          <FaTrash />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </Card>
            </Col>
          </Row>
          
          {pagination.pages > 1 && (
            <Row className="mt-4">
              <Col className="d-flex justify-content-center">
                <Pagination>
                  <Pagination.Prev
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                  />
                  
                  {renderPaginationItems()}
                  
                  <Pagination.Next
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.pages}
                  />
                </Pagination>
              </Col>
            </Row>
          )}
        </>
      )}
    </Container>
  );
};

export default NotificationsPage; 