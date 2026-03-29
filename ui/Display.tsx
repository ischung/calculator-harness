/**
 * ui/Display.tsx — 입력/결과 표시 영역
 * [DESIGN] DESIGN.md 컴포넌트 구조 명세 준수
 * [DESIGN] 에러: #D32F2F + ⚠️ 아이콘, 값 아래 별도 영역
 */

import type { CalcError } from '../types/calc';

// [DESIGN] 에러 코드 → 사용자 메시지 (DESIGN.md 에러 메시지 표준)
const ERROR_MESSAGES: Record<CalcError, string> = {
  DIVISION_BY_ZERO: '0으로 나눌 수 없습니다',
  INVALID_INPUT:    '숫자를 입력해주세요',
  OVERFLOW:         '숫자가 너무 큽니다',
  NAN_RESULT:       '계산할 수 없는 값입니다',
};

interface DisplayProps {
  value: string;
  expression: string;
  errorCode: CalcError | null;
  errorKey: number;  // 에러 shake 애니메이션 재실행용
}

export function Display({ value, expression, errorCode, errorKey }: DisplayProps) {
  const hasError = errorCode !== null;

  return (
    <div
      className="display"
      data-testid="display"
      role={hasError ? 'alert' : 'status'}
      aria-live={hasError ? 'assertive' : 'polite'}
      aria-atomic="true"
      aria-label={hasError
        ? `오류: ${ERROR_MESSAGES[errorCode!]}`
        : `값: ${value}`}
    >
      {/* 표현식 (10 ÷) */}
      <div className="display-expression" data-testid="display-expression">
        {expression}
      </div>

      {/* 현재 입력/결과 값 — 에러가 있어도 값은 유지 */}
      <div
        className={`display-value${value.length > 10 ? ' is-long' : ''}`}
        data-testid="display-value"
      >
        {value}
      </div>

      {/* [DESIGN] 에러 메시지: 값 아래 별도 영역, #D32F2F + ⚠️ (DESIGN.md 명세) */}
      {hasError && (
        <div
          key={errorKey}
          className="display-error"
          data-testid="display-error"
        >
          ⚠️ {ERROR_MESSAGES[errorCode!]}
        </div>
      )}
    </div>
  );
}
