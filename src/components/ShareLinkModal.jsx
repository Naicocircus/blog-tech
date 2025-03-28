import React, { useState, useRef } from 'react';
import { Modal, Button, Form, InputGroup } from 'react-bootstrap';
import { FaCopy, FaCheck, FaLink, FaFacebookF, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import ApiService from '../services/api';

const ShareLinkModal = ({ show, onHide, url, title, postId, onShareComplete }) => {
  const [copied, setCopied] = useState(false);
  const linkInput = useRef(null);
  
  // Utilizziamo l'URL corrente se non viene fornito
  const shareUrl = url || window.location.href;
  
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
  
  const copyToClipboard = () => {
    linkInput.current.select();
    document.execCommand('copy');
    
    // Utilizziamo anche l'API Clipboard moderna se disponibile
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
    }
    
    setCopied(true);
    
    // Traccia la copia del link come una condivisione
    trackShare('other');
    
    setTimeout(() => setCopied(false), 2000);
  };
  
  // Funzione per condividere sui social media
  const shareOnSocial = (platform) => {
    let shareLink = '';
    
    switch (platform) {
      case 'facebook':
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
        break;
      case 'twitter':
        shareLink = `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(title || '')}`;
        break;
      case 'whatsapp':
        shareLink = `https://api.whatsapp.com/send?text=${encodeURIComponent((title || '') + ' ' + shareUrl)}`;
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
  
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Condividi contenuto</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {title && <p className="fw-bold mb-3">{title}</p>}
        
        <p className="mb-3">Copia il link per condividere questo contenuto:</p>
        
        <InputGroup className="mb-3">
          <Form.Control
            ref={linkInput}
            type="text"
            value={shareUrl}
            readOnly
            onClick={(e) => e.target.select()}
          />
          <Button 
            variant="outline-primary" 
            onClick={copyToClipboard}
          >
            {copied ? <FaCheck /> : <FaCopy />}
          </Button>
        </InputGroup>
        
        <div className="d-flex flex-column gap-2 mt-4">
          <Button 
            variant="primary" 
            className="d-flex align-items-center justify-content-center gap-2"
            onClick={() => shareOnSocial('facebook')}
          >
            <FaFacebookF /> Condividi su Facebook
          </Button>
          
          <Button 
            variant="info" 
            className="d-flex align-items-center justify-content-center gap-2 text-white"
            onClick={() => shareOnSocial('twitter')}
          >
            <FaTwitter /> Condividi su Twitter
          </Button>
          
          <Button 
            variant="success" 
            className="d-flex align-items-center justify-content-center gap-2"
            onClick={() => shareOnSocial('whatsapp')}
          >
            <FaWhatsapp /> Condividi su WhatsApp
          </Button>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>
          Chiudi
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ShareLinkModal; 