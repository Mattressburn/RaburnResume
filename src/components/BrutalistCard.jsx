import React from 'react';

/**
 * Bordered card with a hard solid-color offset rectangle behind it.
 * The shadow is a real positioned element, not a box-shadow filter — that's
 * the only way to get a true solid color (not rgba) at offset (--shadow-off).
 *
 * Pass `interactive` for a press-scale animation (used for nav/anchor cards).
 */
export default function BrutalistCard({ children, interactive = false, className = '', ...rest }) {
  const wrapClass = `bcard${interactive ? ' bcard-interactive' : ''} ${className}`.trim();
  return (
    <div className={wrapClass} {...rest}>
      <div className="bcard-shadow" aria-hidden="true" />
      <div className="bcard-inner">{children}</div>
    </div>
  );
}
