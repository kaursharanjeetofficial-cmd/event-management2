import { NavLink, Outlet, useNavigation } from 'react-router-dom';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import LoadingSpinner from './LoadingSpinner';

export default function Layout() {
  const { theme, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  return (
    <div className="app">
      <header className="header">
        <div className="header-inner">
          <NavLink to="/" className="logo">EventHub</NavLink>
          <nav className="nav">
            <NavLink to="/" end>Events</NavLink>
            <NavLink to="/my-bookings">My Bookings</NavLink>
            <NavLink to="/create-event">Create Event</NavLink>
            <NavLink to="/profile">Profile</NavLink>
          </nav>
          <div className="header-actions">
            <button
              type="button"
              className="theme-toggle"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? '🌙' : '☀️'}
            </button>
            <span className="user-badge">{user.name}</span>
          </div>
        </div>
      </header>

      {isNavigating && (
        <div className="nav-loading-bar" aria-hidden="true" />
      )}

      <main className="main">
        {isNavigating ? <LoadingSpinner label="Loading page..." /> : <Outlet />}
      </main>

      <footer className="footer">
        <p>Event Management Platform &copy; 2026</p>
      </footer>
    </div>
  );
}
