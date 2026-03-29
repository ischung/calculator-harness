/**
 * ui/App.tsx — 사칙연산 계산기 컴포넌트
 *
 * [ARCH] ui/ 레이어 규칙:
 *   - types/ 와 core/ 만 import한다. validation/ 직접 호출 금지.
 *   - 계산은 반드시 core/calculator.calculate()를 경유한다.
 *   - 에러 코드(CalcError)를 사람이 읽을 수 있는 메시지로 변환하는 것은 이 레이어의 책임.
 *
 * [DESIGN] DESIGN.md의 상태 머신을 구현한다:
 *   Idle → InputA → OperatorSelected → InputB → Result/Error → Idle
 */

import React, { useState, useCallback } from 'react';
import type { Operator, CalcError, CalculationRecord } from '../types/calc';
import { calculate } from '../core/calculator';

// =============================================================================
// 에러 코드 → 사용자 메시지 변환 (ui/ 레이어의 책임)
// =============================================================================

const ERROR_MESSAGES: Record<CalcError, string> = {
  DIVISION_BY_ZERO: '0으로 나눌 수 없습니다',
  INVALID_INPUT:    '숫자를 입력해주세요',
  OVERFLOW:         '숫자가 너무 큽니다',
  NAN_RESULT:       '계산할 수 없는 값입니다',
};

// =============================================================================
// 상태 머신 타입
// =============================================================================

type CalcState =
  | 'idle'             // 초기 상태
  | 'inputA'           // 첫 번째 피연산자 입력 중
  | 'operatorSelected' // 연산자 선택됨
  | 'inputB'           // 두 번째 피연산자 입력 중
  | 'result'           // 계산 성공
  | 'error';           // 계산 실패 (DIVISION_BY_ZERO 등)

// =============================================================================
// 컴포넌트
// =============================================================================

export default function App(): React.JSX.Element {
  const [displayA,  setDisplayA]  = useState<string>('');
  const [displayB,  setDisplayB]  = useState<string>('');
  const [operator,  setOperator]  = useState<Operator | null>(null);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [errorCode, setErrorCode] = useState<CalcError | null>(null);
  const [calcState, setCalcState] = useState<CalcState>('idle');
  const [history,   setHistory]   = useState<CalculationRecord[]>([]);

  // ── 숫자/소수점 입력 ─────────────────────────────────────
  const handleDigit = useCallback((digit: string) => {
    if (calcState === 'idle' || calcState === 'inputA') {
      setDisplayA(prev => (prev === '0' && digit !== '.' ? digit : prev + digit));
      setCalcState('inputA');
    } else if (calcState === 'operatorSelected' || calcState === 'inputB') {
      setDisplayB(prev => (prev === '0' && digit !== '.' ? digit : prev + digit));
      setCalcState('inputB');
    } else {
      // result/error 상태: 새 계산 시작
      setDisplayA(digit); setDisplayB('');
      setOperator(null); setLastResult(null); setErrorCode(null);
      setCalcState('inputA');
    }
  }, [calcState]);

  // ── 연산자 선택 ──────────────────────────────────────────
  const handleOperator = useCallback((op: Operator) => {
    if (calcState === 'inputA') {
      setOperator(op);
      setCalcState('operatorSelected');
    } else if (calcState === 'result' && lastResult !== null) {
      setDisplayA(String(lastResult));
      setDisplayB('');
      setOperator(op);
      setCalcState('operatorSelected');
    }
  }, [calcState, lastResult]);

  // ── 계산 실행 (=) ────────────────────────────────────────
  const handleEquals = useCallback(() => {
    if (calcState !== 'inputB' || !operator) return;

    const result = calculate(displayA, operator, displayB);

    const record: CalculationRecord = {
      id:        String(Date.now()),
      operandA:  Number(displayA),
      operator,
      operandB:  Number(displayB),
      result,
      timestamp: Date.now(),
    };
    setHistory(prev => [record, ...prev.slice(0, 9)]);  // 최근 10개 유지

    if (result.ok) {
      setLastResult(result.value);
      setErrorCode(null);
      setCalcState('result');
    } else {
      setErrorCode(result.error);
      setLastResult(null);
      setCalcState('error');
    }
  }, [calcState, operator, displayA, displayB]);

  // ── 초기화 (C) ───────────────────────────────────────────
  const handleClear = useCallback(() => {
    setDisplayA(''); setDisplayB('');
    setOperator(null); setLastResult(null); setErrorCode(null);
    setCalcState('idle');
  }, []);

  // ── 백스페이스 ───────────────────────────────────────────
  const handleBackspace = useCallback(() => {
    if (calcState === 'inputB') {
      setDisplayB(prev => prev.slice(0, -1) || '');
    } else if (calcState === 'inputA') {
      setDisplayA(prev => prev.slice(0, -1) || '');
    }
  }, [calcState]);

  // ── 키보드 단축키 지원 (DESIGN.md 접근성) ─────────────────
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (/^[0-9.]$/.test(e.key))              handleDigit(e.key);
    else if (e.key === '+')                  handleOperator('+');
    else if (e.key === '-')                  handleOperator('-');
    else if (e.key === '*')                  handleOperator('*');
    else if (e.key === '/')                  { e.preventDefault(); handleOperator('/'); }
    else if (e.key === 'Enter' || e.key === '=') handleEquals();
    else if (e.key === 'Escape')             handleClear();
    else if (e.key === 'Backspace')          handleBackspace();
  }, [handleDigit, handleOperator, handleEquals, handleClear, handleBackspace]);

  // ── 디스플레이 값 계산 ────────────────────────────────────
  const getDisplayValue = (): string => {
    if (calcState === 'error' && errorCode) return ERROR_MESSAGES[errorCode];
    if (calcState === 'result' && lastResult !== null) return String(lastResult);
    if (calcState === 'inputB' || calcState === 'operatorSelected') return displayB || '0';
    return displayA || '0';
  };

  const isError = calcState === 'error';
  const displayValue = getDisplayValue();

  return (
    <div
      data-testid="calculator"
      role="application"
      aria-label="사칙연산 계산기"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      {/* ── 디스플레이 ─────────────────────────────────────── */}
      <div
        data-testid="display"
        role={isError ? 'alert' : 'status'}
        aria-live={isError ? 'assertive' : 'polite'}
        aria-label={isError ? `오류: ${displayValue}` : `값: ${displayValue}`}
        aria-atomic="true"
      >
        {operator && (calcState === 'operatorSelected' || calcState === 'inputB') && (
          <div data-testid="display-expression">
            {displayA} {operator}
          </div>
        )}
        <div data-testid="display-value">
          {displayValue}
        </div>
      </div>

      {/* ── 키패드 ─────────────────────────────────────────── */}
      <div data-testid="keypad">
        {/* 숫자 키 */}
        {(['7','8','9','4','5','6','1','2','3','0'] as const).map(d => (
          <button
            key={d}
            onClick={() => handleDigit(d)}
            aria-label={`숫자 ${d}`}
            data-testid={`key-${d}`}
          >
            {d}
          </button>
        ))}
        <button onClick={() => handleDigit('.')} aria-label="소수점" data-testid="key-dot">.</button>

        {/* 연산자 키 */}
        {(['+', '-', '*', '/'] as Operator[]).map(op => (
          <button
            key={op}
            onClick={() => handleOperator(op)}
            aria-label={`연산자 ${op === '*' ? '곱하기' : op === '/' ? '나누기' : op === '+' ? '더하기' : '빼기'}`}
            data-testid={`op-${op}`}
          >
            {op === '*' ? '×' : op === '/' ? '÷' : op}
          </button>
        ))}

        {/* 실행/제어 키 */}
        <button onClick={handleEquals}   aria-label="계산 실행" data-testid="key-equals">=</button>
        <button onClick={handleClear}    aria-label="초기화"   data-testid="key-clear">C</button>
        <button onClick={handleBackspace} aria-label="마지막 입력 삭제" data-testid="key-backspace">⌫</button>
      </div>

      {/* ── 계산 히스토리 (US-08) ──────────────────────────── */}
      {history.length > 0 && (
        <div data-testid="history" aria-label="계산 히스토리">
          {history.map(rec => (
            <div key={rec.id} data-testid="history-item">
              {rec.operandA} {rec.operator} {rec.operandB} ={' '}
              {rec.result.ok ? rec.result.value : ERROR_MESSAGES[rec.result.error]}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
