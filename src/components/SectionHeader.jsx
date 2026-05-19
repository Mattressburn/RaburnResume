import React from 'react';

export default function SectionHeader({ number, label, id }) {
  return (
    <header className="section-header" id={id}>
      <span className="section-number">{number}</span>
      <h2 className="section-label">{label}</h2>
    </header>
  );
}
