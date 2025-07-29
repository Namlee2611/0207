import { useState, useRef, useEffect } from 'react'; 
import axios from '../../utils/auth';
import ScheduleTable from './ScheduleTable';

function SearchSchedule({ isOpen, onClose, onSearchResults }) {
  const [form, setForm] = useState({
    leader: '',
    content: '',
    startTime: '',
    endTime: '',
    date: '',
    location: '',
    unit: '',
  });
  const modalRef = useRef(null);
  const firstInputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      firstInputRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          const focusable = modalRef.current.querySelectorAll('button, input');
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

  const handleSearch = async () => {
    try {
      const params = {};
      if (form.leader) params.leader = form.leader;
      if (form.content) params.content = form.content;
      if (form.startTime) params.startTime = form.startTime;
      if (form.endTime) params.endTime = form.endTime;
      if (form.date) params.date = form.date;
      if (form.location) params.location = form.location;
      if (form.unit) params.unit = form.unit;

      const res = await axios.get('http://localhost:5226/api/schedule/search', { params });
      onSearchResults(res.data);
      onClose();
    } catch (error) {
      console.error('Search error:', error.response?.data);
    }
  };

  const handleSubmit = () => {
    handleSearch();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({
      ...prevForm,
      [name]: value,
    }));
  };

  const handleClose = () => {
    onClose();
    setForm({ leader: '', content: '', startTime: '', endTime: '', date: '', location: '', unit: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-1050">
      <div
        className="modal-dialog modal-dialog-centered"
        ref={modalRef}
        style={{ width: '70%', maxWidth: '1000px' }}
      >
        <div
          className="modal-content p-4"
          style={{
            backgroundColor: '#d9f0ff',
            minHeight: '700px',
            borderRadius: '10px',
            boxShadow: '0 0 10px rgba(0,0,0,0.2)',
          }}
        >
          <div className="modal-header">
            <h5 className="modal-title">Tìm kiếm lịch</h5>
            <button type="button" className="btn-close" onClick={handleClose}></button>
          </div>
          <div className="modal-body">
            <form>
              <div className="mb-3">
                <label htmlFor="leader" className="form-label">Lãnh đạo</label>
                <input
                  id="leader"
                  name="leader"
                  type="text"
                  className="form-control"
                  value={form.leader}
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
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
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>
            </form>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={handleClose}>
              Đóng
            </button>
            <button type="button" className="btn btn-primary" onClick={handleSubmit}>
              Tìm kiếm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function SearchResults({ schedules, onReset }) {
  if (schedules.length === 0) return null;

  return (
    <div className="p-3">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6>Kết quả tìm kiếm ({schedules.length} lịch)</h6>
        <button
          className="btn btn-outline-secondary btn-sm"
          onClick={onReset}
        >
          Xóa bộ lọc
        </button>
      </div>
      <ScheduleTable schedules={schedules} isSearchContext={true} />
    </div>
  );
}

export default SearchSchedule;
