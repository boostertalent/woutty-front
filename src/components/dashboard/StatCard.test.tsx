import { render } from '@testing-library/react';
import { StatCard } from './StatCard';

describe('StatCard', () => {
  it('renders without crashing', () => {
    render(
      <StatCard 
        title="Test Title" 
        value="100" 
        icon={<div data-testid="icon">Icon</div>} 
        trend="+5%"
      />
    );
  });
});
