import { ButtonLink } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

/*
 * Questions (Figma C4 93:384): each question a credit committee asks (an
 * h3, Sans/UI large, four columns) with its answer beside it (Body, six
 * columns). Answers are always shown, never folded. Below desktop they stack.
 *
 * Next step (Figma C4 91:354): the last section before the footer: the
 * heading, a line in muted Body large, the filled button and "Or email".
 */
export function Questions({ items, className }: { items: { q: string; a: string }[]; className?: string }) {
  return (
    <div className={cn("flex flex-col border-t-2 border-rule-strong lg:max-w-[1062px]", className)}>
      {items.map((item, i) => (
        <div
          key={item.q}
          className={cn(
            "flex flex-col gap-2 py-6 lg:flex-row lg:items-baseline lg:gap-6",
            i === items.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule",
          )}
        >
          <h3 className="t-ui-lg text-ink lg:w-[410px] lg:shrink-0">{item.q}</h3>
          <p className="t-body text-ink lg:max-w-[628px]">{item.a}</p>
        </div>
      ))}
    </div>
  );
}

type NextStepProps = {
  id?: string;
  heading: string;
  body?: string;
  button: { label: string; href: string };
  email?: { lead: string; address: string };
};

export function NextStep({ id, heading, body, button, email }: NextStepProps) {
  return (
    <div className="flex flex-col gap-6 lg:max-w-[1063px]">
      <h2 id={id} className="t-h2 text-ink">{heading}</h2>
      {body ? <p className="t-body-lg text-ink-muted lg:max-w-[628px]">{body}</p> : null}
      <div className="flex flex-col items-start gap-6 pt-2 lg:flex-row lg:items-center lg:gap-8">
        <ButtonLink href={button.href} icon="arrow-right">
          {button.label}
        </ButtonLink>
        {email ? (
          <p className="t-body-sm flex items-center gap-1 text-ink-muted">
            {email.lead}
            <a href={`mailto:${email.address}`} className="t-ui inline-flex min-h-6 items-center text-ink underline decoration-1 [text-underline-position:from-font] hover:decoration-2">
              {email.address}
            </a>
          </p>
        ) : null}
      </div>
    </div>
  );
}
