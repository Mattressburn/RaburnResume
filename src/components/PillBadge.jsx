import React from 'react';

export default function PillBadge({ children, className = '' }) {
  return <span className={`pill ${className}`}>{children}</span>;
}
