# CLAUDE.md — 사칙연산 플랫폼 하네스 가이드

> **이 파일은 AI 에이전트의 "목차(table of contents)"다.**
> 백과사전이 아니다. 깊은 진실은 `docs/` 디렉토리에 있다.

---

## 프로젝트 개요

**사칙연산 플랫폼(Calculator Harness)**은 수학적으로 무결한 덧셈·뺄셈·곱셈·나눗셈을 제공하는 교육용 플랫폼이다.
단순한 계산기가 아니라, **하네스 엔지니어링 원칙**을 학습하는 레퍼런스 구현체다.

---

## 핵심 불변 규칙 (절대 위반 금지)

```
[INV-1] 0으로 나누기는 반드시 차단한다. 예외 없음.
[INV-2] 계산 결과는 IEEE 754 부동소수점 오차 범위 내에서 수학적으로 정확해야 한다.
[INV-3] 사용자 입력은 반드시 validation/ 레이어를 통과해야 한다.
[INV-4] UI 컴포넌트는 core/ 로직을 직접 호출하지 않는다. (의존성 방향 강제)
```

> 상세 불변 규칙 → [`docs/invariants.md`](docs/invariants.md)

---

## 의존성 방향 (Architecture Constraint)

```
types/ → validation/ → core/ → ui/
   ↑           ↑          ↑       ↑
 공유 타입   입력 검증   계산 로직  표현 레이어
```

**역방향 의존성은 린터가 자동 차단한다.**

---

## 폴더 구조 한눈에 보기

| 폴더/파일 | 역할 |
|---|---|
| `types/` | 공유 타입 정의 (OperandType, OperatorType, CalculationResult) |
| `validation/` | 입력 검증 (0 나누기 방어, 숫자 범위 검증) |
| `core/` | 순수 계산 함수 (add, subtract, multiply, divide) |
| `ui/` | 사용자 인터페이스 컴포넌트 |
| `docs/product/` | 제품 요구사항, 사용자 스토리 |
| `docs/design/` | UX/UI 설계 명세 |
| `docs/evals/` | 정확성 검증 테스트 시나리오 |
| `docs/exec-plans/` | 실행 계획 (active/completed) |

---

## 빌드 및 실행

```bash
# 테스트 실행 (필수: 모든 불변 규칙 검증 포함)
npm test

# 린터 실행 (의존성 방향 강제)
npm run lint

# 타입 검사
npm run typecheck
```

---

## 에이전트 작업 지침

1. **코드 작성 전**: `ARCHITECTURE.md`를 먼저 읽어 의존성 방향을 확인하라.
2. **계산 로직 변경 시**: `docs/invariants.md`의 모든 불변 규칙을 재검증하라.
3. **UI 변경 시**: `DESIGN.md`의 UX 표준을 따르라.
4. **새 기능 추가 시**: `PLANS.md`에 exec-plan을 먼저 작성하라.

> 상세 에이전트 지침 → [`AGENTS.md`](AGENTS.md)

---

## 핵심 원칙

> "모델은 상품이다. 하네스는 우리의 경쟁력이다." — OpenAI Harness Engineering
