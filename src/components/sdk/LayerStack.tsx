import { cn } from "@/lib/utils";

/*
 * Layer stack (Figma C4 139:2456), NavDhan SDK "Behind it", read from the
 * top: Your platform with NavDhan SDK inside it (on the raised ground),
 * Kubar Protocol as the one filled layer, then banks, insurers and funds.
 */
export type Layer = { name: string; line: string };

function Words({ layer, filled }: { layer: Layer; filled?: boolean }) {
  return (
    <span className="flex flex-col gap-1">
      <span className={cn("t-ui", filled ? "text-on-action" : "text-ink")}>{layer.name}</span>
      <span className={cn("t-body-sm", filled ? "text-on-action" : "text-ink-muted")}>{layer.line}</span>
    </span>
  );
}

export function LayerStack({ layers, className }: { layers: Layer[]; className?: string }) {
  const [platform, sdk, protocol, base] = layers;
  return (
    <ol className={cn("flex flex-col gap-2", className)}>
      <li className="flex flex-col gap-3 border border-rule-strong p-4">
        <Words layer={platform} />
        <span className="border border-rule-strong bg-raised p-3"><Words layer={sdk} /></span>
      </li>
      <li className="bg-action p-4"><Words layer={protocol} filled /></li>
      <li className="border border-rule-strong p-4"><Words layer={base} /></li>
    </ol>
  );
}
