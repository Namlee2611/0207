import Dropdown from 'react-bootstrap/Dropdown';
import { logout } from '../utils/auth';

const UserDropdown = ({ username = 'Tên Người Dùng', role = 'User' }) => {
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <Dropdown align="end">
      <Dropdown.Toggle variant="secondary" id="dropdown-user">
        <i className="bi bi-person-circle me-2"></i>
        {username}
      </Dropdown.Toggle>
      <Dropdown.Menu>
        <Dropdown.ItemText>
          <span className="fw-bold">{username}</span>
        </Dropdown.ItemText>
        <Dropdown.ItemText>
          <span className="text-muted">{role}</span>
        </Dropdown.ItemText>
        <Dropdown.Divider />
        <Dropdown.Item onClick={handleLogout}>Đăng xuất</Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default UserDropdown;
