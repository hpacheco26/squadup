import { cleanup, render } from '@testing-library/react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import RankIcon from './RankIcon';
import RankCard from './cards/RankCard';
import RankChangeGate from './modals/RankChangeGate';
import theme from '../theme';

afterEach(cleanup);

const expectNoGlow = (container) => {
  for (const element of container.querySelectorAll('[style]')) {
    expect(element.style.filter).toBe('');
    expect(element.style.boxShadow).toBe('');
    expect(element.style.textShadow).toBe('');
  }
};

const cssColor = (color) => {
  const element = document.createElement('span');
  element.style.color = color;
  return element.style.color;
};

describe('rank artwork and effects', () => {
  it.each([0, 1, 2, 3, 4])('renders rank %i without an image glow', (rank) => {
    const { container } = render(<RankIcon rank={rank} size={40} />);
    const image = container.querySelector('img');
    expect(image.getAttribute('src')).toContain(`rank-${rank}.png`);
    expect(image.style.width).toBe('40px');
    expectNoGlow(container);
  });

  it.each([0, 1, 2, 3, 4])('uses the shared palette and glow-free orbiters for rank %i', (rank) => {
    const { container } = render(<RankCard rank={rank} groupName="Test squad" isAnimated />);
    const orbiters = container.querySelectorAll('span[style*="rank-orbit"]');
    expect(orbiters).toHaveLength(rank + 1);
    for (const orbiter of orbiters) {
      expect(orbiter.firstElementChild.style.background).toBe(cssColor(theme.rank[rank]));
    }
    const label = container.querySelector('span[style*="text-transform"]');
    expect(label.style.color).toBe(cssColor(theme.rank[rank]));
    expectNoGlow(container);
  });

  it.each([
    [0, 1], [1, 2], [2, 3], [3, 4],
    [4, 3], [3, 2], [2, 1], [1, 0],
  ])('matches the new badge color for rank %i → %i without glow', (previousRank, newRank) => {
    const { container, getByRole } = render(
      <RankChangeGate
        change={{ groupName: 'Test squad', previousRank, newRank }}
        onAcknowledge={() => {}}
      />,
    );
    const isUp = newRank > previousRank;
    const banner = container.querySelector('div[style*="rank-banner-in"]');
    expect(banner.style.color).toBe(cssColor(theme.rank[newRank]));
    if (isUp) {
      const ring = container.querySelector('span[style*="rank-shockwave"]');
      expect(ring.style.borderColor).toBe(cssColor(theme.rank[newRank]));
    } else {
      const particles = container.querySelectorAll('span[style*="rank-implode"]');
      expect(particles).toHaveLength(22);
      for (const particle of particles) {
        expect(particle.style.background).toBe(cssColor(theme.rank[newRank]));
      }
    }
    expect(getByRole('button')).toBeInTheDocument();
    expectNoGlow(container);
  });

  it('preserves badge colors during rank-up and rank-down movement', () => {
    const css = readFileSync(resolve('src', 'index.css'), 'utf8');
    for (const name of ['rank-up-jolt', 'rank-down-sink']) {
      const keyframes = css.split(`@keyframes ${name} {`)[1].split('\n}')[0];
      expect(keyframes).toContain('transform:');
      expect(keyframes).not.toMatch(/filter:|shadow:/);
    }
  });
});
