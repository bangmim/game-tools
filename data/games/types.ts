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
  couponUrl: string | null;
  ratePresets: number[];
  triesPresets: number[];
  coupons: Coupon[];
};
