/**
 * core/operations.test.ts
 * docs/evals.md EVAL-2(덧셈) ~ EVAL-5(나눗셈) + [INV-1] 2차 방어선 검증
 */

import { add, subtract, multiply, divide } from './operations';

// =============================================================================
// EVAL-2: 덧셈
// =============================================================================
describe('add — [EVAL-2]', () => {
  it('[EVAL-2-A] 1 + 1 = 2', () => expect(add(1, 1)).toEqual({ ok: true, value: 2 }));
  it('[EVAL-2-B] -5 + 3 = -2', () => expect(add(-5, 3)).toEqual({ ok: true, value: -2 }));
  it('[EVAL-2-C] 0 + 0 = 0', () => expect(add(0, 0)).toEqual({ ok: true, value: 0 }));
  it('[EVAL-2] 항등원: a + 0 = a', () => {
    expect(add(42, 0)).toEqual({ ok: true, value: 42 });
  });
  it('[EVAL-2] 교환법칙: add(3,7) = add(7,3)', () => {
    const r1 = add(3, 7); const r2 = add(7, 3);
    expect(r1.ok && r2.ok && r1.value === r2.value).toBe(true);
  });
  it('[EVAL-2-D] 0.1 + 0.2 ≈ 0.3 (부동소수점)', () => {
    const r = add(0.1, 0.2);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(0.3, 10);
  });
  it('[EVAL-2] OVERFLOW: MAX_SAFE_INT + MAX_SAFE_INT', () => {
    const r = add(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    expect(r).toEqual({ ok: false, error: 'OVERFLOW' });
  });
});

// =============================================================================
// EVAL-3: 뺄셈
// =============================================================================
describe('subtract — [EVAL-3]', () => {
  it('[EVAL-3-A] 10 - 3 = 7', () => expect(subtract(10, 3)).toEqual({ ok: true, value: 7 }));
  it('[EVAL-3-B] 0 - 5 = -5', () => expect(subtract(0, 5)).toEqual({ ok: true, value: -5 }));
  it('[EVAL-3-C] a - a = 0', () => expect(subtract(99, 99)).toEqual({ ok: true, value: 0 }));
  it('[EVAL-3] subtract(a,b) = add(a,-b)', () => {
    const r1 = subtract(10, 3); const r2 = add(10, -3);
    expect(r1.ok && r2.ok && r1.value === r2.value).toBe(true);
  });
});

// =============================================================================
// EVAL-4: 곱셈
// =============================================================================
describe('multiply — [EVAL-4]', () => {
  it('[EVAL-4-A] 4 × 5 = 20', () => expect(multiply(4, 5)).toEqual({ ok: true, value: 20 }));
  it('[EVAL-4-B] -3 × -2 = 6', () => expect(multiply(-3, -2)).toEqual({ ok: true, value: 6 }));
  it('[EVAL-4-C] a × 0 = 0', () => expect(multiply(999, 0)).toEqual({ ok: true, value: 0 }));
  it('[EVAL-4-D] a × 1 = a (항등원)', () => expect(multiply(7, 1)).toEqual({ ok: true, value: 7 }));
  it('[EVAL-4] 교환법칙: multiply(a,b) = multiply(b,a)', () => {
    const r1 = multiply(6, 7); const r2 = multiply(7, 6);
    expect(r1.ok && r2.ok && r1.value === r2.value).toBe(true);
  });
});

// =============================================================================
// EVAL-5 + [INV-1] 2차 방어선: 나눗셈
// =============================================================================
describe('divide — [EVAL-5] + [INV-1] 2차 방어선', () => {
  it('[EVAL-5-A] 10 ÷ 2 = 5', () => expect(divide(10, 2)).toEqual({ ok: true, value: 5 }));
  it('[EVAL-5-B] -8 ÷ 4 = -2', () => expect(divide(-8, 4)).toEqual({ ok: true, value: -2 }));
  it('[EVAL-5-C] 1 ÷ 3 ≈ 0.333...', () => {
    const r = divide(1, 3);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(0.3333333, 5);
  });
  it('[EVAL-5] 역연산: divide(a*b, b) ≈ a', () => {
    const r = divide(multiply(6, 7).ok ? (multiply(6,7) as {ok:true;value:number}).value : 0, 7);
    expect(r.ok).toBe(true);
    if (r.ok) expect(r.value).toBeCloseTo(6, 10);
  });

  // [INV-1] 2차 방어선 테스트
  it('[INV-1][2차] divide(5, 0) → DIVISION_BY_ZERO', () => {
    expect(divide(5, 0)).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' });
  });
  it('[INV-1][2차] divide(0, 0) → DIVISION_BY_ZERO', () => {
    expect(divide(0, 0)).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' });
  });
  it('[INV-1][2차] divide(-7, 0) → DIVISION_BY_ZERO', () => {
    expect(divide(-7, 0)).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' });
  });
  it('[INV-1][2차] Infinity가 절대 반환되지 않음', () => {
    const r = divide(1, 0);
    expect(r.ok).toBe(false);
    // ok:true라면 Infinity가 아닌지 검증 (방어적)
    if (r.ok) expect(isFinite(r.value)).toBe(true);
  });
});
