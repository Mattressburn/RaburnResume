import React from 'react';
import Marquee from '../components/Marquee';
import BrutalistCard from '../components/BrutalistCard';
import PillBadge from '../components/PillBadge';
import RedactedBlock from '../components/RedactedBlock';
import MicrocopyLabel from '../components/MicrocopyLabel';
import SectionHeader from '../components/SectionHeader';
import BrutalistChip from '../components/BrutalistChip';

export default function Preview() {
  return (
    <div style={{ minHeight: '100vh' }}>
      <Marquee text="AVAILABLE · RABURN · AVAILABLE · RABURN" />
      <div style={{ padding: '32px' }}>
        <MicrocopyLabel as="div">LAST UPDATED: 2026-05-18</MicrocopyLabel>
        <h1 className="display display-name">MATTHEW{' '}RABURN</h1>
        <p className="display display-tagline">I FIX HIGH-MAINTENANCE SYSTEMS. ALL OF THEM.</p>

        <SectionHeader number="01" label="EXPERIENCE" id="experience" />
        <BrutalistCard><span>Job card preview</span></BrutalistCard>

        <SectionHeader number="02" label="SKILLS" id="skills" />
        <div>
          <BrutalistChip>PowerShell</BrutalistChip>
          <BrutalistChip>Python</BrutalistChip>
          <BrutalistChip>C·CURE</BrutalistChip>
        </div>

        <SectionHeader number="04" label="TRIVIA" id="trivia" />
        <BrutalistCard interactive>
          <PillBadge>UNPREDICTABLE</PillBadge>
          <p style={{ marginTop: '12px' }}>Sample trivia text with a <RedactedBlock width="4em" /> in it.</p>
        </BrutalistCard>
      </div>
    </div>
  );
}
