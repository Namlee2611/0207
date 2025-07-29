function Sidebar({ setView }) {
  return (
    <div className="sidebar bg-primary text-white p-3" style={{ width: '300px', minHeight: '100vh' }}>
      <ul className="list-unstyled">
        <li className="mb-2">
          <button className="btn btn-light w-100 text-nowrap" onClick={() => setView('schedule')}>
            Lịch cơ quan
          </button>
        </li>
        <li className="mb-2">
          <button className="btn btn-light w-100 text-nowrap" onClick={() => setView('book')}>
            Đặt lịch
          </button>
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
