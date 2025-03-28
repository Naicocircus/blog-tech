import React, { useState } from 'react';
import { Form, Button, InputGroup, Collapse, Row, Col, Badge } from 'react-bootstrap';
import { FaSearch, FaFilter, FaTimes, FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

const SearchBar = ({ 
  onSearch, 
  suggestions = [], 
  availableCategories = [],
  initialValues = {}
}) => {
  // Stati per la ricerca e i filtri
  const [searchTerm, setSearchTerm] = useState(initialValues.searchTerm || '');
  const [showAdvancedSearch, setShowAdvancedSearch] = useState(false);
  const [category, setCategory] = useState(initialValues.category || '');
  const [tags, setTags] = useState(initialValues.tags || '');
  const [sortBy, setSortBy] = useState(initialValues.sortBy || 'createdAt');
  const [sortOrder, setSortOrder] = useState(initialValues.sortOrder || 'desc');
  const [fromDate, setFromDate] = useState(initialValues.fromDate || null);
  const [toDate, setToDate] = useState(initialValues.toDate || null);

  // Gestisci la ricerca
  const handleSearch = (e) => {
    e.preventDefault();
    
    onSearch({
      searchTerm,
      category,
      tags,
      sortBy,
      sortOrder,
      fromDate,
      toDate
    });
  };

  // Resetta tutti i filtri
  const resetFilters = () => {
    setSearchTerm('');
    setCategory('');
    setTags('');
    setSortBy('createdAt');
    setSortOrder('desc');
    setFromDate(null);
    setToDate(null);
    
    onSearch({
      searchTerm: '',
      category: '',
      tags: '',
      sortBy: 'createdAt',
      sortOrder: 'desc',
      fromDate: null,
      toDate: null
    });
  };

  // Gestisci il click su un suggerimento
  const handleSuggestionClick = (suggestion) => {
    setTags(suggestion);
    
    onSearch({
      searchTerm,
      category,
      tags: suggestion,
      sortBy,
      sortOrder,
      fromDate,
      toDate
    });
  };

  // Gestisci il click su un tag
  const handleTagClick = (tag) => {
    setTags(tag);
    setShowAdvancedSearch(true);
    
    onSearch({
      searchTerm,
      category,
      tags: tag,
      sortBy,
      sortOrder,
      fromDate,
      toDate
    });
  };

  return (
    <Form onSubmit={handleSearch}>
      <InputGroup className="border-glow mb-3">
        <Form.Control
          type="text"
          placeholder="Cerca per titolo, contenuto o tag..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="bg-dark text-light border-0"
        />
        <Button variant="primary" type="submit" className="btn-hover-effect">
          <FaSearch /> Cerca
        </Button>
        <Button 
          variant="outline-primary" 
          onClick={() => setShowAdvancedSearch(!showAdvancedSearch)}
          className="btn-hover-effect"
        >
          <FaFilter /> Filtri
        </Button>
      </InputGroup>
      
      {suggestions.length > 0 && (
        <div className="mb-3">
          <small className="text-muted">Suggerimenti: </small>
          {suggestions.map((suggestion, index) => (
            <Badge 
              key={index} 
              bg="secondary" 
              className="me-1 mb-1 clickable"
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ cursor: 'pointer' }}
            >
              {suggestion}
            </Badge>
          ))}
        </div>
      )}
      
      <Collapse in={showAdvancedSearch}>
        <div className="advanced-search-container bg-dark p-3 rounded mb-4">
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Categoria</Form.Label>
                <Form.Select 
                  value={category} 
                  onChange={(e) => setCategory(e.target.value)}
                  className="bg-dark text-light border-secondary"
                >
                  <option value="">Tutte le categorie</option>
                  {availableCategories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Tag (separati da virgola)</Form.Label>
                <Form.Control 
                  type="text" 
                  value={tags} 
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="es. Arduino, ESP32, React"
                  className="bg-dark text-light border-secondary"
                />
              </Form.Group>
            </Col>
          </Row>
          
          <Row>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Ordina per</Form.Label>
                <InputGroup>
                  <Form.Select 
                    value={sortBy} 
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-dark text-light border-secondary"
                  >
                    <option value="createdAt">Data</option>
                    <option value="title">Titolo</option>
                    <option value="readTime">Tempo di lettura</option>
                    <option value="category">Categoria</option>
                  </Form.Select>
                  <Button 
                    variant="outline-secondary" 
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  >
                    {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
                  </Button>
                </InputGroup>
              </Form.Group>
            </Col>
            <Col md={6} className="mb-3">
              <Form.Group>
                <Form.Label>Intervallo di date</Form.Label>
                <div className="d-flex">
                  <div className="me-2 flex-grow-1">
                    <DatePicker
                      selected={fromDate}
                      onChange={date => setFromDate(date)}
                      selectsStart
                      startDate={fromDate}
                      endDate={toDate}
                      placeholderText="Data inizio"
                      className="form-control bg-dark text-light border-secondary"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </div>
                  <div className="flex-grow-1">
                    <DatePicker
                      selected={toDate}
                      onChange={date => setToDate(date)}
                      selectsEnd
                      startDate={fromDate}
                      endDate={toDate}
                      minDate={fromDate}
                      placeholderText="Data fine"
                      className="form-control bg-dark text-light border-secondary"
                      dateFormat="dd/MM/yyyy"
                      isClearable
                    />
                  </div>
                </div>
              </Form.Group>
            </Col>
          </Row>
          
          <div className="d-flex justify-content-between">
            <Button variant="outline-danger" onClick={resetFilters}>
              <FaTimes /> Resetta filtri
            </Button>
            <Button variant="primary" type="submit">
              <FaSearch /> Applica filtri
            </Button>
          </div>
        </div>
      </Collapse>
    </Form>
  );
};

export default SearchBar; 