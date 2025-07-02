import { useState } from 'react';
import ScheduleDetailsModal from './ScheduleDetailsModal';
import {
  startOfISOWeek,
  endOfISOWeek,
  format,
  addWeeks,
  subWeeks,
  getISOWeek,
  eachDayOfInterval,
  getDay,
} from 'date-fns';

function ScheduleTable({ schedules = [], isSearchContext = false }) {
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());

  const vietnameseDays = [
    'Chủ Nhật',
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
  ];

  const handleRowClick = (schedule) => {
    setSelectedSchedule(schedule);
  };

  const handleCloseModal = () => {
    setSelectedSchedule(null);
  };

  const handlePrevWeek = () => {
    setCurrentDate((prev) => subWeeks(prev, 1));
  };

  const handleNextWeek = () => {
    setCurrentDate((prev) => addWeeks(prev, 1));
  };

  const currentWeekNumber = getISOWeek(currentDate);
  const weekStart = startOfISOWeek(currentDate);
  const weekEnd = endOfISOWeek(currentDate);
  const weekRange = `${format(weekStart, 'dd/MM/yyyy')} - ${format(weekEnd, 'dd/MM/yyyy')}`;
  const daysOfWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const daysWithSchedules = daysOfWeek.filter((day) =>
    schedules.some((s) => s.date === format(day, 'dd/MM/yyyy'))
  );

  const formatVietnameseDate = (date) => {
    const dayIndex = getDay(date);
    const dayName = vietnameseDays[dayIndex];
    const dayNumber = format(date, 'dd');
    const month = format(date, 'MM');
    return `${dayName}, ${dayNumber} tháng ${month}`;
  };

  return (
    <div className="my-4 flex-grow-1">
      {!isSearchContext && (
        <>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary" style={{ letterSpacing: 1 }}>Lịch công tác lãnh đạo cục</h2>
          </div>

          <div className="d-flex justify-content-center align-items-center mb-3 gap-3 flex-wrap">
            <button className="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm" onClick={handlePrevWeek}>
              ⬅️ Tuần trước
            </button>
            <div className="fw-semibold text-center">
              <div>Tuần {currentWeekNumber}</div>
              <small className="text-muted">{weekRange}</small>
            </div>
            <button className="btn btn-outline-primary rounded-pill px-4 py-2 shadow-sm" onClick={handleNextWeek}>
              Tuần sau ➡️
            </button>
          </div>
        </>
      )}

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
                {isSearchContext ? (
                  (() => {
                    if (!schedules || schedules.length === 0) {
                      return (
                        <tr>
                          <td colSpan="5" className="text-center py-4 text-muted">
                            Không có lịch công tác
                          </td>
                        </tr>
                      );
                    }
                    const grouped = schedules.reduce((acc, item) => {
                      if (item.date || item.Date) {
                        const dateKey = item.date || item.Date;
                        (acc[dateKey] = acc[dateKey] || []).push(item);
                      }
                      return acc;
                    }, {});
                    const sortedDates = Object.keys(grouped).sort((a, b) => {
                      const [da, ma, ya] = a.split('/').map(Number);
                      const [db, mb, yb] = b.split('/').map(Number);
                      return new Date(ya, ma - 1, da) - new Date(yb, mb - 1, db);
                    });
                    return sortedDates.flatMap(date => [
                      <tr key={`header-${date}`} className="table-secondary">
                        <td colSpan="5" className="fw-bold text-center">
                          {date}
                        </td>
                      </tr>,
                      ...grouped[date].map((s, index) => (
                        <tr
                          key={s.id || `search-${date}-${index}`}
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
                          <td className="text-center">{`${s.startTime || s.StartTime || ''}–${s.endTime || s.EndTime || ''}`}</td>
                          <td>{s.leader || s.Leader || ''}</td>
                          <td className="text-primary fw-semibold">{s.content || s.Content || ''}</td>
                          <td>{s.location || s.Location || ''}</td>
                          <td>{s.unit || s.Unit || ''}</td>
                        </tr>
                      ))
                    ]);
                  })()
                ) : (
                  daysWithSchedules.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="text-center py-4 text-muted">
                        Không có lịch công tác
                      </td>
                    </tr>
                  ) : (
                    daysWithSchedules.map((day) => {
                      const daySchedules = schedules.filter(
                        (s) => s.date === format(day, 'dd/MM/yyyy')
                      );
                      return [
                        <tr key={`header-${format(day, 'dd/MM/yyyy')}`} className="table-secondary">
                          <td colSpan="5" className="fw-bold text-center">
                            {formatVietnameseDate(day)}
                          </td>
                        </tr>,
                        ...daySchedules.map((s, index) => (
                          <tr
                            key={s.id || `schedule-${format(day, 'dd/MM/yyyy')}-${index}`}
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
                            <td className="text-center">{`${s.startTime || s.StartTime || ''}–${s.endTime || s.EndTime || ''}`}</td>
                            <td>{s.leader || s.Leader || ''}</td>
                            <td className="text-primary fw-semibold">{s.content || s.Content || ''}</td>
                            <td>{s.location || s.Location || ''}</td>
                            <td>{s.unit || s.Unit || ''}</td>
                          </tr>
                        )),
                      ];
                    })
                  )
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

export default ScheduleTable;