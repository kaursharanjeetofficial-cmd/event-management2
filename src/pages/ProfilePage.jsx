import { useId } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { useMutation } from '@tanstack/react-query';
import { api } from '../api/client';

export default function ProfilePage() {
  const { user, updatePreferences } = useAuth();
  const { theme, setTheme } = useTheme();
  const nameId = useId();
  const emailId = useId();
  const themeId = useId();
  const notifId = useId();

  const updateMutation = useMutation({
    mutationFn: (data) => api.updateUser(user.id, data),
    onSuccess: (_data, variables) => {
      if (variables.preferences) {
        updatePreferences(variables.preferences);
        if (variables.preferences.theme) {
          setTheme(variables.preferences.theme);
        }
      }
    },
  });

  const handleThemeChange = (e) => {
    const newTheme = e.target.value;
    setTheme(newTheme);
    updateMutation.mutate({ preferences: { ...user.preferences, theme: newTheme } });
  };

  const handleNotificationsChange = (e) => {
    updateMutation.mutate({
      preferences: { ...user.preferences, notifications: e.target.checked },
    });
  };

  return (
    <div className="profile-page">
      <div className="page-header">
        <h1>Profile</h1>
        <p>Manage your account preferences</p>
      </div>

      <div className="profile-card">
        <div className="profile-avatar">{user.name.charAt(0)}</div>
        <div className="profile-info">
          <div className="form-group">
            <label htmlFor={nameId}>Name</label>
            <input id={nameId} type="text" value={user.name} readOnly />
          </div>
          <div className="form-group">
            <label htmlFor={emailId}>Email</label>
            <input id={emailId} type="email" value={user.email} readOnly />
          </div>
        </div>
      </div>

      <section className="preferences-section">
        <h2>Preferences</h2>
        <div className="form-group">
          <label htmlFor={themeId}>Theme</label>
          <select id={themeId} value={theme} onChange={handleThemeChange}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
          </select>
        </div>
        <div className="form-group checkbox-group">
          <label htmlFor={notifId}>
            <input
              id={notifId}
              type="checkbox"
              checked={user.preferences.notifications ?? true}
              onChange={handleNotificationsChange}
            />
            Email notifications
          </label>
        </div>
      </section>

      <section className="favorites-section">
        <h2>Favorite Events</h2>
        {user.favoriteEvents.length === 0 ? (
          <p>No favorite events yet.</p>
        ) : (
          <ul className="favorites-list">
            {user.favoriteEvents.map((id) => (
              <li key={id}>Event #{id}</li>
            ))}
          </ul>
        )}
      </section>

      {updateMutation.isSuccess && <p className="success-message">Preferences saved!</p>}
    </div>
  );
}
