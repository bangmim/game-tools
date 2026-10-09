export type Coupon = {
  code: string;
  reward: string;
  expiresAt: string | null;
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
};
