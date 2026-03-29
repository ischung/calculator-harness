/**
 * ui/App.tsx — 상태 관리 오케스트레이터
 *
 * [ARCH] ui/ 레이어 규칙:
 *   - types/ 와 core/ 만 import. validation/ 직접 호출 금지.
 *   - 계산은 core/calculator.calculate() 경유.
 *
 * [DESIGN] DESIGN.md 컴포넌트 구조 준수:
 *   App(상태) → Display + Keypad + HistoryPanel(표현)
 *   이 파일은 상태 머신과 이벤트 핸들러만 담당한다.
 *   렌더링 세부사항은 각 컴포넌트에 위임한다.
 */

import { useState, useCallback } from 'react';
import type { Operator, CalcError, CalculationRecord } from '../types/calc';
import { calculate } from '../core/calculator';
import { Display }      from './Display';
import { Keypad }       from './Keypad';
import { HistoryPanel } from './HistoryPanel';
import './App.css';

// ── 숫자 포맷 ─────────────────────────────────────────────
function formatValue(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString('ko-KR');
  return parseFloat(n.toPrecision(10).replace(/\.?0+$/, ''))
    .toLocaleString('ko-KR', { maximumFractionDigits: 10 });
}

// ── 연산자 기호 ───────────────────────────────────────────
const OP_SYMBOLS: Record<Operator, string> = {
  '+': '+', '-': '−', '*': '×', '/': '÷',
};

// ── 상태 머신 타입 ────────────────────────────────────────
// [DESIGN] Idle → InputA → OperatorSelected → InputB → Result/Error → Idle
type CalcState = 'idle' | 'inputA' | 'operatorSelected' | 'inputB' | 'result' | 'error';

export default function App() {
  const [displayA,    setDisplayA]    = useState('');
  const [displayB,    setDisplayB]    = useState('');
  const [operator,    setOperator]    = useState<Operator | null>(null);
  const [lastResult,  setLastResult]  = useState<number | null>(null);
  const [errorCode,   setErrorCode]   = useState<CalcError | null>(null);
  const [calcState,   setCalcState]   = useState<CalcState>('idle');
  const [history,     setHistory]     = useState<CalculationRecord[]>([]);
  const [errorKey,    setErrorKey]    = useState(0);

  const handleDigit = useCallback((digit: string) => {
    if (calcState === 'idle' || calcState === 'inputA') {
      setDisplayA(prev => {
        if (digit === '.' && prev.includes('.')) return prev;
        if (prev === '0' && digit !== '.') return digit;
        return prev + digit;
      });
      setCalcState('inputA');
    } else if (calcState === 'operatorSelected' || calcState === 'inputB') {
      setDisplayB(prev => {
        if (digit === '.' && prev.includes('.')) return prev;
        if (prev === '0' && digit !== '.') return digit;
        return prev + digit;
      });
      setCalcState('inputB');
    } else {
      setDisplayA(digit === '.' ? '0.' : digit);
      setDisplayB(''); setOperator(null); setLastResult(null); setErrorCode(null);
      setCalcState('inputA');
    }
  }, [calcState]);

  const handleOperator = useCallback((op: Operator) => {
    if (calcState === 'inputA') {
      setOperator(op); setCalcState('operatorSelected');
    } else if (calcState === 'operatorSelected') {
      setOperator(op);
    } else if (calcState === 'result' && lastResult !== null) {
      setDisplayA(String(lastResult));
      setDisplayB(''); setOperator(op); setCalcState('operatorSelected');
    }
  }, [calcState, lastResult]);

  const handleEquals = useCallback(() => {
    if (calcState !== 'inputB' || !operator) return;

    const result = calculate(displayA, operator, displayB);
    const record: CalculationRecord = {
      id: String(Date.now()),
      operandA: Number(displayA), operator,
      operandB: Number(displayB), result,
      timestamp: Date.now(),
    };
    setHistory(prev => [record, ...prev.slice(0, 19)]);

    if (result.ok) {
      setLastResult(result.value);
      setErrorCode(null);
      setCalcState('result');
    } else {
      setErrorCode(result.error);
      setLastResult(null);
      setErrorKey(k => k + 1);
      setCalcState('error');
    }
  }, [calcState, operator, displayA, displayB]);

  const handleClear = useCallback(() => {
    setDisplayA(''); setDisplayB(''); setOperator(null);
    setLastResult(null); setErrorCode(null);
    setCalcState('idle');
  }, []);

  const handleBackspace = useCallback(() => {
    if (calcState === 'inputB')   setDisplayB(p => p.slice(0, -1));
    else if (calcState === 'inputA') setDisplayA(p => p.slice(0, -1));
  }, [calcState]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (/^[0-9.]$/.test(e.key))                  handleDigit(e.key);
    else if (e.key === '+')                       handleOperator('+');
    else if (e.key === '-')                       handleOperator('-');
    else if (e.key === '*')                       handleOperator('*');
    else if (e.key === '/') { e.preventDefault(); handleOperator('/'); }
    else if (e.key === 'Enter' || e.key === '=')  handleEquals();
    else if (e.key === 'Escape')                  handleClear();
    else if (e.key === 'Backspace')               handleBackspace();
  }, [handleDigit, handleOperator, handleEquals, handleClear, handleBackspace]);

  // ── Display에 넘길 파생 값 ─────────────────────────────
  const displayValue = (() => {
    if (calcState === 'result' && lastResult !== null) return formatValue(lastResult);
    if (calcState === 'inputB' || calcState === 'operatorSelected') return displayB || '0';
    return displayA || '0';
  })();

  const expressionText = (operator && (calcState === 'operatorSelected' || calcState === 'inputB'))
    ? `${displayA} ${OP_SYMBOLS[operator]}`
    : '';

  return (
    <div className="app-wrapper">
      <div
        className="calculator"
        data-testid="calculator"
        role="application"
        aria-label="사칙연산 계산기"
        onKeyDown={handleKeyDown}
        tabIndex={0}
      >
        <Display
          value={displayValue}
          expression={expressionText}
          errorCode={errorCode}
          errorKey={errorKey}
        />
        <Keypad
          activeOperator={operator}
          isOperatorPending={calcState === 'operatorSelected'}
          onDigit={handleDigit}
          onOperator={handleOperator}
          onEquals={handleEquals}
          onClear={handleClear}
          onBackspace={handleBackspace}
        />
      </div>
      <HistoryPanel history={history} />
    </div>
  );
}
