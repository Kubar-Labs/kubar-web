import { cn } from "@/lib/utils";

/*
 * One register of the programme loop (Figma C4 122:1272, rebuilt 12 Nov as
 * two ruled registers): a Mono/Tag heading over a 2 px strong rule, then
 * numbered steps (number, what happens, who), hairline rows. A step can
 * carry a note on a 2 px rani rule. `close` ends it with a strong rule.
 */
export type Step = { no: string; text: string; who: string };

export function ProgrammeSteps({
  heading,
  steps,
  columns,
  note,
  close = false,
  className,
}: {
  heading: string;
  steps: Step[];
  columns: { no: string; step: string; who: string };
  note?: { after: string; text: string };
  close?: boolean;
  className?: string;
}) {
  return (
    <table className={cn("w-full border-collapse text-left", className)}>
      <caption className="t-tag border-b-2 border-rule-strong pb-3 text-left text-ink-muted">{heading}</caption>
      <thead className="sr-only">
        <tr>
          <th scope="col">{columns.no}</th>
          <th scope="col">{columns.step}</th>
          <th scope="col">{columns.who}</th>
        </tr>
      </thead>
      <tbody>
        {steps.map((step, i) => (
          <tr key={step.no} className={close && i === steps.length - 1 ? "border-b-2 border-rule-strong" : "border-b border-rule"}>
            <td className="t-code w-[34px] py-4 pr-4 align-top text-ink-muted">{step.no}</td>
            <th scope="row" className="t-body-sm py-4 pr-4 text-left align-top font-normal text-ink lg:w-[264px]">
              {step.text}
              {note && note.after === step.no ? (
                <span className="mt-2 block border-l-2 border-accent pl-3">{note.text}</span>
              ) : null}
            </th>
            <td className="t-tag w-[112px] py-4 align-top text-ink-muted lg:w-auto">{step.who}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
