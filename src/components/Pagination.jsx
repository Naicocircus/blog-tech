import React from 'react';
import { Button } from 'react-bootstrap';

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange 
}) => {
  if (totalPages <= 1) return null;
  
  return (
    <div className="d-flex justify-content-center mt-4">
      <Button 
        variant="outline-primary" 
        className="me-2" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
      >
        Precedente
      </Button>
      
      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
        // Mostra al massimo 5 pagine, centrate sulla pagina corrente
        let pageNum;
        if (totalPages <= 5) {
          pageNum = i + 1;
        } else if (currentPage <= 3) {
          pageNum = i + 1;
        } else if (currentPage >= totalPages - 2) {
          pageNum = totalPages - 4 + i;
        } else {
          pageNum = currentPage - 2 + i;
        }
        
        return (
          <Button 
            key={pageNum}
            variant={pageNum === currentPage ? "primary" : "outline-primary"} 
            className="me-2"
            onClick={() => onPageChange(pageNum)}
          >
            {pageNum}
          </Button>
        );
      })}
      
      <Button 
        variant="outline-primary" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
      >
        Successiva
      </Button>
    </div>
  );
};

export default Pagination; 