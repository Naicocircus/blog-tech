import React, { useState, useEffect, useRef } from 'react';
import { Badge, Button, Dropdown, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaBell, FaCheck, FaCheckDouble, FaTrash } from 'react-icons/fa';
import ApiService from '../services/api';
import { useNavigate } from 'react-router-dom';
import './NotificationBell.css';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Funzione per caricare le notifiche
  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const response = await ApiService.getNotifications({ limit: 10 });
      if (response.success) {
        setNotifications(response.data.notifications);
        setUnreadCount(response.data.unreadCount);
      }
    } catch (error) {
      console.error('Errore durante il caricamento delle notifiche:', error);
    } finally {
      setLoading(false);
    }
  };

  // Funzione per caricare solo il conteggio delle notifiche non lette
  const fetchUnreadCount = async () => {
    try {
      const response = await ApiService.getUnreadNotificationCount();
      if (response.success) {
        setUnreadCount(response.data.count);
      }
    } catch (error) {
      console.error('Errore durante il caricamento del conteggio delle notifiche:', error);
    }
  };

  // Carica il conteggio delle notifiche all'avvio e ogni minuto
  useEffect(() => {
    fetchUnreadCount();
    
    // Imposta un intervallo per aggiornare il conteggio delle notifiche ogni minuto
    const intervalId = setInterval(fetchUnreadCount, 60000);
    
    return () => clearInterval(intervalId);
  }, []);

  // Segna una notifica come letta e naviga al link se presente
  const handleNotificationClick = async (notification) => {
    if (!notification.read) {
      try {
        await ApiService.markNotificationAsRead(notification._id);
        
        // Aggiorna lo stato locale senza fare una nuova richiesta API
        setNotifications(prevNotifications =>
          prevNotifications.map(n =>
            n._id === notification._id ? { ...n, read: true } : n
          )
        );
        setUnreadCount(prevCount => Math.max(0, prevCount - 1));
      } catch (error) {
        console.error('Errore durante la marcatura della notifica come letta:', error);
      }
    }
    
    // Naviga al link della notifica se presente
    if (notification.link) {
      navigate(notification.link);
      if (dropdownRef.current) {
        dropdownRef.current.click(); // Chiudi il dropdown
      }
    }
  };

  // Segna tutte le notifiche come lette
  const markAllAsRead = async () => {
    try {
      await ApiService.markAllNotificationsAsRead();
      
      // Aggiorna lo stato locale senza fare una nuova richiesta API
      setNotifications(prevNotifications =>
        prevNotifications.map(n => ({ ...n, read: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Errore durante la marcatura di tutte le notifiche come lette:', error);
    }
  };

  // Elimina una notifica
  const deleteNotification = async (e, notificationId) => {
    e.stopPropagation(); // Evita che l'evento si propaghi al genitore (notifica)
    
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

  // Formatta la data della notifica (es. "2 ore fa", "ieri", ecc.)
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now - date;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) {
      return days === 1 ? 'ieri' : `${days} giorni fa`;
    } else if (hours > 0) {
      return `${hours} ore fa`;
    } else if (minutes > 0) {
      return `${minutes} minuti fa`;
    } else {
      return 'poco fa';
    }
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

  return (
    <Dropdown 
      align="end"
      onToggle={(isOpen) => {
        if (isOpen) {
          fetchNotifications();
        }
      }}
    >
      <Dropdown.Toggle
        ref={dropdownRef}
        variant="link"
        id="dropdown-notifications"
        className="notification-bell-toggle"
      >
        <div className="position-relative d-inline-block">
          <FaBell className="bell-icon" />
          {unreadCount > 0 && (
            <Badge pill bg="danger" className="notification-badge">
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </div>
      </Dropdown.Toggle>

      <Dropdown.Menu className="notification-dropdown">
        <div className="notification-header">
          <h6 className="mb-0">Notifiche</h6>
          {unreadCount > 0 && (
            <OverlayTrigger
              placement="bottom"
              overlay={<Tooltip>Segna tutte come lette</Tooltip>}
            >
              <Button 
                variant="link" 
                size="sm" 
                className="text-primary p-0"
                onClick={markAllAsRead}
              >
                <FaCheckDouble />
              </Button>
            </OverlayTrigger>
          )}
        </div>
        
        <div className="notification-body">
          {loading ? (
            <div className="text-center py-3">
              <div className="spinner-border spinner-border-sm text-primary" role="status">
                <span className="visually-hidden">Caricamento...</span>
              </div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-3 text-muted">
              Nessuna notifica
            </div>
          ) : (
            notifications.map(notification => (
              <div 
                key={notification._id} 
                className={`notification-item ${notification.read ? 'read' : 'unread'}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="notification-icon">
                  {getNotificationIcon(notification.type, notification.reactionType)}
                </div>
                <div className="notification-content">
                  <div className="notification-text">{notification.content}</div>
                  <div className="notification-time">{formatDate(notification.createdAt)}</div>
                </div>
                <div className="notification-actions">
                  {!notification.read && (
                    <OverlayTrigger
                      placement="left"
                      overlay={<Tooltip>Segna come letta</Tooltip>}
                    >
                      <Button 
                        variant="link" 
                        size="sm" 
                        className="text-primary p-0 me-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleNotificationClick(notification);
                        }}
                      >
                        <FaCheck />
                      </Button>
                    </OverlayTrigger>
                  )}
                  <OverlayTrigger
                    placement="left"
                    overlay={<Tooltip>Elimina</Tooltip>}
                  >
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="text-danger p-0"
                      onClick={(e) => deleteNotification(e, notification._id)}
                    >
                      <FaTrash />
                    </Button>
                  </OverlayTrigger>
                </div>
              </div>
            ))
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="notification-footer">
            <Button 
              variant="link" 
              className="text-primary w-100"
              onClick={() => navigate('/notifications')}
            >
              Vedi tutte
            </Button>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationBell; 