import BaseCard from './BaseCard';

function ControlCard() {
  return (
    <BaseCard className='control-card'>
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
            <span className='metric-label'>Inarget</span>
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
          <button className='control-btn share'>📤</button>
          <button className='control-btn prev'>⏪</button>
          <button className='control-btn call'>📞</button>
          <button className='control-btn play'>🎵</button>
          <button className='control-btn more'>+</button>
          <button className='control-btn copy'>📋</button>
        </div>
      </div>
    </BaseCard>
  );
}

export default ControlCard;
