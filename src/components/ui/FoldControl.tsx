import { Icon } from "@/components/icons/Icon";
import { cx as cn } from "@/lib/cx";

/** The control under a folded list: underlined words and a plus, like "How we estimate this". */
export function FoldControl({ label, onShow, className }: { label: string; onShow: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onShow}
      className={cn("fold-control group t-ui inline-flex min-h-11 items-center gap-2 self-start text-left text-ink lg:min-h-10", className)}
    >
      <span className="underline decoration-1 [text-underline-position:from-font] group-hover:decoration-2">{label}</span>
      <Icon name="plus" className="shrink-0" />
    </button>
  );
}
