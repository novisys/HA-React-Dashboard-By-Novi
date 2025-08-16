// TopBar.tsx corrigé avec types TypeScript

interface TopBarProps {
  title?: string;
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;
}

function TopBar({ title = 'Dashboard HAKit', onSearch, searchPlaceholder = 'Yoni un liver' }: TopBarProps) {
  return (
    <div className='dashboard-header'>
      <div className='header-title'>
        <h1>{title}</h1>
      </div>

      <div className='search-bar'>
        <input type='text' placeholder={searchPlaceholder} onChange={e => onSearch && onSearch(e.target.value)} />
      </div>

      <div className='header-actions'>
        <button className='action-btn' title='Notes'>
          <span>📝</span>
        </button>
        <button className='action-btn' title='Aide'>
          <span>❓</span>
        </button>
        <button className='action-btn' title='Profil'>
          <span>👤</span>
        </button>
      </div>
    </div>
  );
}

export default TopBar;
