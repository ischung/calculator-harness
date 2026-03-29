# docs/invariants.md — 수학적 불변 규칙

> **불변 규칙(Invariant)**: 어떤 상황에서도 반드시 참이어야 하는 명제.
> 비유: 물리 법칙과 같다. 에너지 보존 법칙을 코드로 "예외 처리"할 수 없듯,
> 이 규칙들은 예외 없이 강제된다.

---

## 불변 규칙 목록

### [INV-1] 0 나누기 절대 금지 ⛔

```
∀a ∈ ℝ: divide(a, 0) → { ok: false, error: 'DIVISION_BY_ZERO' }
```

- **절대 위반 불가** (P0, 하드 블로커)
- `divide` 함수의 **첫 번째 명령어**는 `if (b === 0)` 검사여야 한다
- `try-catch`로 이 에러를 삼키는 코드는 PR이 자동 차단된다
- 테스트: `divide(1, 0)`, `divide(-5, 0)`, `divide(0, 0)` 모두 에러 반환

**왜 중요한가?**
수학에서 x/0은 정의되지 않는다(undefined). JavaScript는 `Infinity`를 반환하는데,
이는 사용자에게 잘못된 정보를 전달한다. 사용자가 "10/0 = Infinity"라고 배우면 안 된다.

---

### [INV-2] 수학적 정확성

```
add(a, b) = a + b          (덧셈 항등원: add(a, 0) = a)
subtract(a, b) = a - b     (뺄셈: subtract(a, a) = 0)
multiply(a, b) = a × b     (곱셈 항등원: multiply(a, 1) = a, multiply(a, 0) = 0)
divide(a, b) = a / b       (역수: divide(a, b) × b = a, b ≠ 0)
```

**검증 방법**: Property-Based Testing (fast-check)
```typescript
// 예시: 덧셈의 교환법칙
fc.property(fc.float(), fc.float(), (a, b) => {
  expect(add(a, b).value).toBe(add(b, a).value);
});
```

---

### [INV-3] 입력 검증 게이트

```
∀ input ∈ UserInput: input이 validation/을 통과하지 않으면 core/에 도달할 수 없다
```

- `core/` 함수는 이미 검증된 입력만 받는다고 가정한다
- `ui/` 컴포넌트가 `core/`를 직접 호출할 때 validation을 건너뛰면 린터가 차단한다

---

### [INV-4] 의존성 방향

```
types/ → validation/ → core/ → ui/  (단방향 흐름)
```

- 순환 의존(circular dependency)은 빌드 실패로 강제 차단
- 역방향 import는 린터 규칙 `no-restricted-imports`로 차단

---

### [INV-5] 결과 타입 완전성

```
∀ operation ∈ {add, subtract, multiply, divide}:
  operation(a, b) ∈ { {ok: true, value: number} | {ok: false, error: CalcError} }
```

- 함수가 `undefined`나 `null`을 반환하는 경우는 없다
- 모든 에러 경우는 `CalcError` 타입으로 명시된다

---

## 불변 규칙 검증 자동화

```bash
# 불변 규칙 전용 테스트 실행
npm test -- --grep "\[INV\]"

# CI에서 자동 실행 (PR 머지 차단)
# .github/workflows/invariants.yml 참조
```

---

## 불변 규칙 위반 기록

| 날짜 | 규칙 | 위반 내용 | 조치 |
|---|---|---|---|
| (없음) | - | - | - |

> 이 테이블은 위반 발생 시 즉시 기록한다. 투명성이 신뢰를 만든다.

---

> 평가 시나리오 → [`evals.md`](evals.md)
> 신뢰성 기준 → [`../RELIABILITY.md`](../RELIABILITY.md)
