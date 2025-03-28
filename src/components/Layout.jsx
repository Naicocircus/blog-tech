import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <>
      <Header />
      <main className="flex-grow-1">
        {children}
      </main>
      <Footer />
    </>
  );
};

export default Layout;