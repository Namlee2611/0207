import { useState, useEffect } from 'react';
import axios from '../../utils/auth';
import EditScheduleModal from './EditScheduleModal';
import EmptyState from './EmptyState';

function UserScheduleTable({ refreshTrigger }) {
  const [userSchedules, setUserSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadUserSchedules();
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadUserSchedules();
    }
  }, [refreshTrigger]);

  const loadUserSchedules = async () => {
    try {
      const response = await axios.get(`http://localhost:5226/api/schedule/user/${userId}`);
      setUserSchedules(response.data);
    } catch (error) {
      console.error('Error loading user schedules:', error);
    }
  };

  const handleEdit = (schedule) => {
    setEditingSchedule(schedule);
    setIsEditModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc muốn xóa lịch này?')) {
      try {
        await axios.delete(`http://localhost:5226/api/schedule/${id}`);
        loadUserSchedules(); 
      } catch (error) {
        console.error('Error deleting schedule:', error);
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    // Nếu là yyyy-MM-dd (ISO), parse bình thường
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
    // Nếu là dd/MM/yyyy thì parse thủ công
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${day}/${month}/${year}`;
    }
    return dateString;
  };

  const formatTime = (timeString) => {
    if (!timeString) return '';
    return timeString.substring(0, 5);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setEditingSchedule(null);
  };

  const handleScheduleUpdated = () => {
    loadUserSchedules();
  };

  return (
    <div className="mt-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="mb-0">Lịch của tôi</h5>
        <span className="text-muted small">
          Tổng cộng: {userSchedules.length} lịch
        </span>
      </div>
      <div className="table-responsive">
        <table className="table table-striped table-hover table-bordered" style={{ fontSize: '0.9rem' }}>
          <thead className="table-primary">
            <tr>
              <th className="text-center align-middle" style={{ width: '12%', fontSize: '0.85rem' }}>Ngày</th>
              <th className="text-center align-middle" style={{ width: '12%', fontSize: '0.85rem' }}>Thời gian</th>
              <th className="text-center align-middle" style={{ width: '15%', fontSize: '0.85rem' }}>Lãnh đạo</th>
              <th className="text-center align-middle" style={{ width: '25%', fontSize: '0.85rem' }}>Nội dung</th>
              <th className="text-center align-middle" style={{ width: '15%', fontSize: '0.85rem' }}>Địa điểm</th>
              <th className="text-center align-middle" style={{ width: '12%', fontSize: '0.85rem' }}>Đơn vị</th>
              <th className="text-center align-middle" style={{ width: '10%', fontSize: '0.85rem' }}>Trạng thái</th>
              <th className="text-center align-middle" style={{ width: '9%', fontSize: '0.85rem' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {userSchedules.map((schedule) => (
              <tr key={schedule.id}>
                <td className="text-center align-middle">
                  <span className="fw-semibold text-dark">
                    {formatDate(schedule.date)}
                  </span>
                </td>
                <td className="text-center align-middle">
                  <span className="text-dark">
                    {formatTime(schedule.startTime)}–{formatTime(schedule.endTime)}
                  </span>
                </td>
                <td className="align-middle">
                  <span className="text-dark">
                    {schedule.leader}
                  </span>
                </td>
                <td className="align-middle">
                  <span className={`fw-semibold ${schedule.isApproved ? 'text-primary' : 'text-danger'}`}>
                    {schedule.content}
                  </span>
                </td>
                <td className="align-middle">
                  <span className="text-dark">
                    {schedule.location}
                  </span>
                </td>
                <td className="align-middle">
                  <span className="text-dark">
                    {schedule.unit}
                  </span>
                </td>
                <td className="text-center align-middle">
                  <span className={`badge ${schedule.isApproved ? 'bg-success' : 'bg-warning'}`}>
                    {schedule.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
                  </span>
                </td>
                <td className="text-center align-middle">
                  {!schedule.isApproved && (
                    <div className="btn-group btn-group-sm">
                      <button 
                        className="btn btn-primary" 
                        onClick={() => handleEdit(schedule)}
                        title="Sửa lịch"
                      >
                        <i className="bi bi-pencil"></i> Sửa
                      </button>
                      <button 
                        className="btn btn-danger" 
                        onClick={() => handleDelete(schedule.id)}
                        title="Xóa lịch"
                      >
                        <i className="bi bi-trash"></i> Xóa
                      </button>
                    </div>
                  )}
                  {schedule.isApproved && (
                    <span className="text-muted small">Không thể sửa</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {userSchedules.length === 0 && (
        <EmptyState 
          icon="bi-calendar-x"
          title="Chưa có lịch nào"
          message="Bạn chưa đặt lịch công tác nào"
        />
      )}

      <EditScheduleModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        schedule={editingSchedule}
        onScheduleUpdated={handleScheduleUpdated}
      />
    </div>
  );
}

export default UserScheduleTable; 