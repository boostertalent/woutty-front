import '@testing-library/jest-dom';
import dotenv from 'dotenv';

// Charger les variables d'environnement depuis .env.local
dotenv.config({ path: '.env.local' });

// Mock de l'IntersectionObserver (souvent nécessaire pour Framer Motion et Recharts)
global.IntersectionObserver = class IntersectionObserver {
  constructor() {}
  disconnect() {}
  observe() {}
  unobserve() {}
  takeRecords() { return []; }
};

// Mock de ResizeObserver (nécessaire pour les graphiques Recharts)
global.ResizeObserver = class ResizeObserver {
  constructor(cb) { this.cb = cb; }
  observe() { this.cb([{ borderBoxSize: { inlineSize: 800, blockSize: 600 } }]); }
  unobserve() {}
  disconnect() {}
};

// Mock simple pour matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});