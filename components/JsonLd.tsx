function serializeForScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/-->/g, "--\\u003e");
}

export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeForScript(data) }}
    />
  );
}
