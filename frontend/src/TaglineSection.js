import React from 'react';
import './TaglineSection.css';

const TaglineSection = () => {
  return (
    <div className="tagline-card">
      <div className="tagline-content">
        <h3>MD Store — Classic. Simple. Professional.</h3>
        <p>Manage your inventory with confidence and clarity.</p>
        <div className="company-badge">
          <span className="powered-by">Powered by</span>
          <span className="company-name">MD Store</span>
        </div>
      </div>
    </div>
  );
};

export default TaglineSection;
