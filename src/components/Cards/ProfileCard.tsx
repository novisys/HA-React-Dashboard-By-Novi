import BaseCard from './BaseCard';

function ProfileCard() {
  return (
    <BaseCard className='profile-card'>
      <div className='card-header'>
        <h2 className='card-title'>New Forecast</h2>
      </div>

      <div className='profile-content'>
        <div className='profile-image-container'>
          <img src='/images/profile-avatar.jpg' alt='User Profile' className='profile-image' />
          <div className='online-status'>
            <span className='status-indicator'></span>
          </div>
        </div>
      </div>
    </BaseCard>
  );
}

export default ProfileCard;
