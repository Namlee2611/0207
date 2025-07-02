import { useState, useEffect } from 'react';
import axios from '../../utils/auth';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ username: '', password: '', role: 'User' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5226/api/user');
      setUsers(res.data);
    } catch (error) {
      setError('Lấy danh sách người dùng thất bại: ' + error.message);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAdd = async () => {
    if (!form.username || !form.password) {
      setError('Vui lòng điền đầy đủ username và password');
      return;
    }
    
    if (form.role === 'Admin') {
      const existingAdmin = users.find(u => u.Role === 'Admin');
      if (existingAdmin) {
        setError('Chỉ được phép có 1 tài khoản Admin duy nhất');
        return;
      }
    }
    
    try {
      await axios.post('http://localhost:5226/api/user', {
        Username: form.username,
        Password: form.password,
        Role: form.role,
      });
      setSuccess('Thêm người dùng thành công');
      fetchUsers(); 
      setForm({ username: '', password: '', role: 'User' });
      setError('');
      setShowModal(false);
      setTimeout(() => setSuccess(''), 1500);
    } catch (error) {
      setError('Thêm người dùng thất bại: ' + (error.response?.data?.title || error.message));
    }
  };

  const handleEdit = async (id) => {
    if (!form.username || !form.password) {
      setError('Vui lòng điền đầy đủ username và password');
      return;
    }
    
    // Tìm user hiện tại để lấy role
    const currentUser = users.find(u => u.Id === id);
    if (!currentUser) {
      setError('Không tìm thấy người dùng');
      return;
    }
    
    try {
      await axios.put(`http://localhost:5226/api/user/${id}`, {
        Username: form.username,
        Password: form.password,
        Role: currentUser.Role, // Giữ nguyên role hiện tại
      });
      setSuccess('Cập nhật người dùng thành công');
      fetchUsers(); 
      setError('');
      setShowModal(false);
      setEditId(null);
      setForm({ username: '', password: '', role: 'User' });
      setTimeout(() => setSuccess(''), 1500);
    } catch (error) {
      setError('Sửa người dùng thất bại: ' + (error.response?.data?.title || error.message));
    }
  };

  const handleDelete = async (id) => {
    // Tìm user để kiểm tra role
    const userToDelete = users.find(u => u.Id === id);
    if (!userToDelete) {
      setError('Không tìm thấy người dùng');
      return;
    }
    
    // Không cho phép xóa admin
    if (userToDelete.Role === 'Admin') {
      setError('Không thể xóa tài khoản Admin');
      return;
    }
    
    if (window.confirm(`Bạn có chắc muốn xóa người dùng "${userToDelete.Username}"?`)) {
      try {
        await axios.delete(`http://localhost:5226/api/user/${id}`);
        setSuccess('Xóa người dùng thành công');
        fetchUsers();
        setError('');
        setTimeout(() => setSuccess(''), 1500);
      } catch (error) {
        setError('Xóa người dùng thất bại: ' + (error.response?.data?.title || error.message));
      }
    }
  };

  const openAddModal = () => {
    setForm({ username: '', password: '', role: 'User' });
    setEditId(null);
    setError('');
    setShowModal(true);
  };

  const openEditModal = (user) => {
    setForm({ username: user.Username, password: user.Password || '', role: user.Role });
    setEditId(user.Id);
    setError('');
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditId(null);
    setForm({ username: '', password: '', role: 'User' });
    setError('');
  };

  return (
    <div className="container-fluid mt-4">
      <div className="row">
        <div className="col-12">
                    <h2 className="mb-4 text-primary">
            <i className="bi bi-people-fill me-2"></i>
            Quản lý người dùng
          </h2>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-primary" onClick={openAddModal}>
              <i className="bi bi-person-plus me-2"></i>
              Thêm người dùng
            </button>
            <span className="text-muted">
              Tổng cộng: {users.length} người dùng
            </span>
          </div>
              <div className="table-responsive">
          <table className="table table-striped table-bordered align-middle text-center mb-0" style={{ fontSize: '0.9rem' }}>
            <thead className="table-primary text-center align-middle" style={{ fontSize: '0.85rem', letterSpacing: 0.5 }}>
              <tr>
                {/* <th style={{ width: '15%' }}>ID</th> */}
                <th style={{ width: '40%' }}>Username</th>
                <th style={{ width: '30%' }}>Vai trò</th>
                <th style={{ width: '30%' }}>Hành động</th>
              </tr>
            </thead>
          <tbody style={{ fontSize: '0.9rem' }}>
            {users.length === 0 ? (
              <tr>
                <td colSpan="3" className="text-center py-5">
                  <div className="text-muted">
                    <i className="bi bi-people fs-1 d-block mb-2"></i>
                    <span>Chưa có người dùng nào</span>
                  </div>
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.Id}>
                  {/* <td className="text-center">
                    <span className="badge bg-secondary">{u.Id}</span>
                  </td> */}
                  <td className="text-start">
                    <span className="fw-semibold text-dark">{u.Username}</span>
                  </td>
                  <td className="text-center">
                    <span className={`badge ${u.Role === 'Admin' ? 'bg-danger' : 'bg-primary'}`}>
                      {u.Role}
                    </span>
                  </td>
                  <td className="text-center">
                    <div className="btn-group btn-group-sm">
                      <button
                        className="btn btn-warning"
                        onClick={() => openEditModal(u)}
                        title="Sửa người dùng"
                      >
                        <i className="bi bi-pencil me-1"></i>Sửa
                      </button>
                      {u.Role !== 'Admin' && (
                        <button
                          className="btn btn-danger"
                          onClick={() => handleDelete(u.Id)}
                          title="Xóa người dùng"
                        >
                          <i className="bi bi-trash me-1"></i>Xóa
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50 d-flex justify-content-center align-items-center z-1050">
          <div
            className="modal-dialog modal-dialog-centered shadow-lg rounded-4 border-0"
            style={{ width: '90%', maxWidth: '500px' }}
          >
            <div
              className="modal-content p-4 rounded-4 border-0"
              style={{
                backgroundColor: '#f8fbff',
                borderRadius: '18px',
                boxShadow: '0 0 18px rgba(0,0,0,0.13)'
              }}
            >
              <div className="modal-header border-0 pb-2 justify-content-center">
                <h5 className="modal-title fw-bold text-primary text-center w-100" style={{ fontSize: '1.5rem', letterSpacing: 1 }}>
                  {editId ? 'Cập nhật thông tin người dùng' : 'Thêm người dùng mới'}
                </h5>
              </div>
              <div className="modal-body pt-0">
                <div className="mb-3">
                  <label htmlFor="username" className="form-label">Username (Email)</label>
                  <input
                    id="username"
                    name="username"
                    className="form-control"
                    placeholder="Nhập email"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    autoComplete="username"
                  />
                </div>
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-control"
                    placeholder={editId ? "Mật khẩu hiện tại" : "Nhập mật khẩu"}
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="new-password"
                  />
                  {editId && (
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Có thể thay đổi mật khẩu nếu cần
                    </small>
                  )}
                </div>
                {!editId && (
                  <div className="mb-3">
                    <label htmlFor="role" className="form-label">Vai trò</label>
                    <select
                      id="role"
                      name="role"
                      className="form-select"
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                    >
                      <option value="User">User</option>
                      <option 
                        value="Admin" 
                        disabled={users.find(u => u.Role === 'Admin')}
                      >
                        Admin
                      </option>
                    </select>
                    {users.find(u => u.Role === 'Admin') && (
                      <small className="text-warning">
                        <i className="bi bi-exclamation-triangle me-1"></i>
                        Đã có tài khoản Admin, không thể thêm Admin mới
                      </small>
                    )}
                  </div>
                )}

              </div>
              <div className="modal-footer border-0 pt-2 justify-content-end">
                <button className="btn btn-secondary rounded-pill px-4 me-2" onClick={closeModal}>Hủy</button>
                <button className="btn btn-primary rounded-pill px-4" onClick={() => editId ? handleEdit(editId) : handleAdd()}>
                  {editId ? 'Cập nhật' : 'Thêm'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

export default UserManagement;
