import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import PartnershipBenefits from './PartnershipBenefits';

describe('PartnershipBenefits', () => {
  it('renders without crashing', () => {
    render(<PartnershipBenefits />);
    expect(true).toBe(true);
  });
});
