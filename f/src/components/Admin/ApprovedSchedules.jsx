import { useState, useEffect } from 'react';
import axios from '../../utils/auth';
import ScheduleDetailsModal from '../User/ScheduleDetailsModal';
import { parse, format, getDay } from 'date-fns';
import { useNavigate } from 'react-router-dom';

function ApprovedSchedules() {
  const [schedules, setSchedules] = useState([]);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const vietnameseDays = [
    'Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy',
  ];

  useEffect(() => {
    const role = localStorage.getItem('role');
    if (role !== 'Admin') navigate('/user');

    axios.get('http://localhost:5226/api/schedule/approved')
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
        setSchedules(Array.isArray(res.data) ? res.data.map(normalize) : []);
      })
      .catch((err) => {
        console.error('API error:', err.response?.data);
        setMessage('Lỗi khi tải lịch');
      });
  }, [navigate]);

  const handleRowClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
  };

  const formatVietnameseDate = (dateStr) => {
    try {
      if (!dateStr) return 'Ngày không xác định';
      const date = parse(dateStr, 'dd/MM/yyyy', new Date());
      if (isNaN(date.getTime())) {
        return dateStr; // Trả về chuỗi gốc nếu không parse được
      }
      const dayName = vietnameseDays[getDay(date)];
      const formatted = format(date, 'dd/MM/yyyy');
      return `${dayName}, ${formatted}`;
    } catch (error) {
      console.error('Error formatting date:', dateStr, error);
      return dateStr; 
    }
  };

  const groupedSchedules = schedules.reduce((acc, item) => {
    (acc[item.date] = acc[item.date] || []).push(item);
    return acc;
  }, {});

  const sortedDates = Object.keys(groupedSchedules).sort((a, b) => {
    const d1 = parse(a, 'dd/MM/yyyy', new Date());
    const d2 = parse(b, 'dd/MM/yyyy', new Date());
    return d1 - d2;
  });

  return (
    <div className="my-4 flex-grow-1" style={{ width: '98%', margin: '0 auto' }}>
      <h2 className="mb-4 text-primary fw-bold text-center" style={{ letterSpacing: 1 }}>Danh sách lịch đã duyệt</h2>
      {message && <p className="text-danger text-center">{message}</p>}
      <div className="card shadow-lg border-0 overflow-hidden" style={{ width: '98%', margin: '0 auto' }}>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover table-bordered mb-0 align-middle text-center" style={{ width: '100%', minWidth: 900, fontSize: '1.25rem' }}>
              <thead className="text-center align-middle" style={{ fontSize: '1.08rem', letterSpacing: 0.5, backgroundColor: '#FFFF99' }}>
                <tr style={{ backgroundColor: '#FFFF99' }}>
                  <th style={{ backgroundColor: '#FFFF99', minWidth: '120px' }}>Thời gian</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Lãnh đạo</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Nội dung</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Địa điểm</th>
                  <th style={{ backgroundColor: '#FFFF99' }}>Đơn vị</th>
                </tr>
              </thead>
              <tbody style={{ fontSize: '1.01rem' }}>
                {sortedDates.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-muted">
                      Không có lịch công tác
                    </td>
                  </tr>
                ) : (
                  sortedDates.map((date) => (
                    [
                      <tr key={`header-${date}`} className="table-secondary">
                        <td colSpan="5" className="fw-bold text-center">
                          {formatVietnameseDate(date)}
                        </td>
                      </tr>,
                      ...groupedSchedules[date].map((s, index) => (
                        <tr
                          key={s.id || `approved-${date}-${index}`}
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
                          className="align-middle"
                        >
                          <td className="text-center">{`${s.startTime}–${s.endTime}`}</td>
                          <td>{s.leader}</td>
                          <td className="text-primary fw-semibold">{s.content}</td>
                          <td>{s.location}</td>
                          <td>{s.unit}</td>
                        </tr>
                      ))
                    ]
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <ScheduleDetailsModal
        isOpen={!!selectedSchedule}
        onClose={handleCloseModal}
        schedule={selectedSchedule}
      />
    </div>
  );
}

export default ApprovedSchedules;