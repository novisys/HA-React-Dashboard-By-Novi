function SidebarNav() {
  const navItems = [
    { icon: '📊', label: 'Dashboard', active: true },
    { icon: '📈', label: 'Historique', active: false },
    { icon: '🔍', label: 'Analyse', active: false },
    { icon: '🏠', label: 'Maison', active: false },
    { icon: '⚙️', label: 'Paramètres', active: false },
  ];

  return (
    <nav className='sidebar-navigation'>
      {navItems.map((item, index) => (
        <a key={index} href={`#${item.label.toLowerCase()}`} className={`nav-link ${item.active ? 'active' : ''}`}>
          <span className='nav-icon'>{item.icon}</span>
          <span className='nav-label'>{item.label}</span>
        </a>
      ))}
    </nav>
  );
}

export default SidebarNav;
