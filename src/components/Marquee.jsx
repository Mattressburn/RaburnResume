import React from 'react';

/**
 * Full-bleed accent strip with infinitely scrolling text.
 * CSS-only animation (see .marquee in src/index.css).
 * The text is duplicated so the loop is seamless;
 * the @keyframes translates -50%.
 */
export default function Marquee({ text, separator = '·', chevron = '▶▶' }) {
  const segment = `${text} ${separator} ${chevron} `;
  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee-track">
        <span>{segment.repeat(6)}</span>
        <span>{segment.repeat(6)}</span>
      </div>
    </div>
  );
}
