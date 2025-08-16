// NavItem.tsx corrigé avec types TypeScript

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
  onClick?: (route: string) => void;
  route: string;
}

function NavItem({ icon, label, active = false, onClick, route }: NavItemProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (onClick) {
      onClick(route);
    }
  };

  return (
    <a href={route} className={`nav-link ${active ? 'active' : ''}`} onClick={handleClick}>
      <span className='nav-icon'>{icon}</span>
      <span className='nav-label'>{label}</span>
    </a>
  );
}

export default NavItem;
