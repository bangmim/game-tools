import type { Game } from "./types";

export const dokkaebi: Game = {
  slug: "dokkaebi",
  name: "도깨비의 세계",
  publisher: "카카오게임즈",
  releasedAt: "2026-10-08",
  tagline:
    "카카오게임즈의 K-판타지 MMORPG. 외형 뽑기를 삭제하고 '돈 안 써도 강해진다'는 방향으로 과금을 줄인 모바일 신작.",
  couponUrl: "https://coupon.kakaogames.com/dokkaebi/ko/",
  probabilityUrl:
    "https://forum.kakaogames.com/dokkaebi/postView/?code=prob&id=9333",
  ratePresets: [0.5, 1, 3, 5],
  triesPresets: [10, 30, 50, 100],
  coupons: [
    {
      code: "도깨비1008",
      reward: "꿀떡 무기 외형",
      expiresAt: null,
      sourceUrl:
        "https://forum.kakaogames.com/dokkaebi/postView/?code=notice&id=1019",
      collectedAt: "2026-10-09",
    },
    {
      code: "애플1위풍악을울려라",
      reward: "염색 선택 상자, 엽전 111,111, 1위 기념 도술 선택 상자",
      expiresAt: null,
      sourceUrl:
        "https://forum.kakaogames.com/dokkaebi/postView/?code=notice&id=9200",
      collectedAt: "2026-10-09",
    },
    {
      code: "칭호나와라뚝딱",
      reward: "칭호, 엽전 100,000",
      expiresAt: null,
      sourceUrl:
        "https://forum.kakaogames.com/dokkaebi/postView/?code=notice&id=9112",
      collectedAt: "2026-10-09",
    },
  ],
  keywords: [
    "도깨비의 세계",
    "도깨비의 세계 쿠폰",
    "도깨비의 세계 쿠폰번호",
    "도깨비의 세계 쿠폰 코드",
    "도깨비의 세계 뽑기",
    "도깨비의 세계 뽑기 확률",
    "도깨비의 세계 확률 공시",
    "도깨비의 세계 확률 계산기",
    "도깨비의 세계 돌파 확률",
    "도깨비의 세계 천장",
    "카카오게임즈 신작",
    "슈퍼캣 MMORPG",
  ],
  scrape: {
    noticeListUrl: "https://forum.kakaogames.com/dokkaebi/postList/?code=notice",
    // 공식 공지 제목에서 쿠폰 안내로 간주할 키워드 (OR 매칭)
    titleKeywords: ["쿠폰", "코드"],
    scrapeEnabled: true,
  },
};
