import { useState, useEffect } from 'react';
import axios from '../../utils/auth';
import EditScheduleModal from './EditScheduleModal';
import EmptyState from './EmptyState';

function UserScheduleTable({ refreshTrigger }) {
  const [userSchedules, setUserSchedules] = useState([]);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    loadUserSchedules(1, true);
  }, []);

  useEffect(() => {
    if (refreshTrigger > 0) {
      loadUserSchedules(1, true);
    }
  }, [refreshTrigger]);

  const loadUserSchedules = async (pageToLoad, reset = false) => {
    try {
      const response = await axios.get(`http://localhost:5226/api/schedule/user/${userId}?page=${pageToLoad}&pageSize=${pageSize}`);
      const normalize = s => ({
        id: s.id || s.Id,
        leader: s.leader || s.Leader,
        content: s.content || s.Content,
        startTime: s.startTime || s.StartTime,
        endTime: s.endTime || s.EndTime,
        date: s.date || s.Date,
        location: s.location || s.Location,
        unit: s.unit || s.Unit,
        note: s.note || s.Note,
        isApproved: s.isApproved ?? s.IsApproved,
        userId: s.userId ?? s.UserId,
      });
      const data = Array.isArray(response.data.data) ? response.data.data.map(normalize) : [];
      setUserSchedules(reset ? data : prev => [...prev, ...data]);
      setTotalCount(response.data.totalCount || 0);
      setPage(pageToLoad);
    } catch (error) {
      if (error.response && error.response.status === 429) {
        alert('Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau!');
      } else {
        console.error('Error loading user schedules:', error)
      }
    }
  };

  const handleLoadMore = () => {
    loadUserSchedules(page + 1);
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
    // Nếu là dạng ISO (có T)
    if (/^\d{4}-\d{2}-\d{2}T/.test(dateString)) {
      const [year, month, day] = dateString.split('T')[0].split('-');
      return `${day}/${month}/${year}`;
    }
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    }
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
            {userSchedules.map((schedule, idx) => (
              <tr key={schedule.id || idx}>
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
      {/* Nút tiếp */}
      {(userSchedules.length < totalCount) && (
        <div className="text-center my-3">
          <button className="btn btn-primary" onClick={handleLoadMore}>
            Tiếp
          </button>
        </div>
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