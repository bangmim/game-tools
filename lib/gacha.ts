export type GachaInput = {
  ratePercent: number;
  tries: number;
  pity?: number;
  costPerTry?: number;
};

export type GachaResult = {
  atLeastOne: number;
  none: number;
  needForTarget: (target: number) => number;
  expected: number;
  costForTarget?: (target: number) => number;
};

export function gacha({ ratePercent, tries, pity, costPerTry }: GachaInput): GachaResult {
  const p = ratePercent / 100;
  const n = Math.max(0, tries);

  const effectivePity = pity && pity > 0 ? pity : Infinity;

  const noneRaw = Math.pow(1 - p, n);
  const atLeastOne = n >= effectivePity ? 1 : 1 - noneRaw;
  const none = n >= effectivePity ? 0 : noneRaw;

  const needForTarget = (target: number): number => {
    const t = Math.min(Math.max(target, 0), 0.999999);
    if (p <= 0) return Infinity;
    const need = Math.ceil(Math.log(1 - t) / Math.log(1 - p));
    return Math.min(need, effectivePity === Infinity ? need : effectivePity);
  };

  const expected = p * n;

  const costForTarget = costPerTry
    ? (target: number) => needForTarget(target) * costPerTry
    : undefined;

  return { atLeastOne, none, needForTarget, expected, costForTarget };
}
