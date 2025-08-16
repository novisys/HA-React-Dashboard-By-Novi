// MainContent.tsx corrigé avec types TypeScript

import React from 'react';

function MainContent() {
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    console.log('Recherche:', query);
  };

  return (
    <main className='dashboard-main'>
      {/* Header avec recherche */}
      <div className='dashboard-header'>
        <div className='search-bar'>
          <input type='text' placeholder='Yoni un liver' value={searchQuery} onChange={e => handleSearch(e.target.value)} />
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

      {/* Grille des cartes */}
      <div className='dashboard-grid'>
        {/* Carte Météo */}
        <div className='base-card weather-card-large'>
          <div className='card-header'>
            <h2 className='card-title'>Weather Daily</h2>
            <div className='weather-time'>15:05°</div>
          </div>
          <div className='weather-main'>
            <span className='weather-icon'>☁️</span>
            <span className='weather-icon'>🌤️</span>
          </div>
          <div className='weather-details'>
            <div>
              <h3>Home Forecast</h3>
              <div className='temperature-large'>42°</div>
            </div>
            <div>
              <h3>Nothon Forecast</h3>
              <div style={{ fontSize: '14px' }}>
                <span>12.3 Waly, ☀️ Rlar</span>
                <div style={{ marginTop: '8px', fontSize: '12px', opacity: '0.8' }}>
                  <span>☀️ 15AM</span> • <span>📅 18 DAYS</span>
                </div>
              </div>
            </div>
            <div style={{ alignSelf: 'end' }}>
              <svg width='120' height='60' viewBox='0 0 120 60' className='trend-svg'>
                <path d='M10,40 Q30,20 50,30 Q70,25 90,35 L110,25' stroke='rgba(255,255,255,0.8)' strokeWidth='2' fill='none' />
              </svg>
            </div>
          </div>
        </div>

        {/* Carte Profil */}
        <div className='base-card profile-card'>
          <div className='card-header'>
            <h2 className='card-title'>New Forecast</h2>
          </div>
          <div className='profile-content'>
            <div className='profile-image-container'>
              <div className='online-status'>
                <span className='status-indicator'></span>
              </div>
            </div>
          </div>
        </div>

        {/* Carte Statistiques */}
        <div className='base-card stats-card'>
          <div className='card-header'>
            <h2 className='card-title'>Denther Forecast</h2>
          </div>
          <div className='stats-grid'>
            <div className='stat-item'>
              <h4 className='stat-label'>Friday</h4>
              <div className='stat-value'>24°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Family</h4>
              <div className='stat-value'>11.23°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Daily</h4>
              <div className='stat-value'>26.3°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Rain</h4>
              <div className='stat-value'>14°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Dayrill</h4>
              <div className='stat-value'>23°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Downs</h4>
              <div className='stat-value'>23°</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Eurdy</h4>
              <div className='stat-value'>25%</div>
            </div>
            <div className='stat-item'>
              <h4 className='stat-label'>Diveck</h4>
              <div className='stat-value'>47°</div>
            </div>
          </div>
        </div>

        {/* Carte Contrôles */}
        <div className='base-card control-card'>
          <div className='card-header'>
            <h2 className='card-title'>Fuen Day</h2>
            <div className='card-meta'>
              <span>Look by Dants</span>
              <span>● Nun View</span>
              <button className='add-btn'>+</button>
            </div>
          </div>
          <div className='control-content'>
            <div className='control-section'>
              <h3>Thimu</h3>
            </div>
            <div className='metrics-row'>
              <div className='metric'>
                <span style={{ fontSize: '12px', opacity: '0.8' }}>Inarget</span>
                <span className='metric-value'>86%</span>
              </div>
              <div className='metric'>
                <span className='metric-value'>25.5°m</span>
              </div>
              <div className='metric'>
                <span className='metric-value'>7.4°</span>
              </div>
              <div className='metric'>
                <span className='metric-value'>35.6.15</span>
              </div>
            </div>
            <div className='tags-row'>
              <span className='tag'>Yate</span>
              <span className='tag'>Light</span>
              <span className='tag'>Family</span>
              <span className='tag'>Naturany</span>
            </div>
            <div className='control-buttons'>
              <button className='control-btn'>📤</button>
              <button className='control-btn'>⏪</button>
              <button className='control-btn'>📞</button>
              <button className='control-btn play'>🎵</button>
              <button className='control-btn'>+</button>
              <button className='control-btn'>📋</button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default MainContent;
