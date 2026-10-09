export type Coupon = {
  code: string;
  reward: string;
  expiresAt: string | null;
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

export type Game = {
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
};
