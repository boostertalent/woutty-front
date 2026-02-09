import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CreateCampaign from './page';

// Mock du router Next.js
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
  }),
}));

beforeEach(() => {
  localStorage.clear();
});

describe('CreateCampaign page', () => {
  it('renders without crashing', async () => {
    render(<CreateCampaign />);

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: /créer une campagne/i })
      ).toBeInTheDocument();
    });
  });

  it('disables continue when form is invalid', async () => {
    render(<CreateCampaign />);

    const button = await screen.findByRole('button', {
      name: /continuer/i,
    });

    expect(button).toBeDisabled();
  });

  it('keeps continue disabled if required fields are missing', async () => {
    render(<CreateCampaign />);

    const titleInput = await screen.findByPlaceholderText(
      /lancement collection été/i
    );
    const objectif = screen.getByRole('button', { name: 'Notoriété' });
    const button = screen.getByRole('button', { name: /continuer/i });

    fireEvent.change(titleInput, {
      target: { value: 'Campagne été' },
    });
    fireEvent.click(objectif);

    expect(button).toBeDisabled();
  });

  it('saves title to localStorage on input', async () => {
    render(<CreateCampaign />);

    const titleInput = await screen.findByPlaceholderText(
      /lancement collection été/i
    );

    fireEvent.change(titleInput, {
      target: { value: 'Test Campagne' },
    });

    await waitFor(() => {
      const saved = JSON.parse(
        localStorage.getItem('campaign_step_1') || '{}'
      );
      expect(saved.title).toBe('Test Campagne');
    });
  });
});
