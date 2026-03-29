#!/usr/bin/env bash
# harness-loop.sh — 로컬 하네스 컨트롤 루프
#
# 사용법:
#   ./harness-loop.sh              # 1회 실행 (기본)
#   MAX_RETRIES=3 ./harness-loop.sh  # 최대 3회 재시도 루프
#
# 목적:
#   에이전트가 코드를 수정할 때마다 이 스크립트를 실행한다.
#   4개 게이트를 순서대로 통과해야 루프가 종료된다.
#   실패 시 정확히 어떤 게이트에서 왜 실패했는지 출력한다.

set -euo pipefail

MAX_RETRIES="${MAX_RETRIES:-1}"
ATTEMPT=0
PASS=false

# ── 색상 출력 ──────────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

gate_pass() { echo -e "  ${GREEN}✅ PASS${NC}: $1"; }
gate_fail() { echo -e "  ${RED}❌ FAIL${NC}: $1"; }
separator()  { echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"; }

run_loop() {
  ATTEMPT=$((ATTEMPT + 1))
  echo ""
  separator
  echo -e "${YELLOW}  하네스 컨트롤 루프 — 시도 ${ATTEMPT}/${MAX_RETRIES}${NC}"
  separator

  FAILED_GATES=()

  # ── Gate 1: 타입 안전성 ───────────────────────────────────
  echo ""
  echo -e "${BLUE}[Gate 1] TypeScript 타입 검사${NC}"
  if npx tsc --noEmit 2>&1; then
    gate_pass "tsc 통과"
  else
    gate_fail "tsc 실패"
    echo -e "  ${RED}→ 에이전트 지시: types/calc.ts 타입 정의를 확인하라.${NC}"
    FAILED_GATES+=("Gate1:tsc")
  fi

  # ── Gate 2: 아키텍처 제약 ─────────────────────────────────
  echo ""
  echo -e "${BLUE}[Gate 2] 아키텍처 의존성 방향 검사 (eslint)${NC}"
  if npx eslint . --ext .ts --max-warnings 0 2>&1; then
    gate_pass "eslint 통과"
  else
    gate_fail "eslint 실패"
    echo -e "  ${RED}→ 에이전트 지시:${NC}"
    echo -e "    [ARCH] 오류 → ARCHITECTURE.md 의존성 방향 확인 (types→validation→core→ui)"
    echo -e "    [INV]  오류 → throw를 { ok:false, error } 패턴으로 교체"
    FAILED_GATES+=("Gate2:eslint")
  fi

  # ── Gate 3: 불변 규칙 ────────────────────────────────────
  echo ""
  echo -e "${BLUE}[Gate 3] 불변 규칙 검증 [INV-1 ~ INV-5]${NC}"
  if npx jest --testNamePattern="\[INV\]|\[EVAL-1\]" --no-coverage 2>&1; then
    gate_pass "불변 규칙 통과"
  else
    gate_fail "불변 규칙 실패"
    echo -e "  ${RED}→ 에이전트 지시:${NC}"
    echo -e "    [INV-1] 실패 → divide()와 validateDivisor()에서 if(b===0) 확인"
    echo -e "    docs/invariants.md 참조"
    FAILED_GATES+=("Gate3:invariants")
  fi

  # ── Gate 4: 수학적 정확성 Eval ───────────────────────────
  echo ""
  echo -e "${BLUE}[Gate 4] 수학적 정확성 전체 Eval${NC}"
  if npx jest --no-coverage 2>&1; then
    gate_pass "전체 Eval 통과"
  else
    gate_fail "Eval 실패"
    echo -e "  ${RED}→ 에이전트 지시: docs/evals.md의 실패한 EVAL 시나리오 확인${NC}"
    FAILED_GATES+=("Gate4:evals")
  fi

  # ── 결과 판정 ─────────────────────────────────────────────
  echo ""
  separator
  if [ ${#FAILED_GATES[@]} -eq 0 ]; then
    echo -e "${GREEN}  🎉 컨트롤 루프 완료 — 모든 게이트 통과!${NC}"
    PASS=true
    return 0
  else
    echo -e "${RED}  실패한 게이트: ${FAILED_GATES[*]}${NC}"
    echo -e "${YELLOW}  → 위 지시를 따라 코드를 수정하고 다시 실행하라.${NC}"
    return 1
  fi
}

# ── 메인 루프 ─────────────────────────────────────────────
while [ $ATTEMPT -lt $MAX_RETRIES ]; do
  if run_loop; then
    break
  fi
  if [ $ATTEMPT -lt $MAX_RETRIES ]; then
    echo ""
    echo -e "${YELLOW}  재시도 대기 중... (코드를 수정한 후 Enter를 누르거나, Ctrl+C로 중단)${NC}"
    read -r
  fi
done

if [ "$PASS" = false ]; then
  echo ""
  echo -e "${RED}  ⚠️  최대 재시도 횟수(${MAX_RETRIES}) 초과 → 인간 엔지니어 에스컬레이션 필요${NC}"
  echo -e "  AGENTS.md의 에스컬레이션 기준을 참조하라."
  exit 1
fi
