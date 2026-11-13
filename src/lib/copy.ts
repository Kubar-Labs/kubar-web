/*
 * Reads a block of copy handed to a client component as a prop, with the
 * same calls as next-intl's `t` ("a.b" keys, {name} values, t.raw), so the
 * browser doesn't need the message formatter.
 */
export function reader(copy: unknown) {
  const raw = (key: string): unknown =>
    key.split(".").reduce<unknown>((value, part) => (value as Record<string, unknown> | undefined)?.[part], copy);
  const t = (key: string, values?: Record<string, string>) => {
    let text = String(raw(key) ?? key);
    for (const [name, value] of Object.entries(values ?? {})) text = text.replaceAll(`{${name}}`, value);
    return text;
  };
  t.raw = raw;
  return t;
}
