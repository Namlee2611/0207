import React from 'react';
import { Navbar as BootstrapNavbar, Container } from 'react-bootstrap';
import UserDropdown from './UserDropdown';

const Navbar = ({ username, role, onNavChange, currentView }) => {
  return (
    <BootstrapNavbar bg="dark" variant="dark" expand="lg" fixed="top">
      <Container>
        <BootstrapNavbar.Brand href={role === 'Admin' ? '/admin' : '/user'}>
        </BootstrapNavbar.Brand>
        {role === 'Admin' && (
          <div className="d-flex mx-auto gap-3">
            <button
              className={`btn btn-outline-light ${currentView !== 'users' ? 'active' : ''}`}
              onClick={() => onNavChange('pending')}
            >
              Quản lý lịch công tác
            </button>
            <button
              className={`btn btn-outline-light ${currentView === 'users' ? 'active' : ''}`}
              onClick={() => onNavChange('users')}
            >
              Quản lý người dùng
            </button>
          </div>
        )}
        <UserDropdown username={username} role={role} />
      </Container>
    </BootstrapNavbar>
  );
};

export default Navbar;