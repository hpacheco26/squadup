import React from 'react';

const spin = `
@keyframes geo-spin-cw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(360deg); }
}
@keyframes geo-spin-ccw {
  from { transform: rotate(0deg); }
  to   { transform: rotate(-360deg); }
}
@keyframes geo-pulse {
  0%, 100% { opacity: 1; }
  50%       { opacity: 0.4; }
}
`;

const styleTag =
  typeof document !== 'undefined' && !document.getElementById('geo-spinner-styles')
    ? (() => {
        const el = document.createElement('style');
        el.id = 'geo-spinner-styles';
        el.textContent = spin;
        document.head.appendChild(el);
        return el;
      })()
    : null;

/**
 * GeometricSpinner
 * Props:
 *   size   – base size in px (default 40)
 *   color  – primary color (default '#5b7bb3')
 */
const GeometricSpinner = ({ size = 40, color = 'var(--c-primary)' }) => {
  const s = size;

  // Pentagon via clip-path
  const pentagonStyle = {
    width: s,
    height: s,
    clipPath: 'polygon(50% 0%, 100% 38%, 82% 100%, 18% 100%, 0% 38%)',
    background: color,
    opacity: 0.9,
    flexShrink: 0,
    animation: 'geo-spin-cw 1s linear infinite',
  };

  // Triangle via clip-path on a div
  const triangleStyle = {
    width: s,
    height: s,
    clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
    background: color,
    opacity: 0.75,
    flexShrink: 0,
    animation: 'geo-spin-ccw 1.4s linear infinite',
  };

  const squareStyle = {
    width: s,
    height: s,
    borderRadius: `${s * 0.1}px`,
    background: color,
    opacity: 0.55,
    flexShrink: 0,
    animation: 'geo-spin-cw 1.8s linear infinite',
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: `${s * 0.35}px`,
      }}
      aria-label="Loading"
      role="status"
    >
      <div style={pentagonStyle} />
      <div style={triangleStyle} />
      <div style={squareStyle} />
    </div>
  );
};

export default GeometricSpinner;
