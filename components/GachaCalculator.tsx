"use client";

import { useMemo, useState } from "react";
import { gacha } from "@/lib/gacha";

type Props = {
  ratePresets: number[];
  triesPresets: number[];
};

const TARGETS = [0.5, 0.9, 0.99];

function formatPercent(x: number): string {
  if (!isFinite(x)) return "∞";
  return `${(x * 100).toFixed(x < 0.01 ? 3 : 2)}%`;
}

function formatInt(x: number): string {
  if (!isFinite(x)) return "∞";
  return x.toLocaleString("ko-KR");
}

export function GachaCalculator({ ratePresets, triesPresets }: Props) {
  const [rate, setRate] = useState<number>(ratePresets[0] ?? 1);
  const [tries, setTries] = useState<number>(triesPresets[0] ?? 10);
  const [pity, setPity] = useState<number | "">("");
  const [cost, setCost] = useState<number | "">("");

  const result = useMemo(
    () =>
      gacha({
        ratePercent: rate,
        tries,
        pity: typeof pity === "number" ? pity : undefined,
        costPerTry: typeof cost === "number" ? cost : undefined,
      }),
    [rate, tries, pity, cost],
  );

  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-5">
      <h2 className="text-lg font-semibold">입력</h2>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field label="뽑기 확률 (%)">
          <input
            type="number"
            inputMode="decimal"
            step="0.01"
            min={0}
            max={100}
            value={rate}
            onChange={(e) => setRate(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none"
          />
          <Presets
            values={ratePresets}
            current={rate}
            onPick={setRate}
            suffix="%"
          />
        </Field>

        <Field label="뽑기 횟수">
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min={0}
            value={tries}
            onChange={(e) => setTries(Number(e.target.value))}
            className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none"
          />
          <Presets
            values={triesPresets}
            current={tries}
            onPick={setTries}
            suffix="회"
          />
        </Field>

        <Field label="천장 (선택, 몇 회에서 100% 보장)">
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min={0}
            value={pity}
            onChange={(e) =>
              setPity(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="예: 90"
            className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none"
          />
        </Field>

        <Field label="1회 비용 (선택)">
          <input
            type="number"
            inputMode="numeric"
            step="1"
            min={0}
            value={cost}
            onChange={(e) =>
              setCost(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="예: 160"
            className="w-full rounded-md border border-[var(--color-border)] bg-white px-3 py-2 text-sm focus:border-[var(--color-brand)] focus:outline-none"
          />
        </Field>
      </div>

      <div className="mt-6 border-t border-[var(--color-border)] pt-5">
        <h2 className="text-lg font-semibold">결과</h2>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          <Stat
            label={`${tries}회에서 1개 이상 나올 확률`}
            value={formatPercent(result.atLeastOne)}
            emphasize
          />
          <Stat
            label={`${tries}회에서 한 번도 안 나올 확률`}
            value={formatPercent(result.none)}
          />
          <Stat
            label="평균 획득 개수 (기댓값)"
            value={result.expected.toFixed(2)}
          />
          {typeof cost === "number" && cost > 0 && (
            <Stat
              label={`${tries}회 비용`}
              value={`${formatInt(tries * cost)} 재화`}
            />
          )}
        </div>

        <div className="mt-5">
          <h3 className="text-sm font-semibold text-[var(--color-ink)]/80">
            목표 확률에 도달하려면
          </h3>
          <div className="mt-2 overflow-hidden rounded-md border border-[var(--color-border)]">
            <table className="w-full text-sm">
              <thead className="bg-[var(--color-bg)] text-left">
                <tr>
                  <th className="px-3 py-2 font-medium">목표</th>
                  <th className="px-3 py-2 font-medium">필요 횟수</th>
                  {typeof cost === "number" && cost > 0 && (
                    <th className="px-3 py-2 font-medium">필요 재화</th>
                  )}
                </tr>
              </thead>
              <tbody>
                {TARGETS.map((t) => {
                  const need = result.needForTarget(t);
                  const costAt = result.costForTarget?.(t);
                  return (
                    <tr key={t} className="border-t border-[var(--color-border)]">
                      <td className="px-3 py-2">{(t * 100).toFixed(0)}%</td>
                      <td className="px-3 py-2 font-semibold text-[var(--color-brand)]">
                        {formatInt(need)}회
                      </td>
                      {typeof cost === "number" && cost > 0 && (
                        <td className="px-3 py-2">
                          {costAt !== undefined ? formatInt(costAt) : "—"}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-[var(--color-ink)]/80">
        {label}
      </span>
      {children}
    </label>
  );
}

function Presets({
  values,
  current,
  onPick,
  suffix,
}: {
  values: number[];
  current: number;
  onPick: (v: number) => void;
  suffix: string;
}) {
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {values.map((v) => {
        const active = v === current;
        return (
          <button
            key={v}
            type="button"
            onClick={() => onPick(v)}
            className={
              active
                ? "rounded border border-[var(--color-brand)] bg-[var(--color-brand)] px-2.5 py-1 text-xs font-medium text-white"
                : "rounded border border-[var(--color-border)] bg-white px-2.5 py-1 text-xs text-[var(--color-ink)] hover:border-[var(--color-brand)]"
            }
          >
            {v}
            {suffix}
          </button>
        );
      })}
    </div>
  );
}

function Stat({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-[var(--color-bg)] p-3">
      <div className="text-xs text-[var(--color-ink)]/60">{label}</div>
      <div
        className={
          emphasize
            ? "mt-1 text-2xl font-bold text-[var(--color-accent)]"
            : "mt-1 text-xl font-semibold text-[var(--color-ink)]"
        }
      >
        {value}
      </div>
    </div>
  );
}
