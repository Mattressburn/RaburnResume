import React from 'react';

export default function MicrocopyLabel({ children, className = '', as: Tag = 'span', ...rest }) {
  return <Tag className={`micro ${className}`} {...rest}>{children}</Tag>;
}
