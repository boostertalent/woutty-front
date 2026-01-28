import React from 'react';
import { render } from '@testing-library/react';
import RootLayout from './layout';

// Mock du ThemeProvider pour isoler le test du layout
jest.mock('@/components/theme-provider', () => ({
  ThemeProvider: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="theme-provider">{children}</div>
  ),
}));

// Mock des polices Google pour éviter les erreurs de chargement en environnement de test
jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: 'geist-sans' }),
  Geist_Mono: () => ({ variable: 'geist-mono' }),
  Instrument_Serif: () => ({ variable: 'instrument-serif' }),
}));

describe('RootLayout - Configuration Racine', () => {
  
  it('doit rendre les enfants (children) à travers le ThemeProvider', () => {
    const { getByTestId, getByText } = render(
      <RootLayout>
        <div data-testid="child-content">Contenu de l'application</div>
      </RootLayout>
    );

    expect(getByTestId('theme-provider')).toBeInTheDocument();
    expect(getByTestId('child-content')).toBeInTheDocument();
    expect(getByText("Contenu de l'application")).toBeInTheDocument();
  });

  it('doit configurer la langue en Français', () => {
    const { container } = render(<RootLayout><div></div></RootLayout>);
    const htmlElement = container.parentElement?.querySelector('html');
    expect(htmlElement).toHaveAttribute('lang', 'fr');
  });

  it('doit appliquer les variables de polices CSS sur le body', () => {
    const { container } = render(<RootLayout><div></div></RootLayout>);
    const bodyElement = container.parentElement?.querySelector('body');
    
    // Vérifie que les classes de polices injectées par le mock sont présentes
    expect(bodyElement).toHaveClass('geist-sans');
    expect(bodyElement).toHaveClass('geist-mono');
    expect(bodyElement).toHaveClass('instrument-serif');
  });

  it('doit inclure la classe antialiased et le fond par défaut', () => {
    const { container } = render(<RootLayout><div></div></RootLayout>);
    const bodyElement = container.parentElement?.querySelector('body');
    
    expect(bodyElement).toHaveClass('antialiased');
    expect(bodyElement).toHaveClass('bg-booster-bg');
  });

  it('doit désactiver la traduction automatique avec translate="no"', () => {
    const { container } = render(<RootLayout><div></div></RootLayout>);
    const bodyElement = container.parentElement?.querySelector('body');
    expect(bodyElement).toHaveAttribute('translate', 'no');
  });
});