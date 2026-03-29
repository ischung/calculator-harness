/**
 * ui/HistoryPanel.tsx — 계산 히스토리 패널 (US-08)
 * [DESIGN] DESIGN.md 컴포넌트 구조 명세 준수
 */

import type { CalcError, CalculationRecord, Operator } from '../types/calc';

const ERROR_MESSAGES: Record<CalcError, string> = {
  DIVISION_BY_ZERO: '0으로 나눌 수 없습니다',
  INVALID_INPUT:    '숫자를 입력해주세요',
  OVERFLOW:         '숫자가 너무 큽니다',
  NAN_RESULT:       '계산할 수 없는 값입니다',
};

const OP_SYMBOLS: Record<Operator, string> = {
  '+': '+', '-': '−', '*': '×', '/': '÷',
};

function formatValue(n: number): string {
  if (Number.isInteger(n)) return n.toLocaleString('ko-KR');
  return parseFloat(n.toPrecision(10).replace(/\.?0+$/, ''))
    .toLocaleString('ko-KR', { maximumFractionDigits: 10 });
}

interface HistoryPanelProps {
  history: CalculationRecord[];
}

export function HistoryPanel({ history }: HistoryPanelProps) {
  if (history.length === 0) return null;

  return (
    <div className="history-panel" data-testid="history" aria-label="계산 히스토리">
      <div className="history-header">히스토리</div>
      <div className="history-list">
        {history.map(rec => {
          const isErr = !rec.result.ok;
          const resultText = rec.result.ok
            ? formatValue(rec.result.value)
            : ERROR_MESSAGES[rec.result.error];

          return (
            <div key={rec.id} className="history-item" data-testid="history-item">
              <div className="history-item-expr">
                {rec.operandA} {OP_SYMBOLS[rec.operator]} {rec.operandB}
              </div>
              <div className={`history-item-result${isErr ? ' is-error' : ''}`}>
                {isErr ? '⚠️ ' : '= '}{resultText}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
