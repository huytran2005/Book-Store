import React from 'react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, act, cleanup } from '@testing-library/react';
import OnboardingPage from '../app/(client)/onboarding/page';

// Mock browser globals
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

if (typeof window === 'undefined') {
  global.window = {
    dispatchEvent: () => {},
  } as any;
}

Object.defineProperty(global, 'localStorage', {
  value: localStorageMock,
});

// Mock firebase configuration to avoid network calls
vi.mock('../lib/firebase', () => ({
  auth: null,
  db: null,
  isFirebaseConfigured: false,
}));

// Mock BubbleGenreSelector to avoid canvas layout and MatterJS initialization crash
vi.mock('../components/BubbleGenreSelector', () => ({
  default: ({ onSelectionChange }: { onSelectionChange: (slugs: string[]) => void }) => (
    <div data-testid="mock-bubble-selector">
      <button 
        data-testid="select-genre-btn"
        onClick={() => onSelectionChange(['cng-ngh-lp-trnh'])}
      >
        Select Programming Genre
      </button>
    </div>
  ),
}));

// Mock Book3DCard to simplify visual testing
vi.mock('../components/Book3DCard', () => ({
  default: ({ book }: { book: any }) => (
    <div data-testid={`book-3d-${book.id}`}>
      <h3>{book.title}</h3>
    </div>
  ),
}));

// Mock Toast service
vi.mock('../components/Toast', () => ({
  useToast: () => ({
    showToast: vi.fn(),
  }),
}));

describe('OnboardingPage Integration Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it('should render the onboarding page welcome headers and trigger genre selection', async () => {
    render(<OnboardingPage />);
    
    // Wait for loading to finish and check main onboarding header
    expect(await screen.findByText('Chọn Gu Đọc Sách')).toBeDefined();
    
    // Initially, the "Nhận Đề Xuất Sách" button should be disabled
    const recommendBtn = screen.getByRole('button', { name: /Nhận Đề Xuất Sách/i });
    expect(recommendBtn.hasAttribute('disabled')).toBe(true);

    // Simulate clicking our mocked genre selection bubble selector
    const genreSelectBtn = screen.getByTestId('select-genre-btn');
    fireEvent.click(genreSelectBtn);

    // The recommendation button should now be enabled
    expect(recommendBtn.hasAttribute('disabled')).toBe(false);
  });

  it('should transition into analysis states and display results after selection', async () => {
    render(<OnboardingPage />);

    // Wait for loading to finish (uses real timers)
    expect(await screen.findByText('Chọn Gu Đọc Sách')).toBeDefined();

    // Select genre
    fireEvent.click(screen.getByTestId('select-genre-btn'));
    
    // NOW switch to fake timers before triggering timeout-based analysis flow
    vi.useFakeTimers();

    // Submit recommendation flow
    const recommendBtn = screen.getByRole('button', { name: /Nhận Đề Xuất Sách/i });
    fireEvent.click(recommendBtn);

    // Should display loading phase text
    expect(screen.getByText('Đang phân tích thị hiếu của bạn...')).toBeDefined();

    // Advance mock timers to skip analysis stages
    act(() => {
      vi.advanceTimersByTime(1100);
    });
    expect(screen.getByText('Đang tìm kiếm sách tương ứng trong kho dữ liệu...')).toBeDefined();

    act(() => {
      vi.advanceTimersByTime(1200);
    });
    expect(screen.getByText('Đang sắp xếp danh sách may đo riêng...')).toBeDefined();

    // Advance to final results rendering
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Check final header rendering
    expect(screen.getByText('Tủ Sách "May Đo" Cho Bạn')).toBeDefined();
  });
});
