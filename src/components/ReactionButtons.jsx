import React, { useState, useEffect } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FaHeart, FaThumbsUp, FaSmile, FaSurprise, FaSadTear, FaRegHandPeace } from 'react-icons/fa';
import ApiService from '../services/api';

const ReactionButtons = ({ postId, onReactionChange }) => {
  const [reactions, setReactions] = useState({
    thumbsUp: 0,
    heart: 0,
    clap: 0,
    wow: 0,
    sad: 0
  });
  const [userReactions, setUserReactions] = useState({
    liked: false,
    reaction: null
  });
  const [likesCount, setLikesCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  // Carica le reazioni iniziali
  useEffect(() => {
    const fetchReactions = async () => {
      if (!postId) return;
      
      try {
        setLoading(true);
        const response = await ApiService.getPostReactions(postId);
        
        if (response.success) {
          const reactionsData = response.data.reactions || {
            thumbsUp: 0,
            heart: 0,
            clap: 0,
            wow: 0,
            sad: 0
          };
          
          setReactions(reactionsData);
          setUserReactions({
            liked: response.data.userLiked || false,
            reaction: response.data.userReaction || null
          });
          setLikesCount(response.data.likesCount || 0);
        }
      } catch (err) {
        console.error('Errore nel caricamento delle reazioni:', err);
        setError('Errore durante il caricamento delle reazioni');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReactions();
  }, [postId]);

  const handleLike = async () => {
    if (!postId || isUpdating) return;
    
    try {
      setIsUpdating(true);
      const response = await ApiService.likePost(postId);
      
      if (response.success) {
        const newLikedState = !userReactions.liked;
        setUserReactions(prev => ({
          ...prev,
          liked: newLikedState
        }));
        setLikesCount(prev => newLikedState ? prev + 1 : Math.max(0, prev - 1));
        
        if (onReactionChange) {
          onReactionChange({
            type: 'like',
            liked: newLikedState,
            likesCount: newLikedState ? likesCount + 1 : Math.max(0, likesCount - 1)
          });
        }
      }
    } catch (err) {
      console.error('Errore nell\'aggiornamento del like:', err);
      setError('Errore durante l\'aggiornamento del like');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReaction = async (reactionType) => {
    if (!postId || isUpdating) return;
    
    try {
      setIsUpdating(true);
      const response = await ApiService.reactToPost(postId, { type: reactionType });
      
      if (response.success) {
        const newReactions = response.data.reactions || reactions;
        setReactions(newReactions);
        setUserReactions(prev => ({
          ...prev,
          reaction: response.data.userReaction
        }));
        
        if (onReactionChange) {
          onReactionChange({
            type: 'reaction',
            reaction: response.data.userReaction,
            reactions: newReactions
          });
        }
      }
    } catch (err) {
      console.error('Errore nell\'aggiornamento della reazione:', err);
      setError('Errore durante l\'aggiornamento della reazione');
    } finally {
      setIsUpdating(false);
    }
  };

  const getReactionIcon = (type) => {
    switch (type) {
      case 'thumbsUp': return <FaThumbsUp />;
      case 'heart': return <FaHeart />;
      case 'clap': return <FaRegHandPeace />;
      case 'wow': return <FaSurprise />;
      case 'sad': return <FaSadTear />;
      default: return <FaSmile />;
    }
  };

  const getReactionText = (type) => {
    switch (type) {
      case 'thumbsUp': return 'Mi piace';
      case 'heart': return 'Adoro';
      case 'clap': return 'Applauso';
      case 'wow': return 'Wow';
      case 'sad': return 'Triste';
      default: return 'Reazione';
    }
  };

  if (loading) {
    return (
      <Button variant="outline-primary" disabled>
        <FaHeart className="me-2" /> Caricamento...
      </Button>
    );
  }

  return (
    <div className="d-flex gap-2">
      <Button 
        variant={userReactions.liked ? "primary" : "outline-primary"} 
        className="d-flex align-items-center btn-hover-effect"
        onClick={handleLike}
        disabled={isUpdating}
      >
        <FaHeart className={`me-2 ${userReactions.liked ? 'text-white' : ''}`} /> 
        {likesCount}
      </Button>
      
      {Object.keys(reactions).map(reactionType => (
        <OverlayTrigger
          key={reactionType}
          placement="top"
          overlay={<Tooltip>{getReactionText(reactionType)}</Tooltip>}
        >
          <Button 
            variant={userReactions.reaction === reactionType ? "primary" : "outline-primary"} 
            className="d-flex align-items-center btn-hover-effect"
            onClick={() => handleReaction(reactionType)}
            disabled={isUpdating}
            size="sm"
          >
            {getReactionIcon(reactionType)}
            {reactions[reactionType] > 0 && (
              <span className="ms-1">{reactions[reactionType]}</span>
            )}
          </Button>
        </OverlayTrigger>
      ))}
      
      {error && <div className="text-danger small">{error}</div>}
    </div>
  );
};

export default ReactionButtons; 