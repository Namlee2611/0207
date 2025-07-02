import { useRef, useEffect } from 'react';

function ScheduleDetailsModal({ isOpen, onClose, schedule }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      closeButtonRef.current?.focus();
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'Tab') {
          const focusable = modalRef.current.querySelectorAll('button');
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

  if (!isOpen || !schedule) return null;

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
            minHeight: '350px',
            borderRadius: '18px',
            boxShadow: '0 0 18px rgba(0,0,0,0.13)'
          }}
        >
          <div className="modal-header border-0 pb-2">
            <h5 className="modal-title fw-bold text-primary">Chi tiết lịch</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Đóng"
              ref={closeButtonRef}
            ></button>
          </div>
          <div className="modal-body pt-0">
            {/* <div className="mb-3">
              <strong>ID:</strong> {schedule.id}
            </div> */}
            <div className="mb-3">
              <strong>Lãnh đạo cơ quan:</strong> {schedule.leader || schedule.Leader}
            </div>
            <div className="mb-3">
              <strong>Nội dung:</strong> {schedule.content || schedule.Content}
            </div>
            <div className="mb-3">
              <strong>Thời gian bắt đầu:</strong> {schedule.startTime || schedule.StartTime}
            </div>
            <div className="mb-3">
              <strong>Thời gian kết thúc:</strong> {schedule.endTime || schedule.EndTime}
            </div>
            <div className="mb-3">
              <strong>Ngày:</strong> {schedule.date || schedule.Date}
            </div>
            <div className="mb-3">
              <strong>Địa điểm:</strong> {schedule.location || schedule.Location}
            </div>
            <div className="mb-3">
              <strong>Đơn vị:</strong> {schedule.unit || schedule.Unit}
            </div>
            <div className="mb-3">
              <strong>Ghi chú:</strong> {schedule.note || schedule.Note || 'Không có'}
            </div>
            {/* <div className="mb-3">
              <strong>Trạng thái:</strong> {schedule.isApproved ? 'Đã duyệt' : 'Chờ duyệt'}
            </div> */}
          </div>
          <div className="modal-footer border-0 pt-2">
            <button type="button" className="btn btn-secondary rounded-pill px-4" onClick={onClose}>Đóng</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ScheduleDetailsModal;