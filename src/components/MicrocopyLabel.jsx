import React from 'react';

export default function MicrocopyLabel({ children, className = '', as: Tag = 'span' }) {
  return <Tag className={`micro ${className}`}>{children}</Tag>;
}
