# TASK-UI: UI 재설계 — DESIGN.md 완전 준수

```
상태: 🔄 진행중
근거 문서: DESIGN.md, PRODUCT_SENSE.md
영향 불변 규칙: [INV-4] 의존성 방향, [INV-5] throw 금지
```

## 발견된 위반 (DESIGN.md 대비)

1. 컴포넌트 구조가 DESIGN.md 명세와 다름
   - 명세: `Display.tsx`, `Keypad.tsx`, `HistoryPanel.tsx` 분리
   - 현실: `App.tsx` 단일 파일
2. 에러 색상: 명세 `#D32F2F` → 실제 `#ff6b6b`
3. 에러 아이콘 `⚠️` 누락
4. 에러 표시 위치: 값 대체 → 값 아래 별도 영역으로 이동

## 완료 기준

- [ ] `ui/Display.tsx` — 표현식 + 값 + 에러 메시지 분리 표시
- [ ] `ui/Keypad.tsx` — 버튼 그리드
- [ ] `ui/HistoryPanel.tsx` — 히스토리 패널
- [ ] `ui/App.tsx` — 상태 관리만 담당 (orchestrator)
- [ ] 에러 색상 `#D32F2F`, `⚠️` 아이콘 포함
- [ ] 에러 메시지는 값 아래 별도 영역 (값은 유지)
- [ ] 92개 기존 테스트 전원 통과
- [ ] `harness-loop.sh` 4개 게이트 통과
