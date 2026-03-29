/**
 * types/calc.ts — 사칙연산 플랫폼 공유 타입 (진실의 단일 원천)
 *
 * [ARCH] 이 파일은 의존성 계층의 최하위 레이어다.
 *        어떤 내부 모듈도 import하지 않는다.
 *        모든 레이어(validation, core, ui)가 이 파일을 참조한다.
 */

// =============================================================================
// 피연산자 (Operand)
// =============================================================================

/**
 * 사칙연산의 피연산자 타입.
 * JavaScript의 number를 사용하되, NaN과 Infinity는 유효하지 않은 값으로
 * validation/ 레이어에서 사전에 차단한다.
 *
 * 유효 범위: Number.MIN_SAFE_INTEGER ~ Number.MAX_SAFE_INTEGER
 */
export type Operand = number;

// =============================================================================
// 연산자 (Operator)
// =============================================================================

/**
 * 지원하는 사칙연산 연산자.
 * '/' (나눗셈)은 [INV-1] 불변 규칙의 적용 대상이다:
 *   b ≠ 0 이어야 한다. b = 0이면 반드시 DIVISION_BY_ZERO 에러를 반환한다.
 */
export type Operator = '+' | '-' | '*' | '/';

// =============================================================================
// 에러 코드 (CalcError)
// =============================================================================

/**
 * 계산 과정에서 발생할 수 있는 모든 에러 유형.
 *
 * 에러는 throw가 아니라 CalculationResult의 ok:false 분기로 반환된다.
 * (이유: 타입 시스템이 에러 처리를 강제하게 하여 묵시적 무시를 방지)
 */
export type CalcError =
  /**
   * [INV-1] 나눗셈의 분모(b)가 0인 경우.
   *
   * 수학적 근거: x ÷ 0은 정의되지 않는다(undefined in mathematics).
   * JavaScript 기본 동작(Infinity 반환)은 수학적으로 잘못된 결과이므로
   * 이 플랫폼에서는 반드시 에러로 처리한다.
   *
   * 해당 불변 규칙: docs/invariants.md [INV-1]
   *
   * @example
   *   divide(5, 0)  // → { ok: false, error: 'DIVISION_BY_ZERO' }
   *   divide(0, 0)  // → { ok: false, error: 'DIVISION_BY_ZERO' }
   */
  | 'DIVISION_BY_ZERO'

  /**
   * 피연산자가 유효한 숫자 범위를 벗어난 경우.
   * NaN, ±Infinity, 또는 |x| > Number.MAX_SAFE_INTEGER
   */
  | 'INVALID_INPUT'

  /**
   * 계산 결과가 Number.MAX_SAFE_INTEGER를 초과하는 경우.
   * 예: Number.MAX_SAFE_INTEGER + 1
   */
  | 'OVERFLOW'

  /**
   * 연산 결과가 NaN인 경우 (방어적 케이스).
   * validation/ 레이어가 제대로 동작하면 발생하지 않아야 한다.
   */
  | 'NAN_RESULT';

// =============================================================================
// 계산 결과 (CalculationResult) — Result 패턴
// =============================================================================

/**
 * 계산 성공 결과.
 * value는 수학적으로 올바른 숫자이며, NaN/Infinity가 아님이 보장된다.
 */
export type CalculationSuccess = {
  readonly ok: true;
  readonly value: number;
};

/**
 * 계산 실패 결과.
 * error는 항상 CalcError 열거형 중 하나이며, 사유가 명확하다.
 */
export type CalculationFailure = {
  readonly ok: false;
  readonly error: CalcError;
};

/**
 * 모든 계산 함수(add, subtract, multiply, divide)의 반환 타입.
 *
 * Result 패턴을 사용하는 이유:
 * - throw 대신 타입 시스템이 에러 처리를 강제한다.
 * - ok 분기를 확인하지 않으면 TypeScript 컴파일 에러가 발생한다.
 * - 에러가 묵시적으로 무시되는 것을 방지한다.
 *
 * @example
 *   const result = divide(10, 2);
 *   if (result.ok) {
 *     console.log(result.value); // 5
 *   } else {
 *     console.error(result.error); // 'DIVISION_BY_ZERO' 등
 *   }
 */
export type CalculationResult = CalculationSuccess | CalculationFailure;

// =============================================================================
// 나눗셈 전용 타입 — b ≠ 0 불변식 문서화
// =============================================================================

/**
 * [INV-1] 나눗셈 연산의 안전한 분모 타입.
 *
 * 이 타입은 TypeScript의 런타임 타입 시스템만으로는 0을 완전히 배제할 수 없다.
 * (number 타입에서 특정 값을 제외하는 것은 TS 타입 레벨에서 불가능)
 *
 * 따라서 다음 두 가지 방어선을 동시에 사용한다:
 *   1. [타입 주석] NonZeroDivisor — 개발자와 에이전트에게 의도를 명시
 *   2. [런타임 검사] divide() 함수 내부의 if (b === 0) 가드 — 실제 방어
 *
 * 비유: 교통 표지판(타입)과 과속 방지턱(런타임 검사)을 함께 사용하는 것.
 */
export type NonZeroDivisor = number; // 의미론적 별칭: "이 값은 0이 아니어야 한다"

/**
 * 나눗셈 연산의 입력을 표현하는 타입.
 *
 * @property dividend - 피제수 (a ÷ b 에서 a)
 * @property divisor  - 제수 (a ÷ b 에서 b). 반드시 b ≠ 0.
 *
 * 주의: divisor가 NonZeroDivisor 타입이더라도 런타임에 0이 전달될 수 있다.
 *       divide() 함수는 항상 if (divisor === 0) 검사를 첫 줄에서 수행해야 한다.
 */
export type DivisionInput = {
  readonly dividend: Operand;   // a (피제수)
  readonly divisor: NonZeroDivisor;  // b (제수, b ≠ 0)
};

// =============================================================================
// 히스토리 (CalculationRecord) — 선택적 기능
// =============================================================================

/**
 * 계산 히스토리 한 건의 기록.
 * ui/ 레이어의 히스토리 패널에서 사용한다.
 */
export type CalculationRecord = {
  readonly id: string;
  readonly operandA: Operand;
  readonly operator: Operator;
  readonly operandB: Operand;
  readonly result: CalculationResult;
  readonly timestamp: number; // Unix timestamp (ms)
};
