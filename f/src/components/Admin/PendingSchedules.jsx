import { useState, useEffect } from 'react';
import axios from '../../utils/auth';
import ScheduleDetailsModal from '../User/ScheduleDetailsModal';

function PendingSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [error, setError] = useState('');
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    loadSchedules(1, true);
    // eslint-disable-next-line
  }, []);

  const loadSchedules = (pageToLoad, reset = false) => {
    axios.get(`http://localhost:5226/api/schedule/pending?page=${pageToLoad}&pageSize=${pageSize}`)
      .then((res) => {
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
        const data = Array.isArray(res.data.data) ? res.data.data.map(normalize) : [];
        setSchedules(reset ? data : prev => [...prev, ...data]);
        setTotalCount(res.data.totalCount || 0);
        setPage(pageToLoad);
      })
      .catch((err) => {
        console.error('API error:', err.response?.data);
        setError('Lỗi khi tải danh sách lịch: ' + (err.response?.data || err.message));
      });
  };

  const handleLoadMore = () => {
    loadSchedules(page + 1);
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5226/api/schedule/${id}/approve`);
      setSchedules(schedules.filter((s) => s.id !== id));
    } catch (err) {
      setError('Lỗi khi duyệt lịch: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`http://localhost:5226/api/schedule/${id}`);
      setSchedules(schedules.filter((s) => s.id !== id));
    } catch (err) {
      setError('Lỗi khi xóa lịch: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRowClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
  };

  return (
    <div className="my-4 flex-grow-1" style={{ width: '98%', margin: '0 auto' }}>
      <h2 className="mb-4 text-center text-primary fw-bold" style={{ letterSpacing: 1 }}>Danh sách chờ duyệt</h2>
      {error && <div className="alert alert-danger">{error}</div>}
      <div className="card shadow-lg border-0 overflow-hidden" style={{ width: '98%', margin: '0 auto' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-striped table-bordered align-middle text-center mb-0" style={{ width: '100%', minWidth: 900, fontSize: '1.25rem' }}>
              <thead className="text-center align-middle" style={{ fontSize: '1.08rem', letterSpacing: 0.5, backgroundColor: '#FFFF99' }}>
                <tr style={{ backgroundColor: '#FFFF99' }}>
                  <th style={{ backgroundColor: '#FFFF99' }}>Thời gian</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Lãnh đạo cơ quan</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Nội dung</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Địa điểm</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Đơn vị</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Hành động</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '1.01rem' }}>
                {schedules.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center">Không có lịch chờ duyệt</td>
                  </tr>
                ) : (
                  schedules.map((s, index) => (
                    <tr
                      key={s.id || `pending-${index}`}
                      onClick={() => handleRowClick(s)}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleRowClick(s);
                        }
                      }}
                    >
                      <td>{`${s.startTime}–${s.endTime}`}</td>
                      <td>{s.leader}</td>
                      <td>{s.content}</td>
                      <td>{s.location}</td>
                      <td>{s.unit}</td>
                      <td onClick={(e) => e.stopPropagation()}>
                        <button
                          className="btn btn-success btn-sm me-2"
                          onClick={() => handleApprove(s.id)}
                        >
                          Duyệt
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDelete(s.id)}
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {/* Nút tiếp */}
      {(schedules.length < totalCount) && (
        <div className="text-center my-3">
          <button className="btn btn-primary" onClick={handleLoadMore}>
            Tiếp
          </button>
        </div>
      )}
      <ScheduleDetailsModal
        isOpen={!!selectedSchedule}
        onClose={handleCloseModal}
        schedule={selectedSchedule}
      />
    </div>
  );
}

export default PendingSchedules;