import { render } from '@testing-library/react';
import Page from './page';

// --- MOCK next/link ---
jest.mock('next/link', () => {
  return ({ children }: { children: React.ReactNode }) => children;
});

// --- MOCK DES COMPOSANTS ENFANTS ---
jest.mock('@/components/Navbar', () => () => <div>Navbar</div>);
jest.mock('@/components/Hero', () => () => <div>Hero</div>);
jest.mock('@/components/BrandVisual', () => () => <div>BrandVisual</div>);
jest.mock('@/components/About', () => () => <div>About</div>);
jest.mock('@/components/Process', () => () => <div>Process</div>);
jest.mock('@/components/CreatorBenefits', () => () => <div>CreatorBenefits</div>);
jest.mock('@/components/BrandBenefits', () => () => <div>BrandBenefits</div>);
jest.mock('@/components/PartnershipBenefits', () => () => <div>PartnershipBenefits</div>);
jest.mock('@/components/FAQ', () => () => <div>FAQ</div>);
jest.mock('@/components/Footer', () => () => <div>Footer</div>);

describe('Home page', () => {
  it('renders without crashing', () => {
    render(<Page />);
  });
});
