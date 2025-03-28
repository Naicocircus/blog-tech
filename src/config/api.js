export const API_BASE_URL = 'http://localhost:5052/api';

// Per debug: stampa l'URL di base all'avvio dell'applicazione
console.log('API base URL:', API_BASE_URL);

export const API_ENDPOINTS = {
    BASE_URL: API_BASE_URL,
    
    // Auth endpoints
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    GET_ME: '/auth/me',
    UPDATE_PROFILE: '/auth/update-profile',
    CHANGE_PASSWORD: '/auth/change-password',
    UPLOAD_AVATAR: '/auth/upload-avatar',
    
    // Posts endpoints
    POSTS: '/posts',
    
    // Comments endpoints
    COMMENTS: '/comments',
    
    // Reactions endpoints
    LIKE_POST: (postId) => `/posts/${postId}/like`,
    REACT_TO_POST: (postId) => `/posts/${postId}/react`,
    GET_POST_REACTIONS: (postId) => `/posts/${postId}/reactions`,
    
    // Share endpoints
    SHARE_POST: (postId) => `/posts/${postId}/share`,
    GET_POST_SHARES: (postId) => `/posts/${postId}/shares`,
    
    // Notifications endpoints
    NOTIFICATIONS: '/notifications',
    NOTIFICATION_UNREAD_COUNT: '/notifications/unread-count',
    MARK_NOTIFICATION_READ: (notificationId) => `/notifications/${notificationId}/read`,
    MARK_ALL_NOTIFICATIONS_READ: '/notifications/read-all',
    
    // Authors endpoints
    AUTHORS: '/authors',
    
    // Upload endpoint
    UPLOAD: '/upload'
};

export const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export default API_ENDPOINTS; 