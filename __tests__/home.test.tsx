import { render, screen } from '@testing-library/react';
import HomePage from '@/app/page';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>
}));

jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useSearchParams: () => ({ get: () => null }),
  useRouter: () => ({ push: jest.fn() })
}));

describe('HomePage', () => {
  it('renders featured articles', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { name: /des outils/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /explorer les rubriques/i })).toBeInTheDocument();
  });
});
