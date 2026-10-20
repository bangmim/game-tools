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
  /** Independent-draw expectation only, excluding pity guarantees. */
  expected: number;
  costForTarget?: (target: number) => number;
};

export function gacha({ ratePercent, tries, pity, costPerTry }: GachaInput): GachaResult {
  const finite = (value: number, fallback = 0) => Number.isFinite(value) ? value : fallback;
  const p = Math.min(100, Math.max(0, finite(ratePercent))) / 100;
  const n = Math.floor(Math.max(0, finite(tries)));
  const effectivePity = pity !== undefined && Number.isFinite(pity) && pity >= 1
    ? Math.floor(pity) : Infinity;
  const noneRaw = p === 1 ? (n === 0 ? 1 : 0) : Math.exp(n * Math.log1p(-p));
  const atLeastOne = n >= effectivePity ? 1 : 1 - noneRaw;
  const none = n >= effectivePity ? 0 : noneRaw;

  const needForTarget = (target: number): number => {
    const t = Math.min(1, Math.max(0, finite(target)));
    if (t === 0) return 0;
    if (p === 1) return 1;
    if (p === 0 || t === 1) return effectivePity;
    const need = Math.ceil(Math.log1p(-t) / Math.log1p(-p));
    return Math.min(need, effectivePity);
  };
  // Independent-draw expectation only; does not assume a pity reset mechanism.
  const expected = p * n;
  const costForTarget = costPerTry !== undefined && Number.isFinite(costPerTry) && costPerTry >= 0
    ? (target: number) => costPerTry === 0 ? 0 : needForTarget(target) * costPerTry
    : undefined;
  return { atLeastOne, none, needForTarget, expected, costForTarget };
}
