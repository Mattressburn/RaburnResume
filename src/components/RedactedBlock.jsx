import React from 'react';

/**
 * Inline graphite block for redacted text — preserves the dossier wink
 * without committing to the full fiction.
 */
export default function RedactedBlock({ width = '3em' }) {
  return <span className="redacted" style={{ width }} aria-label="redacted" />;
}
