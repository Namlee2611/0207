import React from 'react';
import { useNavigate } from 'react-router-dom';

const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="container d-flex justify-content-center align-items-center vh-100">
      <div className="text-center">
        <p className="mb-4">Bạn không có quyền truy cập vào trang này.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/user')}
        >
          Quay về trang chủ
        </button>
      </div>
    </div>
  );
};

export default UnauthorizedPage; 