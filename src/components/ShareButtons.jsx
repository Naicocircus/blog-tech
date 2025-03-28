import React, { useState } from 'react';
import { Button, OverlayTrigger, Tooltip, ButtonGroup } from 'react-bootstrap';
import { 
  FaFacebookF, 
  FaTwitter, 
  FaLinkedinIn, 
  FaWhatsapp, 
  FaLink, 
  FaShare,
  FaCheck 
} from 'react-icons/fa';
import ApiService from '../services/api';

const ShareButtons = ({ postId, url, title, description, className, onShareComplete }) => {
  const [copied, setCopied] = useState(false);
  
  // Utilizziamo l'URL corrente se non viene fornito
  const shareUrl = url || window.location.href;
  const shareTitle = title || document.title;
  const shareDescription = description || '';
  
  // Funzione per tracciare le condivisioni
  const trackShare = async (platform) => {
    if (!postId) return;
    
    try {
      await ApiService.trackShare(postId, platform);
      // Chiamiamo il callback se fornito
      if (onShareComplete && typeof onShareComplete === 'function') {
        onShareComplete();
      }
    } catch (error) {
      console.error('Errore durante il tracciamento della condivisione:', error);
    }
  };
  
  // Funzione per condividere sui vari social media
  const share = (platform) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`;
        break;
      case 'linkedin':
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareTitle + ' ' + shareUrl)}`;
        break;
      default:
        break;
    }
    
    if (shareLink) {
      // Traccia la condivisione
      trackShare(platform);
      
      // Apri la finestra di condivisione
      window.open(shareLink, '_blank', 'width=600,height=400');
    }
  };
  
  // Funzione per copiare l'URL negli appunti
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      
      // Traccia la copia del link come una condivisione
      trackShare('other');
      
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  return (
    <div className={`share-buttons ${className || ''}`}>
      <ButtonGroup aria-label="Condividi">
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Condividi su Facebook</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            onClick={() => share('facebook')}
            className="btn-hover-effect"
          >
            <FaFacebookF />
          </Button>
        </OverlayTrigger>
        
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Condividi su Twitter</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            onClick={() => share('twitter')}
            className="btn-hover-effect"
          >
            <FaTwitter />
          </Button>
        </OverlayTrigger>
        
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Condividi su LinkedIn</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            onClick={() => share('linkedin')}
            className="btn-hover-effect"
          >
            <FaLinkedinIn />
          </Button>
        </OverlayTrigger>
        
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>Condividi su WhatsApp</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            onClick={() => share('whatsapp')}
            className="btn-hover-effect"
          >
            <FaWhatsapp />
          </Button>
        </OverlayTrigger>
        
        <OverlayTrigger
          placement="top"
          overlay={<Tooltip>{copied ? 'Copiato!' : 'Copia link'}</Tooltip>}
        >
          <Button 
            variant="outline-primary" 
            onClick={copyToClipboard}
            className="btn-hover-effect"
          >
            {copied ? <FaCheck /> : <FaLink />}
          </Button>
        </OverlayTrigger>
      </ButtonGroup>
    </div>
  );
};

export default ShareButtons; 