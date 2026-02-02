import '@testing-library/jest-dom';

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => '/',
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children }) => children,
}));

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => <img {...props} />,
}));

beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {});
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});
