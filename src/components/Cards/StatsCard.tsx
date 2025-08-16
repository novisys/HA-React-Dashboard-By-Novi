import BaseCard from './BaseCard';

function StatsCard() {
  const statsData = [
    { label: 'Friday', value: '24°' },
    { label: 'Family', value: '11.23°' },
    { label: 'Daily', value: '26.3°' },
    { label: 'Rain', value: '14°' },
    { label: 'Dayrill', value: '23°' },
    { label: 'Downs', value: '23°' },
    { label: 'Eurdy', value: '25%' },
    { label: 'Diveck', value: '47°' },
  ];

  return (
    <BaseCard className='stats-card'>
      <div className='card-header'>
        <h2 className='card-title'>Denther Forecast</h2>
      </div>

      <div className='stats-grid'>
        {statsData.map((stat, index) => (
          <div key={index} className='stat-item'>
            <h4 className='stat-label'>{stat.label}</h4>
            <div className='stat-value'>{stat.value}</div>
          </div>
        ))}
      </div>
    </BaseCard>
  );
}

export default StatsCard;
