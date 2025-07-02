import { useState, useEffect, useRef } from 'react';
import axios from '../../utils/auth';

function EditScheduleModal({ isOpen, onClose, schedule, onScheduleUpdated }) {
  const [form, setForm] = useState({
    leader: '',
    content: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    unit: '',
    note: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen && schedule) {
      let formattedDate = schedule.date;
      if (schedule.date && schedule.date.includes('/')) {
        const dateParts = schedule.date.split('/');
        formattedDate = `${dateParts[2]}-${dateParts[1].padStart(2, '0')}-${dateParts[0].padStart(2, '0')}`;
      }
      
      setForm({
        leader: schedule.leader || '',
        content: schedule.content || '',
        startTime: schedule.startTime || '',
        endTime: schedule.endTime || '',
        date: formattedDate,
        location: schedule.location || '',
        unit: schedule.unit || '',
        note: schedule.note || ''
      });
      setError('');
      setSuccess('');
    }
  }, [isOpen, schedule]);

  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea');
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            last.focus();
            e.preventDefault();
          } else if (!e.shiftKey && document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      };
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [isOpen, onClose]);

  const handleSubmit = async () => {
    if (!form.leader || !form.content || !form.startTime || !form.endTime || !form.date || !form.location || !form.unit) {
      setError('Vui lòng điền đầy đủ các trường bắt buộc');
      return;
    }
    
    try {
      await axios.put(`http://localhost:5226/api/schedule/${schedule.id}`, {
        leader: form.leader,
        content: form.content,
        startTime: form.startTime,
        endTime: form.endTime,
        date: form.date,
        location: form.location,
        unit: form.unit,
        note: form.note
      });
      
      setSuccess('Cập nhật lịch thành công');
      setError('');
      
      if (onScheduleUpdated) {
        onScheduleUpdated();
      }
      
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError('Cập nhật lịch thất bại: ' + (err.response?.data || err.message));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-1050">
      <div
        className="modal-dialog modal-dialog-centered shadow-lg rounded-4 border-0"
        ref={modalRef}
        style={{ width: '90%', maxWidth: '600px' }}
      >
        <div
          className="modal-content p-4 rounded-4 border-0"
          style={{
            backgroundColor: '#f8fbff',
            minHeight: '500px',
            borderRadius: '18px',
            boxShadow: '0 0 18px rgba(0,0,0,0.13)'
          }}
        >
          <div className="modal-header border-0 pb-2 justify-content-center">
            <h5 className="modal-title fw-bold text-primary text-center w-100" style={{ fontSize: '1.5rem', letterSpacing: 1 }}>Sửa lịch</h5>
          </div>
          <div className="modal-body pt-0">
            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}
            <form>
              <div className="mb-3">
                <label htmlFor="leader" className="form-label">Lãnh đạo</label>
                <input
                  id="leader"
                  name="leader"
                  type="text"
                  className="form-control"
                  value={form.leader}
                  onChange={(e) => setForm({ ...form, leader: e.target.value })}
                  ref={firstInputRef}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="content" className="form-label">Nội dung</label>
                <input
                  id="content"
                  name="content"
                  type="text"
                  className="form-control"
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="startTime" className="form-label">Thời gian bắt đầu</label>
                <input
                  id="startTime"
                  name="startTime"
                  type="time"
                  className="form-control"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="endTime" className="form-label">Thời gian kết thúc</label>
                <input
                  id="endTime"
                  name="endTime"
                  type="time"
                  className="form-control"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="date" className="form-label">Ngày</label>
                <input
                  id="date"
                  name="date"
                  type="date"
                  className="form-control"
                  value={form.date}
                  onChange={(e) => setForm({ ...form, date: e.target.value })}
                />
              </div>
              <div className="mb-3">
                <label htmlFor="location" className="form-label">Địa điểm</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  className="form-control"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="unit" className="form-label">Đơn vị</label>
                <input
                  id="unit"
                  name="unit"
                  type="text"
                  className="form-control"
                  value={form.unit}
                  onChange={(e) => setForm({ ...form, unit: e.target.value })}
                  autoComplete="off"
                />
              </div>
              <div className="mb-3">
                <label htmlFor="note" className="form-label">Ghi chú</label>
                <textarea
                  id="note"
                  name="note"
                  className="form-control"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                  rows="4"
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer border-0 pt-2 justify-content-end">
            <button type="button" className="btn btn-secondary rounded-pill px-4 me-2" onClick={onClose}>Đóng</button>
            <button type="button" className="btn btn-primary rounded-pill px-4" onClick={handleSubmit}>Cập nhật</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default EditScheduleModal; 