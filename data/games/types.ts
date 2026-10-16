export type Coupon = {
  code: string;
  reward: string;
  expiresAt: string | null;
  /** null 기한 중 공식 무기한 확인 여부. 미설정은 기한 미확인. */
  unlimited?: boolean;
  verifiedAt?: string;
  /** 공식 공지 URL. 분쟁 시 입증 자료. null = 아직 운영자 확인 필요. */
  sourceUrl?: string | null;
  /** 수집일 YYYY-MM-DD. null = 아직 운영자 확인 필요. */
  collectedAt?: string | null;
};

export type BeginnerSection = {
  title: string;
  items: string[];
  note?: string;
};

export type BeginnerChecklist = {
  intro: string;
  sections: BeginnerSection[];
  sources: { label: string; url: string }[];
};

/**
 * 쿠폰 자동 수집 설정. `scripts/scrape-coupons.ts`가 참조한다.
 * `scrapeEnabled: true`인 Game만 CI가 공식 공지에서 수집한다.
 */
export type ScrapeConfig = {
  /** 공식 공지 리스트 URL (SPA 포함). Playwright가 로드한다. */
  noticeListUrl: string;
  /** 공지 제목에서 "쿠폰 공지"로 간주할 키워드 (OR). */
  titleKeywords: string[];
  /** CI에서 실제로 수집할지 여부. 미구현 게임은 false. */
  scrapeEnabled: boolean;
};

export type Game = {
  /** 공식 콘텐츠 준비 전에는 검색 색인에서 제외한다. */
  indexable: boolean;
  slug: string;
  name: string;
  publisher: string;
  releasedAt: string;
  tagline: string | null;
  couponUrl: string | null;
  probabilityUrl: string | null;
  ratePresets: number[];
  triesPresets: number[];
  coupons: Coupon[];
  keywords: string[];
  beginnerChecklist?: BeginnerChecklist;
  scrape?: ScrapeConfig;
};
