# TASK-05: GitHub Pages 자동 배포 파이프라인

- 상태: 🔄 진행중
- 목표: 하네스 검증(Lint + Evals)을 통과한 코드만 GitHub Pages에 자동 배포한다
- 완료 기준:
  - [x] `.github/workflows/deploy.yml` 생성
  - [x] `vite.config.ts`에 GitHub Pages 전용 `base` 경로 설정
  - [x] `lint` Job → `evals` Job → `deploy` Job 종속성 체인 구성
  - [x] `deploy` Job이 `main` 브랜치 push 시에만 실행
  - [x] `PLANS.md` 마일스톤 Deployed 상태 업데이트
  - [ ] GitHub Repository Settings에서 Pages 소스를 `gh-pages` 브랜치로 설정 (수동)
- 영향 받는 불변 규칙: [INV-1], [INV-2], [INV-3], [INV-4]
- 예상 파일 변경:
  - `.github/workflows/deploy.yml` (신규)
  - `vite.config.ts` (base 경로 추가)
  - `PLANS.md` (마일스톤 업데이트)

---

## 설계 결정 (ADR)

### 왜 3개 Job으로 분리하는가?

```
[lint] ──┐
         ├── needs → [deploy]
[evals] ─┘
```

비유: 비행기 이륙 전 **엔진 점검(lint)**과 **연료 확인(evals)**을 각각 독립적으로 병렬 수행한다.
둘 다 OK 신호가 오면 그때 이륙(deploy)한다.
하나라도 실패하면 이륙하지 않는다.

### 왜 `needs`로 Fail-fast를 구현하는가?

RELIABILITY.md 정책: "수학적 정확성" + "안전한 실패" + "예측 가능성"이 검증되지 않은
코드를 사용자에게 노출하는 것은 신뢰성 등급 S(Critical)를 위반한다.

### GitHub Pages base 경로

GitHub Pages URL: `https://ischung.github.io/calculator-harness/`
Vite base 옵션: `/calculator-harness/` (환경변수 `GITHUB_PAGES=true` 시 적용)
