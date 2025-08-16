// BaseCard.tsx corrigé avec types TypeScript

import React from 'react';

interface BaseCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

function BaseCard({ children, className = '', ...props }: BaseCardProps) {
  return (
    <div className={`base-card ${className}`} {...props}>
      {children}
    </div>
  );
}

export default BaseCard;
