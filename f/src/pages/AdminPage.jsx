import { useState, useEffect } from 'react';
import AdminSidebar from '../components/Admin/AdminSidebar';
import PendingSchedules from '../components/Admin/PendingSchedules';
import ApprovedSchedules from '../components/Admin/ApprovedSchedules';
import UserManagement from '../components/Admin/UserManagement';
import Navbar from '../components/Navbar';

function AdminPage() {
  const [view, setView] = useState('pending');
  const [user, setUser] = useState({
    username: 'Admin',
    role: 'Admin',
  });

  useEffect(() => {
    const username = localStorage.getItem('username');
    const role = localStorage.getItem('role');
    
    if (role !== 'Admin') {
      window.location.href = '/user';
      return;
    }
    
    setUser({
      username: username || 'Admin',
      role: role || 'Admin',
    });
  }, []);

  return (
    <>
      <Navbar 
        username={user.username} 
        role={user.role} 
        onNavChange={setView}
        currentView={view}
      />
      <div className="d-flex align-items-stretch" style={{ paddingTop: '56px' }}>
        {view !== 'users' && <AdminSidebar setView={setView} />}
        <div className={`${view === 'users' ? 'w-100' : 'flex-grow-1'} p-4`}>
          {view === 'pending' && <PendingSchedules />}
          {view === 'approved' && <ApprovedSchedules />}
          {view === 'users' && <UserManagement />}
        </div>
      </div>
    </>
  );
}

export default AdminPage;