/**
 * core/calculator.test.ts — calculate() 통합 테스트
 * ui/가 실제로 호출하는 진입점을 검증한다.
 */

import { calculate } from './calculator';

describe('calculate — 통합 (validation + operations)', () => {
  describe('사칙연산 기본', () => {
    it('10 + 5 = 15', () => expect(calculate('10', '+', '5')).toEqual({ ok: true, value: 15 }));
    it('10 - 3 = 7',  () => expect(calculate('10', '-', '3')).toEqual({ ok: true, value: 7 }));
    it('4 * 5 = 20',  () => expect(calculate('4',  '*', '5')).toEqual({ ok: true, value: 20 }));
    it('10 / 2 = 5',  () => expect(calculate('10', '/', '2')).toEqual({ ok: true, value: 5 }));
  });

  describe('[INV-1] 0 나누기 — 1차+2차 방어선 통합', () => {
    it('[INV-1] 10 / 0 → DIVISION_BY_ZERO', () =>
      expect(calculate('10', '/', '0')).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' }));
    it('[INV-1] 0 / 0 → DIVISION_BY_ZERO', () =>
      expect(calculate('0', '/', '0')).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' }));
    it('[INV-1] "-5" / "0" → DIVISION_BY_ZERO', () =>
      expect(calculate('-5', '/', '0')).toEqual({ ok: false, error: 'DIVISION_BY_ZERO' }));
  });

  describe('입력 검증 에러', () => {
    it('문자열 피연산자 → INVALID_INPUT', () =>
      expect(calculate('abc', '+', '5')).toEqual({ ok: false, error: 'INVALID_INPUT' }));
    it('무효 연산자 → INVALID_INPUT', () =>
      expect(calculate('10', '%', '5')).toEqual({ ok: false, error: 'INVALID_INPUT' }));
    it('null 입력 → INVALID_INPUT', () =>
      expect(calculate(null, '+', null)).toEqual({ ok: false, error: 'INVALID_INPUT' }));
  });
});
