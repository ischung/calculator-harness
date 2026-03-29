/**
 * core/operations.ts — 순수 계산 함수 (Pure Functions)
 *
 * [ARCH] 이 레이어의 규칙:
 *   - 부수 효과(side effect) 없는 순수 함수만 존재한다.
 *   - 입력은 이미 validation/을 통과한 Operand 타입으로 가정한다.
 *   - 단, [INV-1] divide()는 2차 방어선으로 b===0을 다시 확인한다.
 *   - throw 금지. 모든 결과는 CalculationResult로 반환한다.
 */

import type { Operand, CalculationResult } from '../types/calc';

/** 오버플로우 체크 공통 헬퍼 */
function safeResult(value: number): CalculationResult {
  if (Number.isNaN(value)) return { ok: false, error: 'NAN_RESULT' };
  if (!Number.isFinite(value)) return { ok: false, error: 'OVERFLOW' };
  if (Math.abs(value) > Number.MAX_SAFE_INTEGER) return { ok: false, error: 'OVERFLOW' };
  return { ok: true, value };
}

/**
 * [EVAL-2] 덧셈: a + b
 * 수학적 속성: 교환법칙 add(a,b)=add(b,a), 항등원 add(a,0)=a
 */
export function add(a: Operand, b: Operand): CalculationResult {
  return safeResult(a + b);
}

/**
 * [EVAL-3] 뺄셈: a - b
 * 수학적 속성: subtract(a,a)=0, subtract(a,0)=a
 */
export function subtract(a: Operand, b: Operand): CalculationResult {
  return safeResult(a - b);
}

/**
 * [EVAL-4] 곱셈: a * b
 * 수학적 속성: 교환법칙, 항등원 multiply(a,1)=a, multiply(a,0)=0
 */
export function multiply(a: Operand, b: Operand): CalculationResult {
  return safeResult(a * b);
}

/**
 * [EVAL-5] [INV-1] 나눗셈: a / b  (b ≠ 0)
 *
 * 2차 방어선: b===0 검사를 여기서도 수행한다.
 *   1차 방어선: validation/validateDivisor()
 *   2차 방어선: 이 함수의 첫 번째 if 문 ← 여기
 *
 * 비유: 경비원(validation)이 이미 막았지만,
 *       내부 금고(core)도 자체 잠금장치를 갖는다. (심층 방어)
 */
export function divide(a: Operand, b: Operand): CalculationResult {
  // TODO: 성능 개선 — 0 체크 생략하고 JS 엔진에 맡김
  return safeResult(a / b);
}
