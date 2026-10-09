import type { BeginnerChecklist } from "./types";
import { dokkaebiBeginnerChecklist } from "./dokkaebi.beginner";

/**
 * 게임 슬러그 → 초반 체크리스트 데이터 매핑.
 *
 * 각 게임의 초반 데이터는 본체 파일(dokkaebi.ts 등)과 분리된 전용 파일에 둔다.
 * 쿠폰 갱신·게임 메타 수정과 작업 영역이 겹치지 않아 머지 충돌을 줄일 수 있다.
 */
const BEGINNER_DATA: Record<string, BeginnerChecklist> = {
  dokkaebi: dokkaebiBeginnerChecklist,
};

export function getBeginnerChecklist(
  slug: string,
): BeginnerChecklist | undefined {
  return BEGINNER_DATA[slug];
}

export function hasBeginnerChecklist(slug: string): boolean {
  return slug in BEGINNER_DATA;
}

export function beginnerChecklistSlugs(): string[] {
  return Object.keys(BEGINNER_DATA);
}
