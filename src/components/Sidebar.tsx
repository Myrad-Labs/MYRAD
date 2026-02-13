import { useState } from 'react';
import { Home, Trophy, HelpCircle, Users } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();
  const [isHovered, setIsHovered] = useState(false);

  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: Home },
    { label: 'Leaderboard', path: '/leaderboard', icon: Trophy },
    { label: 'Referral', path: '/referral', icon: Users },
    { label: 'How to use', path: '/how-to-use', icon: HelpCircle },
  ];

  const shouldShowLabels = isHovered;

  return (
    <>
      <style>{`
        @import url('https://api.fontshare.com/v2/css?f[]=satoshi@900,700,500,400&display=swap');

        .sidebar {
          position: fixed;
          left: 0;
          top: 0;
          bottom: 0;
          width: 70px;
          background: #ffffff;
          border-right: 1px solid #f3f4f6;
          padding: 24px 12px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          font-family: 'Satoshi', sans-serif;
          z-index: 200;
          transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          box-shadow: 2px 0 8px rgba(0, 0, 0, 0.05);
        }

        .sidebar.expanded {
          width: 240px;
          padding: 24px 16px;
        }

        .sidebar-header {
          margin-bottom: 32px;
        }

        .sidebar-logo {
          height: 36px;
          width: 36px;
          object-fit: cover;
          object-position: left center;
          flex-shrink: 0;
          transition: all 0.3s ease;
          border-radius: 8px;
        }

        .sidebar.expanded .sidebar-logo {
          width: 140px;
          height: 36px;
          object-fit: contain;
          object-position: left center;
        }

        .nav-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px;
          border-radius: 12px;
          color: #6b7280;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s ease;
          cursor: pointer;
          white-space: nowrap;
          position: relative;
        }

        .sidebar.expanded .nav-item {
          padding: 12px 16px;
        }

        .nav-item:hover {
          background: #f9fafb;
          color: #111827;
        }

        .nav-item.active {
          background: #111827;
          color: #ffffff;
        }

        .nav-item.active:hover {
          background: #000000;
        }

        .nav-icon {
          flex-shrink: 0;
          width: 20px;
          height: 20px;
        }

        .nav-label {
          opacity: 0;
          visibility: hidden;
          transition: opacity 0.2s ease, visibility 0.2s ease;
          transition-delay: 0s;
        }

        .sidebar.expanded .nav-label {
          opacity: 1;
          visibility: visible;
          transition-delay: 0.1s;
        }

        @media (max-width: 768px) {
          .sidebar, .sidebar.expanded {
            width: 100%;
            height: 64px;
            bottom: 0;
            top: auto;
            left: 0;
            right: 0;
            flex-direction: row;
            justify-content: space-around;
            padding: 0;
            border-right: none;
            border-top: 1px solid #f3f4f6;
            transition: none;
            box-shadow: 0 -2px 10px rgba(0,0,0,0.03);
          }

          .sidebar-header {
            display: none;
          }

          .sidebar-logo {
            display: none;
          }

          .nav-container {
             flex-direction: row;
             width: 100%;
             justify-content: space-around;
             align-items: center;
             height: 100%;
             padding: 0;
             gap: 0;
          }

          .nav-item {
             flex-direction: column;
             gap: 4px;
             padding: 8px;
             border-radius: 8px;
             justify-content: center;
             width: 100%;
             height: 100%;
          }

          .nav-icon {
             width: 22px;
             height: 22px;
          }

          .nav-label {
             display: flex;
             opacity: 1;
             visibility: visible;
             font-size: 10px;
             font-weight: 500;
          }
        }
      `}</style>

      <aside
        className={`sidebar ${shouldShowLabels ? 'expanded' : ''}`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="sidebar-header">
          <img src="/myrad.webp" alt="MYRAD" className="sidebar-logo" />
        </div>

        <nav className="nav-container">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon className="nav-icon" size={20} />
                <span className="nav-label">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;