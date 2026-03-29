/**
 * core/calculator.ts — 계산기 퍼사드 (Facade)
 *
 * [ARCH] ui/ 레이어가 호출하는 유일한 진입점.
 *        ui/는 validation/을 직접 import할 수 없으므로,
 *        이 함수가 validation → operations 흐름을 내부에서 조합한다.
 *
 *        ui/ → core/calculate() → validation/ + operations
 *                                  (ui는 이 내부 구조를 모른다)
 */

import type { CalculationResult } from '../types/calc';
import { validateCalculationInputs } from '../validation/index';
import { add, subtract, multiply, divide } from './operations';

/**
 * 원시 입력(raw input)을 받아 검증 후 계산하는 통합 함수.
 *
 * ui/ 레이어는 오직 이 함수만 호출한다.
 *
 * @param rawA  - 첫 번째 피연산자 (사용자 입력, unknown)
 * @param rawOp - 연산자 문자열 ('+' | '-' | '*' | '/')
 * @param rawB  - 두 번째 피연산자 (사용자 입력, unknown)
 *
 * @example
 *   calculate('10', '/', '2')  // → { ok: true, value: 5 }
 *   calculate('10', '/', '0')  // → { ok: false, error: 'DIVISION_BY_ZERO' }
 *   calculate('abc', '+', '1') // → { ok: false, error: 'INVALID_INPUT' }
 */
export function calculate(
  rawA: unknown,
  rawOp: unknown,
  rawB: unknown,
): CalculationResult {
  const validated = validateCalculationInputs(rawA, rawOp, rawB);
  if (!validated.ok) return validated;

  const { a, op, b } = validated.value;

  switch (op) {
    case '+': return add(a, b);
    case '-': return subtract(a, b);
    case '*': return multiply(a, b);
    case '/': return divide(a, b);
  }
}
