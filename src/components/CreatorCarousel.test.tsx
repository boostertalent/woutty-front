import { render } from '@testing-library/react';
import CreatorCarousel from './CreatorCarousel';

describe('CreatorCarousel', () => {
  it('renders without crashing', () => {
    render(<CreatorCarousel />);
  });
});