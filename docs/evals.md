# docs/evals.md — 수학적 정확성 평가 (Evaluation)

> **Eval(평가)**: AI 에이전트가 생성한 코드가 올바른지 자동으로 검증하는 테스트 시나리오.
> 비유: 학교 시험 답안지. 에이전트가 작성한 코드를 이 기준으로 채점한다.

---

## Eval 철학

OpenAI 하네스 엔지니어링에서 배운 교훈:
> "에이전트는 CI 실패를 보고 스스로 수정한다. 좋은 eval은 에이전트에게 명확한 수정 지시를 준다."

모든 eval 실패 메시지는 **왜 틀렸는지, 어떻게 고쳐야 하는지**를 포함한다.

---

## EVAL-1: 0 나누기 방어 (Critical)

**목적**: `[INV-1]` 불변 규칙 검증

```typescript
// EVAL-1-A: 양수 ÷ 0
test('[EVAL-1-A] divide(5, 0) must return DIVISION_BY_ZERO error', () => {
  const result = divide(5, 0);
  expect(result.ok).toBe(false);
  expect(result.error).toBe('DIVISION_BY_ZERO');
  // 에이전트에게: divide() 함수의 첫 줄에 if (b === 0) 검사가 있어야 합니다
});

// EVAL-1-B: 0 ÷ 0
test('[EVAL-1-B] divide(0, 0) must return DIVISION_BY_ZERO error', () => {
  const result = divide(0, 0);
  expect(result.ok).toBe(false);
  expect(result.error).toBe('DIVISION_BY_ZERO');
});

// EVAL-1-C: 음수 ÷ 0
test('[EVAL-1-C] divide(-7, 0) must return DIVISION_BY_ZERO error', () => {
  const result = divide(-7, 0);
  expect(result.ok).toBe(false);
  expect(result.error).toBe('DIVISION_BY_ZERO');
});

// EVAL-1-D: Infinity가 절대 반환되면 안 됨
test('[EVAL-1-D] No operation should ever return Infinity', () => {
  const ops = [add, subtract, multiply];
  ops.forEach(op => {
    const result = op(Number.MAX_VALUE, Number.MAX_VALUE);
    if (result.ok) {
      expect(isFinite(result.value)).toBe(true);
    }
  });
});
```

**합격 기준**: 4/4 통과

---

## EVAL-2: 덧셈 정확성

```typescript
// 기본 케이스
test('[EVAL-2-A] add(1, 1) = 2', () => expect(add(1, 1)).toEqual({ ok: true, value: 2 }));
test('[EVAL-2-B] add(-5, 3) = -2', () => expect(add(-5, 3)).toEqual({ ok: true, value: -2 }));
test('[EVAL-2-C] add(0, 0) = 0', () => expect(add(0, 0)).toEqual({ ok: true, value: 0 }));
test('[EVAL-2-D] add(0.1, 0.2) ≈ 0.3', () => {
  const result = add(0.1, 0.2);
  expect(result.ok).toBe(true);
  expect(result.value).toBeCloseTo(0.3, 10); // 부동소수점 허용 오차
});

// Property-based: 교환법칙 a+b = b+a
test('[EVAL-2-P] 덧셈 교환법칙', () => {
  fc.assert(fc.property(fc.integer(), fc.integer(), (a, b) => {
    const r1 = add(a, b);
    const r2 = add(b, a);
    return r1.ok && r2.ok && r1.value === r2.value;
  }));
});
```

---

## EVAL-3: 뺄셈 정확성

```typescript
test('[EVAL-3-A] subtract(10, 3) = 7');
test('[EVAL-3-B] subtract(0, 5) = -5');
test('[EVAL-3-C] subtract(a, a) = 0 (자기 자신 빼기)');
test('[EVAL-3-P] subtract(a, b) = add(a, -b) (항등식)');
```

---

## EVAL-4: 곱셈 정확성

```typescript
test('[EVAL-4-A] multiply(4, 5) = 20');
test('[EVAL-4-B] multiply(-3, -2) = 6');
test('[EVAL-4-C] multiply(a, 0) = 0 (영 곱셈)');
test('[EVAL-4-D] multiply(a, 1) = a (항등원)');
test('[EVAL-4-P] 곱셈 교환법칙: multiply(a, b) = multiply(b, a)');
```

---

## EVAL-5: 나눗셈 정확성

```typescript
test('[EVAL-5-A] divide(10, 2) = 5');
test('[EVAL-5-B] divide(-8, 4) = -2');
test('[EVAL-5-C] divide(1, 3) ≈ 0.333... (부동소수점)');
test('[EVAL-5-P] divide(a*b, b) ≈ a (역연산, b ≠ 0)');
```

---

## EVAL-6: 입력 검증

```typescript
test('[EVAL-6-A] NaN 입력 거부');
test('[EVAL-6-B] Infinity 입력 거부');
test('[EVAL-6-C] 문자열 입력 거부');
test('[EVAL-6-D] null/undefined 입력 거부');
```

---

## Eval 합격 기준 (Gate)

| Eval 그룹 | 통과 기준 | 실패 시 |
|---|---|---|
| EVAL-1 (0 나누기) | **100% 필수** | PR 자동 차단 |
| EVAL-2~5 (사칙연산) | **100% 필수** | PR 자동 차단 |
| EVAL-6 (입력 검증) | 100% 필수 | PR 자동 차단 |

**단 하나의 eval 실패도 머지를 허용하지 않는다.**

---

## Eval 결과 기록

| 버전 | EVAL-1 | EVAL-2 | EVAL-3 | EVAL-4 | EVAL-5 | EVAL-6 |
|---|---|---|---|---|---|---|
| v0.0 (초기) | - | - | - | - | - | - |

> 코드 작성 후 이 테이블을 업데이트한다.
