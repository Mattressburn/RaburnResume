import '@testing-library/jest-dom/vitest';

// jsdom lacks IntersectionObserver; TopBar uses it.
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}

// jsdom does not implement media loading; the hero loop calls video.load() after window load.
// Node-environment test files have no HTMLMediaElement.
if (typeof HTMLMediaElement !== 'undefined') HTMLMediaElement.prototype.load = () => {}
