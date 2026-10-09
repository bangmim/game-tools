export type Coupon = {
  code: string;
  reward: string;
  expiresAt: string | null;
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
