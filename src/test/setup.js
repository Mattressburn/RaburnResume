import '@testing-library/jest-dom/vitest';

// jsdom lacks IntersectionObserver; TopBar uses it.
globalThis.IntersectionObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
}
