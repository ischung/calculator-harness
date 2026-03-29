/**
 * validation/index.ts — 입력 검증 레이어
 *
 * [ARCH] 이 레이어의 역할: 외부 세계(사용자 입력, UI)와 core/ 사이의 방어벽.
 *        "신뢰 경계(trust boundary)"를 구현한다.
 *
 * [ARCH] 허용된 import: types/ 만.
 *        core/, ui/ 를 import하면 린터가 차단한다.
 *
 * [INV-1] 이 파일은 b=0 나눗셈을 차단하는 1차 방어선이다.
 *         core/의 divide()는 2차 방어선이다. (심층 방어, defense in depth)
 */

import type {
  Operand,
  Operator,
  CalcError,
  NonZeroDivisor,
} from '../types/calc';

// =============================================================================
// 내부 헬퍼 타입
// =============================================================================

/** 검증 성공: 유효한 값을 담은 Result */
type ValidOk<T> = { readonly ok: true; readonly value: T };

/** 검증 실패: CalcError를 담은 Result */
type ValidErr = { readonly ok: false; readonly error: CalcError };

type ValidationResult<T> = ValidOk<T> | ValidErr;

// =============================================================================
// [INV-3] 피연산자 검증 — validateOperand
// =============================================================================

/**
 * 사용자 입력을 유효한 Operand로 변환한다.
 *
 * 거부 조건 (순서대로 검사):
 *   1. null / undefined          → INVALID_INPUT
 *   2. 숫자로 변환 불가한 문자열  → INVALID_INPUT
 *   3. NaN                       → INVALID_INPUT
 *   4. ±Infinity                 → INVALID_INPUT
 *   5. |x| > MAX_SAFE_INTEGER    → OVERFLOW
 *
 * @param raw - UI 레이어에서 넘어온 원시 입력 (unknown 타입)
 *
 * @example
 *   validateOperand("42")    // → { ok: true, value: 42 }
 *   validateOperand("abc")   // → { ok: false, error: 'INVALID_INPUT' }
 *   validateOperand(NaN)     // → { ok: false, error: 'INVALID_INPUT' }
 *   validateOperand(Infinity)// → { ok: false, error: 'INVALID_INPUT' }
 */
export function validateOperand(raw: unknown): ValidationResult<Operand> {
  // 1. null / undefined 차단
  if (raw === null || raw === undefined) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  // 2. 숫자로 변환 시도 (문자열 "42" → 42 허용)
  const n = typeof raw === 'string' ? Number(raw) : raw;

  // 3. 숫자 타입이 아닌 경우 차단 (boolean, object 등)
  if (typeof n !== 'number') {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  // 4. NaN 차단
  if (Number.isNaN(n)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  // 5. ±Infinity 차단
  if (!Number.isFinite(n)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }

  // 6. 안전한 정수 범위 초과 차단
  if (Math.abs(n) > Number.MAX_SAFE_INTEGER) {
    return { ok: false, error: 'OVERFLOW' };
  }

  return { ok: true, value: n };
}

// =============================================================================
// [INV-1] 0 나누기 방어 — validateDivisor (1차 방어선)
// =============================================================================

/**
 * 나눗셈의 분모(b)가 0인지 검사한다.
 *
 * [INV-1] 이 함수는 validation/ 레이어의 핵심 불변 규칙 구현체다.
 *
 * 수학적 근거:
 *   a ÷ b 에서 b = 0이면 결과는 수학적으로 정의되지 않는다 (undefined).
 *   JavaScript는 Infinity를 반환하지만, 이는 교육적으로 잘못된 답이므로
 *   이 플랫폼은 반드시 에러로 처리한다.
 *
 * 비유: 이 함수는 "과속 방지턱"이다.
 *       0이라는 분모가 core/에 도달하기 전에 여기서 멈춰 세운다.
 *
 * @param raw - 분모 입력값 (unknown)
 * @returns 유효한 NonZeroDivisor이면 ok:true, b=0이면 DIVISION_BY_ZERO 에러
 *
 * @example
 *   validateDivisor(2)   // → { ok: true, value: 2 }
 *   validateDivisor(0)   // → { ok: false, error: 'DIVISION_BY_ZERO' }  ← [INV-1]
 *   validateDivisor("0") // → { ok: false, error: 'DIVISION_BY_ZERO' }  ← [INV-1]
 *   validateDivisor(-0)  // → { ok: false, error: 'DIVISION_BY_ZERO' }  ← -0도 0이다!
 */
export function validateDivisor(raw: unknown): ValidationResult<NonZeroDivisor> {
  // 먼저 일반적인 피연산자 검증을 통과해야 한다
  const operandResult = validateOperand(raw);
  if (!operandResult.ok) {
    return operandResult;
  }

  const b = operandResult.value;

  // [INV-1] 핵심 검사: 0 (양수 0과 음수 0 -0 모두 차단)
  // Object.is(b, 0) 은 +0을, Object.is(b, -0) 은 -0을 감지한다
  // b === 0 은 +0과 -0 모두 true이므로 충분하다
  if (b === 0) {
    return { ok: false, error: 'DIVISION_BY_ZERO' };
  }

  return { ok: true, value: b };
}

// =============================================================================
// 연산자 검증 — validateOperator
// =============================================================================

/** 유효한 연산자 집합 */
const VALID_OPERATORS = new Set<Operator>(['+', '-', '*', '/']);

/**
 * 입력 문자열이 유효한 연산자인지 검사한다.
 *
 * @example
 *   validateOperator('+') // → { ok: true, value: '+' }
 *   validateOperator('%') // → { ok: false, error: 'INVALID_INPUT' }
 */
export function validateOperator(raw: unknown): ValidationResult<Operator> {
  if (typeof raw !== 'string' || !VALID_OPERATORS.has(raw as Operator)) {
    return { ok: false, error: 'INVALID_INPUT' };
  }
  return { ok: true, value: raw as Operator };
}

// =============================================================================
// 통합 검증 — validateCalculationInputs
// =============================================================================

/** 검증된 계산 입력 */
export type ValidatedInputs = {
  readonly a: Operand;
  readonly op: Operator;
  readonly b: Operand;       // 나눗셈의 경우 이미 b≠0이 보장됨
};

/**
 * 세 입력(a, op, b)을 한 번에 검증한다.
 *
 * [INV-1] op === '/' 일 때 b = 0이면 반드시 DIVISION_BY_ZERO를 반환한다.
 *
 * 이 함수는 ui/ 레이어가 core/를 호출하기 직전에 실행하는 "통합 관문"이다.
 *
 * @example
 *   validateCalculationInputs("10", "/", "2")
 *     // → { ok: true, value: { a: 10, op: '/', b: 2 } }
 *
 *   validateCalculationInputs("10", "/", "0")
 *     // → { ok: false, error: 'DIVISION_BY_ZERO' }  ← [INV-1]
 *
 *   validateCalculationInputs("abc", "+", "1")
 *     // → { ok: false, error: 'INVALID_INPUT' }
 */
export function validateCalculationInputs(
  rawA: unknown,
  rawOp: unknown,
  rawB: unknown,
): ValidationResult<ValidatedInputs> {
  // 첫 번째 피연산자 검증
  const aResult = validateOperand(rawA);
  if (!aResult.ok) return aResult;

  // 연산자 검증
  const opResult = validateOperator(rawOp);
  if (!opResult.ok) return opResult;

  const op = opResult.value;

  // 두 번째 피연산자 검증: 나눗셈이면 0 차단 [INV-1], 아니면 일반 검증
  const bResult = op === '/'
    ? validateDivisor(rawB)       // [INV-1]: 0 차단
    : validateOperand(rawB);

  if (!bResult.ok) return bResult;

  return {
    ok: true,
    value: { a: aResult.value, op, b: bResult.value },
  };
}
