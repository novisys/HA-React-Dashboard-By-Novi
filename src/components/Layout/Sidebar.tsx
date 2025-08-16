// Sidebar.tsx corrigé avec types TypeScript

import React from 'react';
import NavItem from '../Navigation/NavItem';

function Sidebar() {
  const [activeRoute, setActiveRoute] = React.useState('/dashboard');
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  const handleNavClick = (route: string) => {
    setActiveRoute(route);
    console.log('Navigation vers:', route);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <aside className='dashboard-sidebar'>
      {/* Profil utilisateur */}
      <div className='sidebar-profile'>
        <div className='profile-avatar'></div>
        <h3 className='profile-name'>Dourtwo</h3>
      </div>

      {/* Navigation principale */}
      <nav className='sidebar-navigation'>
        <NavItem icon='📊' label='Dashboard' active={activeRoute === '/dashboard'} route='/dashboard' onClick={handleNavClick} />
        <NavItem icon='📈' label='Historique' active={activeRoute === '/history'} route='/history' onClick={handleNavClick} />
        <NavItem icon='🔍' label='Analyse' active={activeRoute === '/analytics'} route='/analytics' onClick={handleNavClick} />
        <NavItem icon='🏠' label='Maison' active={activeRoute === '/home'} route='/home' onClick={handleNavClick} />
        <NavItem icon='⚙️' label='Paramètres' active={activeRoute === '/settings'} route='/settings' onClick={handleNavClick} />
      </nav>

      {/* Contrôles de thème */}
      <div className='sidebar-controls'>
        <button className='theme-toggle-btn' onClick={toggleDarkMode} title={isDarkMode ? 'Mode clair' : 'Mode sombre'}>
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </div>

      {/* Status en bas */}
      <div className='sidebar-status'>
        <div className='status-item' title='Sécurité'>
          🔒
        </div>
        <div className='status-item' title='Réseau'>
          📶
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
