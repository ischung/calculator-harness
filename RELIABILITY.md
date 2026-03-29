# RELIABILITY.md — 신뢰성 및 안전 기준

> **신뢰성(Reliability)**: 시스템이 의도한 대로 동작한다는 확신.
> 사칙연산 플랫폼의 신뢰성 = "1+1이 항상 2이다"라고 사용자가 믿을 수 있는 것.

---

## 신뢰성 철학

하네스 엔지니어링 관점에서 신뢰성은 세 가지로 구성된다:

1. **수학적 정확성**: 계산 결과가 수학적으로 옳다
2. **안전한 실패**: 잘못된 입력에 대해 시스템이 안전하게 실패한다 (crash 없음)
3. **예측 가능성**: 같은 입력은 항상 같은 출력을 낸다 (순수 함수)

---

## 안전성 경계 (Safety Boundaries)

### 1. 입력 경계

```
허용 범위: Number.MIN_SAFE_INTEGER (-9007199254740991)
           ~ Number.MAX_SAFE_INTEGER (9007199254740991)

금지 값: NaN, ±Infinity, null, undefined, 비숫자 문자열
```

### 2. 연산 경계

```
나눗셈: 분모 ≠ 0  (HARD RULE: [INV-1])
결과값: isFinite(result) = true
        !isNaN(result) = true
```

### 3. 출력 경계

```
항상 CalculationResult 타입 반환
절대 throw하지 않음 (Result 패턴 사용)
절대 undefined/null 반환하지 않음
```

---

## 신뢰성 등급

| 기능 | 등급 | 의미 |
|---|---|---|
| 0 나누기 방어 | **S (Critical)** | 절대 실패 불가 |
| 기본 사칙연산 정확성 | **A (Essential)** | 100% 정확해야 함 |
| 입력 검증 | **A (Essential)** | 모든 경계값 처리 |
| 에러 메시지 | **B (Important)** | 사용자 친화적 |
| 히스토리 | **C (Nice)** | 없어도 됨 |

---

## 장애 대응 계획 (Failure Modes)

| 장애 시나리오 | 예상 동작 | 허용 여부 |
|---|---|---|
| `divide(5, 0)` 호출 | `DIVISION_BY_ZERO` 에러 반환 | 허용 (정상) |
| `add("abc", 1)` 호출 | `INVALID_INPUT` 에러 반환 | 허용 (정상) |
| `add(MAX_SAFE_INT, 1)` | `OVERFLOW` 에러 반환 | 허용 (정상) |
| 어떤 함수도 `throw` | **절대 금지** | **불허** |
| 어떤 함수도 `Infinity` 반환 | **절대 금지** | **불허** |
| 어떤 함수도 `NaN` 반환 | **절대 금지** | **불허** |

---

## 자동화된 신뢰성 검증

```yaml
# .github/workflows/reliability.yml 개요
on: [push, pull_request]
jobs:
  reliability:
    steps:
      - name: 불변 규칙 검증 (INV-1 ~ INV-5)
        run: npm test -- --grep "\[INV\]"

      - name: 수학적 정확성 Eval (EVAL-1 ~ EVAL-6)
        run: npm test -- --grep "\[EVAL\]"

      - name: Property-Based Testing (수학 법칙)
        run: npm test -- --grep "\[PROP\]"

      - name: 타입 안전성
        run: npm run typecheck
```

**모든 단계가 GREEN이어야 PR 머지 가능.**

---

## 신뢰성 지표 대시보드

| 지표 | 현재 | 목표 |
|---|---|---|
| EVAL 통과율 | - | 100% |
| 불변 규칙 위반 건수 (누적) | 0 | 0 유지 |
| 0 나누기 방어 성공률 | - | 100% |
| Property-Based Test 케이스 수 | - | ≥ 1000 (fast-check 자동) |

---

> 불변 규칙 상세 → [`docs/invariants.md`](docs/invariants.md)
> 평가 시나리오 → [`docs/evals.md`](docs/evals.md)
> 아키텍처 → [`ARCHITECTURE.md`](ARCHITECTURE.md)
