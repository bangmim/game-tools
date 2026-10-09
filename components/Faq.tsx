export type FaqItem = { q: string; a: string };

export function Faq({ title, items }: { title: string; items: FaqItem[] }) {
  return (
    <section className="mt-8">
      <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]/60">
        {title}
      </h2>
      <div className="divide-y divide-[var(--color-border)] overflow-hidden rounded-xl border border-[var(--color-border)] bg-white">
        {items.map((it) => (
          <details key={it.q} className="group p-4">
            <summary className="cursor-pointer list-none text-sm font-medium">
              <span className="mr-2 text-[var(--color-brand)]">Q.</span>
              {it.q}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/80">
              {it.a}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
