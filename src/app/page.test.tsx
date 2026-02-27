import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Page from './page';

// --- MOCK next/link ---
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href?: string }) => <a href={href}>{children}</a>;
});

// --- MOCK DES COMPOSANTS ENFANTS ---
jest.mock('@/components/Navbar', () => () => <div data-testid="navbar">Navbar</div>);
jest.mock('@/components/Hero', () => () => <div data-testid="hero">Hero</div>);
jest.mock('@/components/BrandVisual', () => () => <div data-testid="brand-visual">BrandVisual</div>);
jest.mock('@/components/About', () => () => <div data-testid="about">About</div>);
jest.mock('@/components/Process', () => () => <div data-testid="process">Process</div>);
jest.mock('@/components/CreatorBenefits', () => () => <div data-testid="creator-benefits">CreatorBenefits</div>);
jest.mock('@/components/BrandBenefits', () => () => <div data-testid="brand-benefits">BrandBenefits</div>);
jest.mock('@/components/PartnershipBenefits', () => () => <div data-testid="partnership-benefits">PartnershipBenefits</div>);
jest.mock('@/components/FAQ', () => () => <div data-testid="faq">FAQ</div>);
jest.mock('@/components/Footer', () => () => <div data-testid="footer">Footer</div>);

describe('Home page', () => {
  it('renders without crashing and shows all essential sections', () => {
    render(<Page />);

    // Vérifie que tous les composants principaux sont présents
    expect(screen.getByTestId('navbar')).toBeInTheDocument();
    expect(screen.getByTestId('hero')).toBeInTheDocument();
    expect(screen.getByTestId('brand-visual')).toBeInTheDocument();
    expect(screen.getByTestId('about')).toBeInTheDocument();
    expect(screen.getByTestId('process')).toBeInTheDocument();
    expect(screen.getByTestId('creator-benefits')).toBeInTheDocument();
    expect(screen.getByTestId('brand-benefits')).toBeInTheDocument();
    expect(screen.getByTestId('partnership-benefits')).toBeInTheDocument();
    expect(screen.getByTestId('faq')).toBeInTheDocument();
    expect(screen.getByTestId('footer')).toBeInTheDocument();

    // Vérifie la structure des sections avec les bons IDs
    const processSection = screen.getByTestId('process').parentElement;
    expect(processSection).toHaveAttribute('id', 'process');
    expect(processSection).toHaveClass('scroll-mt-24');

    const creatorsSection = screen.getByTestId('creator-benefits').parentElement;
    expect(creatorsSection).toHaveAttribute('id', 'creators');
    expect(creatorsSection).toHaveClass('scroll-mt-24');

    const brandsSection = screen.getByTestId('brand-benefits').parentElement;
    expect(brandsSection).toHaveAttribute('id', 'brands');
    expect(brandsSection).toHaveClass('scroll-mt-24');

    const partnershipSection = screen.getByTestId('partnership-benefits').parentElement;
    expect(partnershipSection).toHaveAttribute('id', 'partenariat');
    expect(partnershipSection).toHaveClass('scroll-mt-24');

    // Vérifie le conteneur principal
    const main = screen.getByRole('main');
    expect(main).toHaveClass('relative', 'bg-background', 'text-foreground');
  });
});
