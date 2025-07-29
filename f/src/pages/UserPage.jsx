import { useState, useEffect } from 'react';
import axios from '../utils/auth';
import Sidebar from '../components/User/Sidebar';
import ScheduleTable from '../components/User/ScheduleTable';
import BookScheduleModal from '../components/User/BookScheduleModal';
import SearchSchedule, { SearchResults } from '../components/User/SearchSchedule';
import UserScheduleTable from '../components/User/UserScheduleTable';
import Navbar from '../components/Navbar';

function UserPage() {
  const [view, setView] = useState('schedule');
  const [schedules, setSchedules] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [user, setUser] = useState({
    username: 'Tên Người Dùng',
    role: 'User',
  });
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (role === 'Admin') {
      window.location.href = '/admin';
      return;
    }
    
    setUser({
      username: username || 'Tên Người Dùng',
      role: role || 'User',
    });
  }, []);

  useEffect(() => {
    if (view === 'schedule') {
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
          setSchedules(res.data.map(normalize));
        })
        .catch((err) => {
          if (err.response && err.response.status === 429) {
            alert('Gửi quá số yêu cầu ');
          }
        });
    }
  }, [view, refreshTrigger]);

  const handleSearchClose = () => {
    setSearchModalOpen(false);
  };

  const handleSearchResults = (results) => {
    setSearchResults(results);
  };

  const handleResetSearch = () => {
    setSearchResults([]);
  };

  const handleScheduleBooked = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <>
      <Navbar username={user.username} role={user.role} />
      <div className="d-flex align-items-stretch" style={{ paddingTop: '56px' }}>
        <Sidebar setView={setView} />
        <div className="flex-grow-1">
          {view === 'schedule' && <ScheduleTable schedules={schedules} />}
          {view === 'book' && (
            <>
              <div className="mb-3 p-3">
                <div className="d-flex gap-3">
                  <button className="btn btn-primary" onClick={() => setModalOpen(true)}>
                    <i className="bi bi-calendar-plus me-2"></i>Đặt lịch
                  </button>
                  <button className="btn btn-success" onClick={() => setSearchModalOpen(true)}>
                    <i className="bi bi-search me-2"></i>Tìm kiếm lịch
                  </button>
                </div>
              </div>
              <SearchResults schedules={searchResults} onReset={handleResetSearch} />
              <UserScheduleTable refreshTrigger={refreshTrigger} />
            </>
          )}
          <BookScheduleModal 
            isOpen={modalOpen} 
            onClose={() => setModalOpen(false)} 
            onScheduleBooked={handleScheduleBooked}
          />
          <SearchSchedule 
            isOpen={searchModalOpen} 
            onClose={handleSearchClose}
            onSearchResults={handleSearchResults}
          />
        </div>
      </div>
    </>
  );
}

export default UserPage;