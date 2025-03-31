import axios from 'axios';
import { API_ENDPOINTS } from '../config/api';

const api = axios.create({
  baseURL: API_ENDPOINTS.BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Helper function per ottenere l'header di autorizzazione
const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

const ApiService = {
  // Auth
  login: async (credentials) => {
    try {
      const response = await api.post(API_ENDPOINTS.LOGIN, credentials);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Login failed'
      };
    }
  },

  register: async (userData) => {
    try {
      const response = await api.post(API_ENDPOINTS.REGISTER, userData);
      if (response.success && response.token) {
        localStorage.setItem('token', response.token);
      }
      return response;
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Registration failed'
      };
    }
  },

  logout: async () => {
    try {
      await api.post(API_ENDPOINTS.LOGOUT);
      localStorage.removeItem('token');
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Logout failed'
      };
    }
  },

  getMe: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.GET_ME);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch user data'
      };
    }
  },

  updateProfile: async (userData) => {
    try {
      console.log('API call updateProfile with data:', userData);
      const response = await api.put(API_ENDPOINTS.UPDATE_PROFILE, userData);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || error.message
      };
    }
  },

  changePassword: async (passwordData) => {
    try {
      const response = await api.put(API_ENDPOINTS.CHANGE_PASSWORD, passwordData);
      return {
        success: true,
        message: 'Password aggiornata con successo'
      };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante l\'aggiornamento della password'
      };
    }
  },

  // Posts
  getPosts: async (params = {}) => {
    try {
      console.log('API call getPosts with params:', params);
      
      const response = await api.get(API_ENDPOINTS.POSTS, { params });
      
      console.log('Raw API response:', response);
      
      // Verifica se la risposta è valida
      if (!response) {
        throw new Error('Risposta API non valida');
      }

      // Restituisci la risposta formattata
      return {
        success: true,
        data: response.data || [],
        total: response.total || 0,
        pages: response.pages || 0,
        suggestions: response.suggestions || []
      };
      
    } catch (error) {
      console.error('API error in getPosts:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante il recupero dei post',
        data: [],
        total: 0,
        pages: 0,
        suggestions: []
      };
    }
  },

  getPost: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.POSTS}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch post'
      };
    }
  },

  createPost: async (postData) => {
    try {
        // Log iniziale dei dati ricevuti
        console.log('[CreatePost] Tipo di postData:', typeof postData);
        console.log('[CreatePost] postData contiene image?', 'image' in postData);
        if (postData.image) {
            console.log('[CreatePost] Tipo di image:', typeof postData.image);
            console.log('[CreatePost] Image è un File?', postData.image instanceof File);
            if (postData.image instanceof File) {
                console.log('[CreatePost] Dettagli immagine:', {
                    name: postData.image.name,
                    size: postData.image.size,
                    type: postData.image.type
                });
            }
        }

        const formData = new FormData();
        
        // Aggiungi tutti i campi al FormData con log
        Object.keys(postData).forEach(key => {
            if (key === 'tags' && Array.isArray(postData[key])) {
                console.log(`[CreatePost] Aggiunta tags:`, postData[key]);
                formData.append('tags', JSON.stringify(postData[key]));
            } else if (key === 'image' && postData[key] instanceof File) {
                console.log(`[CreatePost] Aggiunta immagine:`, postData[key].name);
                formData.append('image', postData[key]);
            } else {
                console.log(`[CreatePost] Aggiunta ${key}:`, postData[key]);
                formData.append(key, postData[key]);
            }
        });

        // Verifica del contenuto del FormData
        console.log('[CreatePost] Contenuto FormData:');
        for (let pair of formData.entries()) {
            console.log(pair[0], pair[1] instanceof File ? 
                `File: ${pair[1].name} (${pair[1].size} bytes)` : pair[1]);
        }

        // Rimuovi Content-Type per permettere al browser di gestire il multipart boundary
        delete api.defaults.headers['Content-Type'];
        
        const response = await api.post(API_ENDPOINTS.POSTS, formData, {
            headers: {
                ...getAuthHeader()
            }
        });
        
        console.log('[CreatePost] Risposta server:', response);
        
        // Ripristina Content-Type
        api.defaults.headers['Content-Type'] = 'application/json';
        
        return {
            success: true,
            data: response.data,
            message: 'Post creato con successo'
        };
    } catch (error) {
        console.error('[CreatePost] Errore completo:', error);
        api.defaults.headers['Content-Type'] = 'application/json';
        return {
            success: false,
            message: error.response?.data?.message || error.message || 'Errore durante la creazione del post'
        };
    }
  },

  updatePost: async (id, postData) => {
    try {
      console.log('API call updatePost with data:', postData);
      
      // Se postData è un oggetto FormData, lo inviamo direttamente
      // altrimenti creiamo un nuovo FormData
      let dataToSend = postData;
      if (!(postData instanceof FormData)) {
        console.log('Creating new FormData from object data');
        dataToSend = new FormData();
        Object.keys(postData).forEach(key => {
          if (key === 'tags' && Array.isArray(postData[key])) {
            console.log(`Adding tags as joined string: ${postData[key].join(',')}`);
            dataToSend.append(key, postData[key].join(','));
          } else {
            console.log(`Adding field ${key}: ${postData[key]}`);
            dataToSend.append(key, postData[key]);
          }
        });
      } else {
        console.log('Using provided FormData object');
        // Debug log per verificare il contenuto del FormData
        for (let pair of dataToSend.entries()) {
          console.log(`FormData contains: ${pair[0]} = ${typeof pair[1] === 'object' ? 'File object' : pair[1]}`);
        }
      }
      
      console.log(`Sending PUT request to ${API_ENDPOINTS.POSTS}/${id}`);
      const response = await api.put(`${API_ENDPOINTS.POSTS}/${id}`, dataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('API response from updatePost:', response);
      
      return {
        success: true,
        data: response.data,
        message: 'Post aggiornato con successo'
      };
    } catch (error) {
      console.error('API error in updatePost:', error);
      console.error('Error response data:', error.response?.data);
      
      // Log dettagliato dell'errore
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response headers:', error.response.headers);
        console.error('Response data:', error.response.data);
      } else if (error.request) {
        console.error('Request made but no response:', error.request);
      } else {
        console.error('Error setting up request:', error.message);
      }
      
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'aggiornamento del post'
      };
    }
  },

  deletePost: async (id) => {
    try {
      console.log('API call deletePost with id:', id);
      
      const response = await api.delete(`${API_ENDPOINTS.POSTS}/${id}`);
      
      console.log('API response from deletePost:', response);
      
      return {
        success: true,
        message: 'Post eliminato con successo'
      };
    } catch (error) {
      console.error('API error in deletePost:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'eliminazione del post'
      };
    }
  },

  // Authors
  getAuthors: async () => {
    try {
      const response = await api.get(API_ENDPOINTS.AUTHORS);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch authors'
      };
    }
  },

  getAuthor: async (id) => {
    try {
      const response = await api.get(`${API_ENDPOINTS.AUTHORS}/${id}`);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to fetch author'
      };
    }
  },

  // Comments
  getComments: async (postId, params = {}) => {
    try {
      console.log('API call getComments for post:', postId);
      
      const response = await api.get(`${API_ENDPOINTS.POSTS}/${postId}/comments`, { params });
      
      console.log('API response from getComments:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API error in getComments:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante il recupero dei commenti'
      };
    }
  },

  createComment: async (postId, commentData) => {
    try {
      console.log('API call createComment for post:', postId, 'with data:', commentData);
      
      const response = await api.post(`${API_ENDPOINTS.POSTS}/${postId}/comments`, commentData);
      
      console.log('API response from createComment:', response);
      
      return {
        success: true,
        data: response.data,
        message: 'Commento aggiunto con successo'
      };
    } catch (error) {
      console.error('API error in createComment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'aggiunta del commento'
      };
    }
  },

  updateComment: async (commentId, content) => {
    try {
      console.log('API call updateComment for comment:', commentId);
      
      const response = await api.put(`${API_ENDPOINTS.COMMENTS}/${commentId}`, { content });
      
      console.log('API response from updateComment:', response);
      
      return {
        success: true,
        data: response.data,
        message: 'Commento aggiornato con successo'
      };
    } catch (error) {
      console.error('API error in updateComment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'aggiornamento del commento'
      };
    }
  },

  deleteComment: async (commentId) => {
    try {
      console.log('API call deleteComment for comment:', commentId);
      
      const response = await api.delete(`${API_ENDPOINTS.COMMENTS}/${commentId}`);
      
      console.log('API response from deleteComment:', response);
      
      return {
        success: true,
        message: 'Commento eliminato con successo'
      };
    } catch (error) {
      console.error('API error in deleteComment:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'eliminazione del commento'
      };
    }
  },

  // Upload
  uploadFile: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post(API_ENDPOINTS.UPLOAD, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || 'Failed to upload file'
      };
    }
  },

  // Reactions
  likePost: async (postId) => {
    try {
      console.log('API call likePost for post:', postId);
      const response = await api.post(API_ENDPOINTS.LIKE_POST(postId));
      console.log('API response from likePost:', response);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API error in likePost:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'aggiornamento del like'
      };
    }
  },

  reactToPost: async (postId, reactionData) => {
    try {
      console.log('API call reactToPost for post:', postId, 'with data:', reactionData);
      const response = await api.post(API_ENDPOINTS.REACT_TO_POST(postId), reactionData);
      console.log('API response from reactToPost:', response);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API error in reactToPost:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante l\'aggiornamento della reazione'
      };
    }
  },

  getPostReactions: async (postId) => {
    try {
      console.log('API call getPostReactions for post:', postId);
      const response = await api.get(API_ENDPOINTS.GET_POST_REACTIONS(postId));
      console.log('API response from getPostReactions:', response);
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('API error in getPostReactions:', error);
      return {
        success: false,
        message: error.response?.data?.message || error.message || 'Errore durante il recupero delle reazioni'
      };
    }
  },

  // Shares
  trackShare: async (postId, platform) => {
    console.log(`[API] Tracking share for post ${postId} on platform: ${platform}`);
    
    try {
      const response = await api.post(API_ENDPOINTS.SHARE_POST(postId), { platform });
      
      if (response.status === 200) {
        console.log('[API] Share tracked successfully:', response.data);
        return {
          success: true,
          message: 'Condivisione registrata con successo',
          data: response.data
        };
      } else {
        console.error('[API] Error tracking share:', response.data);
        return {
          success: false,
          message: response.data.message || 'Errore durante la registrazione della condivisione'
        };
      }
    } catch (error) {
      console.error('[API] Error tracking share:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante la registrazione della condivisione'
      };
    }
  },
  
  getShareStats: async (postId) => {
    console.log(`[API] Getting share stats for post ${postId}`);
    
    try {
      const response = await api.get(API_ENDPOINTS.GET_POST_SHARES(postId));
      console.log('[API] Share stats retrieved successfully:', response);
      
      return {
        success: true,
        message: 'Statistiche di condivisione recuperate con successo',
        data: response
      };
    } catch (error) {
      console.error('[API] Error getting share stats:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante il recupero delle statistiche di condivisione'
      };
    }
  },

  // Notifications
  getNotifications: async (params = {}) => {
    try {
      console.log('[API] Recupero notifiche con parametri:', params);
      
      const response = await api.get(API_ENDPOINTS.NOTIFICATIONS, { params });
      
      console.log('[API] Notifiche recuperate con successo:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Errore durante il recupero delle notifiche:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante il recupero delle notifiche'
      };
    }
  },
  
  getUnreadNotificationCount: async () => {
    try {
      console.log('[API] Recupero conteggio notifiche non lette');
      
      const response = await api.get(API_ENDPOINTS.NOTIFICATION_UNREAD_COUNT);
      
      console.log('[API] Conteggio notifiche recuperato con successo:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Errore durante il recupero del conteggio delle notifiche:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante il recupero del conteggio delle notifiche'
      };
    }
  },
  
  markNotificationAsRead: async (notificationId) => {
    try {
      console.log(`[API] Segno notifica ${notificationId} come letta`);
      
      const response = await api.put(API_ENDPOINTS.MARK_NOTIFICATION_READ(notificationId));
      
      console.log('[API] Notifica segnata come letta con successo:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Errore durante la marcatura della notifica come letta:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante la marcatura della notifica come letta'
      };
    }
  },
  
  markAllNotificationsAsRead: async () => {
    try {
      console.log('[API] Segno tutte le notifiche come lette');
      
      const response = await api.put(API_ENDPOINTS.MARK_ALL_NOTIFICATIONS_READ);
      
      console.log('[API] Tutte le notifiche segnate come lette con successo:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Errore durante la marcatura di tutte le notifiche come lette:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante la marcatura di tutte le notifiche come lette'
      };
    }
  },
  
  deleteNotification: async (notificationId) => {
    try {
      console.log(`[API] Elimino notifica ${notificationId}`);
      
      const response = await api.delete(`${API_ENDPOINTS.NOTIFICATIONS}/${notificationId}`);
      
      console.log('[API] Notifica eliminata con successo:', response);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('[API] Errore durante l\'eliminazione della notifica:', error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante l\'eliminazione della notifica'
      };
    }
  },

  uploadAvatar: async (formData) => {
    try {
      console.log('Uploading avatar to:', API_ENDPOINTS.UPLOAD_AVATAR);
      const response = await api.post(API_ENDPOINTS.UPLOAD_AVATAR, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          ...getAuthHeader()
        }
      });
      console.log('Upload response:', response);
      return {
        success: true,
        data: {
          url: response.url || response.secure_url || response.data?.url || response.data?.secure_url
        }
      };
    } catch (error) {
      console.error('Errore upload avatar:', error.response || error);
      return {
        success: false,
        message: error.response?.data?.message || 'Errore durante l\'upload dell\'avatar'
      };
    }
  },

  getPostsByAuthor: async (authorId) => {
    try {
      console.log('Getting posts for author:', authorId);
      const response = await api.get(`${API_ENDPOINTS.POSTS}/author/${authorId}`);
      console.log('Author posts response:', response);
      return {
        success: true,
        data: response.data || []
      };
    } catch (error) {
      console.error('Error getting author posts:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch author posts',
        data: []
      };
    }
  },
};

export default ApiService; 