import React from 'react';

function EmptyState({ 
  icon = "bi-calendar-x", 
  title = "Không có dữ liệu", 
  message = "Chưa có thông tin nào được hiển thị",
  iconSize = "fs-1" 
}) {
  return (
    <div className="text-center text-muted py-5">
      <i className={`bi ${icon} ${iconSize}`}></i>
      <h5 className="mt-3 mb-2">{title}</h5>
      <p className="mb-0">{message}</p>
    </div>
  );
}

export default EmptyState; 