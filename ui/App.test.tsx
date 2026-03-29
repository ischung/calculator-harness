/**
 * ui/App.test.tsx — 계산기 UI 통합 테스트
 * @jest-environment jsdom
 *
 * EVAL-1 ~ EVAL-5 시나리오를 UI 레벨에서 검증한다.
 *
 * [DESIGN] 에러 표시 구조 변경 반영:
 *   - display-value: 숫자 값 (에러 시에도 유지)
 *   - display-error: 에러 메시지 별도 영역 (#D32F2F + ⚠️)
 */

import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

// ── 헬퍼 ─────────────────────────────────────────────────────
function clickKeys(keys: string[]): void {
  keys.forEach(key => {
    const testId =
      key === '='  ? 'key-equals' :
      key === 'C'  ? 'key-clear'  :
      key === '.'  ? 'key-dot'    :
      ['+','-','*','/'].includes(key) ? `op-${key}` :
      `key-${key}`;
    fireEvent.click(screen.getByTestId(testId));
  });
}

function getDisplayValue(): string {
  return screen.getByTestId('display-value').textContent ?? '';
}

// [DESIGN] 에러 메시지는 display-error 에서 확인
function getErrorMessage(): string {
  const el = screen.queryByTestId('display-error');
  return el?.textContent ?? '';
}

// =============================================================================
// 렌더링
// =============================================================================
describe('App 렌더링', () => {
  it('계산기가 렌더링된다', () => {
    render(<App />);
    expect(screen.getByTestId('calculator')).toBeInTheDocument();
    expect(screen.getByTestId('display')).toBeInTheDocument();
    expect(screen.getByTestId('keypad')).toBeInTheDocument();
  });

  it('초기 디스플레이는 0이다', () => {
    render(<App />);
    expect(getDisplayValue()).toBe('0');
  });

  it('모든 숫자 버튼(0~9)이 존재한다', () => {
    render(<App />);
    '0123456789'.split('').forEach(d => {
      expect(screen.getByTestId(`key-${d}`)).toBeInTheDocument();
    });
  });

  it('모든 연산자 버튼이 존재한다', () => {
    render(<App />);
    ['+', '-', '*', '/'].forEach(op => {
      expect(screen.getByTestId(`op-${op}`)).toBeInTheDocument();
    });
  });
});

// =============================================================================
// EVAL-2: 덧셈
// =============================================================================
describe('[EVAL-2] 덧셈', () => {
  it('1 + 1 = 2', () => {
    render(<App />);
    clickKeys(['1', '+', '1', '=']);
    expect(getDisplayValue()).toBe('2');
  });

  it('10 + 5 = 15', () => {
    render(<App />);
    clickKeys(['1','0', '+', '5', '=']);
    expect(getDisplayValue()).toBe('15');
  });
});

// =============================================================================
// EVAL-3: 뺄셈
// =============================================================================
describe('[EVAL-3] 뺄셈', () => {
  it('10 - 3 = 7', () => {
    render(<App />);
    clickKeys(['1','0', '-', '3', '=']);
    expect(getDisplayValue()).toBe('7');
  });
});

// =============================================================================
// EVAL-4: 곱셈
// =============================================================================
describe('[EVAL-4] 곱셈', () => {
  it('4 × 5 = 20', () => {
    render(<App />);
    clickKeys(['4', '*', '5', '=']);
    expect(getDisplayValue()).toBe('20');
  });

  it('a × 0 = 0', () => {
    render(<App />);
    clickKeys(['9', '*', '0', '=']);
    expect(getDisplayValue()).toBe('0');
  });
});

// =============================================================================
// EVAL-5: 나눗셈
// =============================================================================
describe('[EVAL-5] 나눗셈', () => {
  it('10 ÷ 2 = 5', () => {
    render(<App />);
    clickKeys(['1','0', '/', '2', '=']);
    expect(getDisplayValue()).toBe('5');
  });
});

// =============================================================================
// [INV-1] 0 나누기 → 에러 메시지 표시
// [DESIGN] 에러: display-error 영역에 ⚠️ 와 함께, display-value는 숫자 유지
// =============================================================================
describe('[INV-1] 0 나누기 방어 — UI 레벨', () => {
  it('10 ÷ 0 → display-error에 "0으로 나눌 수 없습니다" 표시', () => {
    render(<App />);
    clickKeys(['1','0', '/', '0', '=']);
    expect(getErrorMessage()).toContain('0으로 나눌 수 없습니다');
  });

  it('에러 시 display-value는 숫자를 유지한다 (값/에러 분리)', () => {
    render(<App />);
    clickKeys(['1','0', '/', '0', '=']);
    // [DESIGN] 에러 메시지가 값을 덮어쓰지 않는다
    expect(getDisplayValue()).not.toBe('0으로 나눌 수 없습니다');
  });

  it('에러 메시지 role="alert" 접근성 속성', () => {
    render(<App />);
    clickKeys(['5', '/', '0', '=']);
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('에러 후 C를 누르면 초기화된다', () => {
    render(<App />);
    clickKeys(['1', '/', '0', '=']);
    expect(getErrorMessage()).toContain('0으로 나눌 수 없습니다');
    clickKeys(['C']);
    expect(getDisplayValue()).toBe('0');
    expect(screen.queryByTestId('display-error')).not.toBeInTheDocument();
  });

  it('에러 후 새 숫자를 누르면 새 계산이 시작된다', () => {
    render(<App />);
    clickKeys(['1', '/', '0', '=']);
    clickKeys(['5', '+', '3', '=']);
    expect(getDisplayValue()).toBe('8');
    expect(screen.queryByTestId('display-error')).not.toBeInTheDocument();
  });
});

// =============================================================================
// UX: 초기화 / 백스페이스
// =============================================================================
describe('UX', () => {
  it('C 버튼이 디스플레이를 0으로 초기화한다', () => {
    render(<App />);
    clickKeys(['9','9', 'C']);
    expect(getDisplayValue()).toBe('0');
  });

  it('⌫ 버튼이 마지막 입력을 삭제한다', () => {
    render(<App />);
    clickKeys(['1','2','3']);
    fireEvent.click(screen.getByTestId('key-backspace'));
    expect(getDisplayValue()).toBe('12');
  });
});

// =============================================================================
// 히스토리
// =============================================================================
describe('계산 히스토리 (US-08)', () => {
  it('계산 후 히스토리에 기록된다', () => {
    render(<App />);
    clickKeys(['3', '+', '4', '=']);
    expect(screen.getByTestId('history')).toBeInTheDocument();
    expect(screen.getByTestId('history-item').textContent).toContain('7');
  });

  it('[INV-1] 0 나누기도 히스토리에 기록된다', () => {
    render(<App />);
    clickKeys(['5', '/', '0', '=']);
    expect(screen.getByTestId('history-item').textContent).toContain('0으로 나눌 수 없습니다');
  });
});
