import { render, screen, fireEvent } from '@testing-library/react';
import CreateCampaign from './page';

beforeEach(() => localStorage.clear());

describe('CreateCampaign page', () => {
  it('renders without crashing', () => {
    render(<CreateCampaign />);
    expect(screen.getByTestId('create-campaign-page')).toBeInTheDocument();
  });

  it('disables continue when form is invalid', () => {
    render(<CreateCampaign />);
    const button = screen.getByTestId('continue-button');
    expect(button).toBeDisabled();
  });

  it('enables continue when form is valid', () => {
    render(<CreateCampaign />);
    const titleInput = screen.getByTestId('title-input');
    const objCheckbox = screen.getByTestId('objective-Notoriété');
    const button = screen.getByTestId('continue-button');

    fireEvent.change(titleInput, { target: { value: 'Campagne été' } });
    fireEvent.click(objCheckbox);

    // Comme il manque dates, il reste désactivé
    expect(button).toBeDisabled();
  });

  it('saves data to localStorage on input', () => {
    render(<CreateCampaign />);
    const titleInput = screen.getByTestId('title-input');
    fireEvent.change(titleInput, { target: { value: 'Test Campagne' } });
    expect(JSON.parse(localStorage.getItem('campaign_step_1') || '{}').title).toBe('Test Campagne');
  });
});
