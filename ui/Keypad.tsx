/**
 * ui/Keypad.tsx — 숫자 + 연산자 버튼 그리드
 * [DESIGN] DESIGN.md 키보드 접근성 기준 준수
 * [DESIGN] 모바일 최소 버튼 크기 44×44px (실제 72px)
 */

import type { Operator } from '../types/calc';

// [DESIGN] 연산자 표시 기호
const OP_SYMBOLS: Record<Operator, string> = {
  '+': '+', '-': '−', '*': '×', '/': '÷',
};
const OP_LABELS: Record<Operator, string> = {
  '+': '더하기', '-': '빼기', '*': '곱하기', '/': '나누기',
};

interface KeypadProps {
  activeOperator: Operator | null;
  isOperatorPending: boolean;  // operatorSelected 상태일 때 true
  onDigit:    (d: string)   => void;
  onOperator: (op: Operator) => void;
  onEquals:   () => void;
  onClear:    () => void;
  onBackspace: () => void;
}

export function Keypad({
  activeOperator, isOperatorPending,
  onDigit, onOperator, onEquals, onClear, onBackspace,
}: KeypadProps) {
  return (
    <div className="keypad" data-testid="keypad">

      {/* 행 1: C(span2) ⌫ ÷ */}
      <button className="btn btn-clear"
        onClick={onClear} aria-label="초기화" data-testid="key-clear">C</button>
      <button className="btn btn-backspace"
        onClick={onBackspace} aria-label="마지막 입력 삭제" data-testid="key-backspace">⌫</button>
      {(['/' , '*', '-', '+'] as Operator[]).slice(0, 1).map(op => (
        <button key={op}
          className={`btn btn-operator${activeOperator === op && isOperatorPending ? ' is-active' : ''}`}
          onClick={() => onOperator(op)}
          aria-label={`연산자 ${OP_LABELS[op]}`}
          data-testid={`op-${op}`}>
          {OP_SYMBOLS[op]}
        </button>
      ))}

      {/* 행 2: 7 8 9 × */}
      {(['7','8','9'] as const).map(d => (
        <button key={d} className="btn"
          onClick={() => onDigit(d)} aria-label={`숫자 ${d}`} data-testid={`key-${d}`}>{d}</button>
      ))}
      <button
        className={`btn btn-operator${activeOperator === '*' && isOperatorPending ? ' is-active' : ''}`}
        onClick={() => onOperator('*')} aria-label="연산자 곱하기" data-testid="op-*">×</button>

      {/* 행 3: 4 5 6 − */}
      {(['4','5','6'] as const).map(d => (
        <button key={d} className="btn"
          onClick={() => onDigit(d)} aria-label={`숫자 ${d}`} data-testid={`key-${d}`}>{d}</button>
      ))}
      <button
        className={`btn btn-operator${activeOperator === '-' && isOperatorPending ? ' is-active' : ''}`}
        onClick={() => onOperator('-')} aria-label="연산자 빼기" data-testid="op--">−</button>

      {/* 행 4: 1 2 3 + */}
      {(['1','2','3'] as const).map(d => (
        <button key={d} className="btn"
          onClick={() => onDigit(d)} aria-label={`숫자 ${d}`} data-testid={`key-${d}`}>{d}</button>
      ))}
      <button
        className={`btn btn-operator${activeOperator === '+' && isOperatorPending ? ' is-active' : ''}`}
        onClick={() => onOperator('+')} aria-label="연산자 더하기" data-testid="op-+">+</button>

      {/* 행 5: 0(span2) . = */}
      <button className="btn btn-zero"
        onClick={() => onDigit('0')} aria-label="숫자 0" data-testid="key-0">0</button>
      <button className="btn"
        onClick={() => onDigit('.')} aria-label="소수점" data-testid="key-dot">.</button>
      <button className="btn btn-equals"
        onClick={onEquals} aria-label="계산 실행" data-testid="key-equals">=</button>

    </div>
  );
}
