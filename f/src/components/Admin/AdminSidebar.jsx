import React from 'react';

function AdminSidebar({ setView }) {
  return (
    <div className="sidebar bg-primary text-white p-3" style={{ width: '300px', minHeight: '100vh' }}>
      <ul className="list-unstyled">
        <li className="mb-2">
          <button className="btn btn-light w-100 text-nowrap" onClick={() => setView('pending')}>
            Chờ duyệt
          </button>
        </li>
        <li className="mb-2">
          <button className="btn btn-light w-100 text-nowrap" onClick={() => setView('approved')}>
            Đã duyệt
          </button>
        </li>
      </ul>
    </div>
  );
}

export default AdminSidebar;
