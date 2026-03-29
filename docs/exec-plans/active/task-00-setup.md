# TASK-00: 하네스 초기화 — 폴더 구조 + 4대 기둥 문서

```
상태: ✅ 완료
담당: 하네스 에이전트
완료일: 2026-03-29
```

---

## 목표

사칙연산 플랫폼의 **하네스(Harness)** 를 초기화한다.
OpenAI 하네스 엔지니어링 원칙에 따라, AI 에이전트가 올바르게 작동할 수 있는
**컨텍스트, 제약, 피드백 루프 환경**을 구축한다.

---

## 완료 기준 (Definition of Done)

- [x] 폴더 구조 생성 (`types/`, `validation/`, `core/`, `ui/`, `docs/` 하위 전체)
- [x] `CLAUDE.md` — 에이전트 목차 및 핵심 지침
- [x] `AGENTS.md` — AI 에이전트 운영 규칙
- [x] `ARCHITECTURE.md` — 의존성 방향 및 레이어 아키텍처
- [x] `PRODUCT_SENSE.md` — 제품 요구사항 및 사용자 스토리
- [x] `DESIGN.md` — UX/UI 표준
- [x] `docs/invariants.md` — 수학적 불변 규칙 (INV-1 ~ INV-5)
- [x] `docs/evals.md` — 수학적 정확성 평가 시나리오
- [x] `RELIABILITY.md` — 신뢰성 및 안전 기준
- [x] `PLANS.md` — 상태 기반 로드맵
- [x] `docs/exec-plans/active/task-00-setup.md` — 이 문서

---

## 하네스 설계 근거

### OpenAI 하네스 엔지니어링에서 가져온 원칙

| 원칙 | 구현 방식 |
|---|---|
| **컨텍스트 엔지니어링** | `CLAUDE.md`를 목차로, `docs/`를 진실의 원천으로 분리 |
| **아키텍처 제약** | `types → validation → core → ui` 의존성 방향 강제 |
| **엔트로피 관리** | `AGENTS.md`에 백그라운드 에이전트 스캔 규칙 정의 |
| **피드백 루프** | `docs/evals.md`에 자동 검증 시나리오, CI 게이트 정의 |

### 4대 기둥 문서 구조

```
하네스
├── [기둥1: 컨텍스트]  CLAUDE.md + AGENTS.md + ARCHITECTURE.md
├── [기둥2: 제품/디자인] PRODUCT_SENSE.md + DESIGN.md
├── [기둥3: 신뢰/안전]  docs/invariants.md + docs/evals.md + RELIABILITY.md
└── [기둥4: 계획]       PLANS.md + docs/exec-plans/
```

---

## 핵심 결정 사항

### 결정 1: `[INV-1]` 0 나누기를 최우선 불변 규칙으로 지정

수학적으로 x/0은 정의되지 않는다. JavaScript가 `Infinity`를 반환하는 기본 동작은
교육 목적으로 오해를 유발한다. **모든 나눗셈 연산에서 첫 번째 체크**로 강제한다.

### 결정 2: `throw` 대신 `Result` 타입 패턴 사용

```typescript
// ❌ 이렇게 하지 않는다
function divide(a, b) {
  if (b === 0) throw new Error("Division by zero");
  return a / b;
}

// ✅ 이렇게 한다
function divide(a, b): CalculationResult {
  if (b === 0) return { ok: false, error: 'DIVISION_BY_ZERO' };
  return { ok: true, value: a / b };
}
```

**이유**: 타입 시스템이 에러 처리를 강제한다. 에러를 무시하면 컴파일 에러가 발생한다.

### 결정 3: Property-Based Testing 사용

단순 예제 테스트보다 수학적 법칙(교환법칙, 결합법칙, 항등원)을 검증하는
Property-Based Testing이 더 많은 버그를 잡는다.

---

## 다음 단계 (TASK-01)

이 문서 완료 후 다음 작업:
1. `types/index.ts` — `OperandType`, `OperatorType`, `CalculationResult`, `CalcError` 정의
2. `PLANS.md`에서 TASK-01 상태를 `🔄 진행중`으로 업데이트

---

> 전체 로드맵 → [`../../PLANS.md`](../../PLANS.md)
> 불변 규칙 → [`../invariants.md`](../invariants.md)
