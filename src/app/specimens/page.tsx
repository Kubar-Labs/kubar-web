import type { Metadata } from "next";
import { KubarLockup, KubarMark } from "@/components/brand/KubarMark";
import { Icon, type IconName } from "@/components/icons/Icon";
import { Ledger } from "@/components/registers/Ledger";
import { FinanceProgrammes, TechnologyProgrammes } from "@/components/registers/Programmes";
import { Record } from "@/components/registers/Record";
import { RouteRows, type Route } from "@/components/registers/RouteRows";
import { Standing } from "@/components/registers/Standing";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Footnote, FootnoteMarker } from "@/components/ui/Footnote";
import { Illustrative } from "@/components/ui/Illustrative";
import { TextLink } from "@/components/ui/TextLink";
import { getTranslations } from "next-intl/server";

/*
 * Type and colour specimens for the step 1 review (HANDOFF section 12).
 * A working page, not part of the site: noindex, not in the sitemap, and
 * deleted in build step 7. Sample lines are taken from docs/rebuild/copy.
 */
export const metadata: Metadata = {
  title: "Specimens · Kubar Labs",
  robots: { index: false, follow: false },
};

const typeStyles = [
  ["t-display", "Display", "Newsreader 400 · 56/60 · 48/52 · 46/50 · −0.02em", "Building the institutional exchange for cross-border trade finance."],
  ["t-h2", "H2", "Schibsted 500 · 44/50 · 36/42 · 30/36 · −0.01em", "The missing piece isn’t capital."],
  ["t-h3", "H3", "Schibsted 500 · 28/34 · 26/32 · 24/30 · −0.005em", "Who takes part, and what each one does."],
  ["t-h4", "H4", "Schibsted 500 · 22/28 · 20/26 · 19/25", "Advisers"],
  ["t-line", "Line", "Newsreader 400 · 48/58 · 36/44 · 28/36", "Kubar is in the data path of every step and in the money path of none."],
  ["t-lead", "Lead", "Schibsted 400 · 30/40 · 26/36 · 22/30", "Underwrite once. Buy every receivable that fits."],
  ["t-figure", "Figure", "Geist Mono 400 · 56/60 · 46/50 · 36/40 · tabular", "About $80bn"],
  ["t-record", "Record", "Newsreader 400 · 19/27 · 18/26 · 17/25", "$225,000 rice invoice to a buyer in the UAE, due 75 days after shipment. 90% of face paid at purchase; the balance, less the financier’s discount and charges, when the buyer pays."],
  ["t-body-lg", "BodyL", "Schibsted 400 · 20/30 · 19/29 · 18/28", "Exporters’ paper doesn’t arrive originated, insured and documented in a form a financier can buy again and again. Kubar builds that layer."],
  ["t-body", "Body", "Schibsted 400 · 17/26 · 17/26 · 16/25", "Package delivered; purchase recorded"],
  ["t-body-sm", "BodyS", "Schibsted 400 · 15/22", "The insurer, in the financier’s name"],
  ["t-fine", "Fine", "Schibsted 400 · 13/20", "Programme names and logos belong to their owners."],
  ["t-ui-lg", "UIL", "Schibsted 500 · 18/24 · 18/24 · 17/24", "For financial institutions"],
  ["t-ui", "UI", "Schibsted 500 · 15/20", "Commercial invoice"],
  ["t-ui-sm", "UIS", "Schibsted 500 · 13/18", "Eligibility check"],
  ["t-label", "Label", "Geist Mono 400 · 13/20", "05 of 08"],
  ["t-tag", "Tag", "Geist Mono 500 · 11/16", "Record RCV-0001"],
  ["t-code", "Code", "Geist Mono 400 · 13/20 · +0.02em", "01"],
  ["t-state", "State", "Geist Mono 500 · 13/20 · +0.06em · caps", "Filed"],
] as const;

const tokens = [
  ["--color-page", "Page"],
  ["--color-inset", "Inset"],
  ["--color-raised", "Raised"],
  ["--color-ink", "Ink"],
  ["--color-ink-muted", "Ink muted"],
  ["--color-accent", "Accent (rani)"],
  ["--color-rule", "Rule"],
  ["--color-rule-strong", "Rule strong"],
  ["--color-rule-control", "Rule control"],
  ["--color-action", "Action"],
  ["--color-action-hover", "Action hover"],
  ["--color-focus", "Focus"],
  ["--color-faint", "Faint (never text)"],
  ["--color-mark", "Mark"],
] as const;

/** Text pairings with their WCAG contrast ratio, computed from tokens.css. */
const paper = { page: "#F7F7F5", inset: "#ECECE8", raised: "#FFFFFF", ink: "#022732", muted: "#4E686F", accent: "#AD2468" };
const petrol = { page: "#022732", inset: "#011B23", raised: "#163842", ink: "#F7F7F5", muted: "#A6B3B7", accent: "#F496BA" };

function luminance(hex: string) {
  const [r, g, b] = [1, 3, 5].map((i) => {
    const c = parseInt(hex.slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}
function contrast(a: string, b: string) {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi + 0.05) / (lo + 0.05)).toFixed(2);
}

const icons: IconName[] = ["arrow-right", "arrow-up-right", "arrow-down", "plus", "minus", "check", "close", "alert", "chevron-down"];

function SpecimenHead({ children }: { children: React.ReactNode }) {
  return <h2 className="t-h3 pb-6 text-ink">{children}</h2>;
}

function Pairings({ mode, set }: { mode: string; set: typeof paper }) {
  const grounds = [["page", set.page], ["inset", set.inset], ["raised", set.raised]] as const;
  const inks = [["ink", set.ink], ["ink muted", set.muted], ["accent", set.accent]] as const;
  return (
    <table className="w-full border-collapse text-left">
      <caption className="t-tag pb-2 text-left text-ink-muted">{mode}: contrast of each text colour on each ground (AA needs 4.5)</caption>
      <thead>
        <tr className="border-b-2 border-rule-strong">
          <th className="t-tag py-2 text-ink-muted">Text</th>
          {grounds.map(([name]) => (
            <th key={name} className="t-tag py-2 text-ink-muted">on {name}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {inks.map(([name, fg]) => (
          <tr key={name} className="border-b border-rule">
            <th scope="row" className="t-ui py-2 text-ink">{name}</th>
            {grounds.map(([g, bg]) => (
              <td key={g} className="t-code py-2 text-ink">{contrast(fg, bg)}:1</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function Specimens() {
  const home = await getTranslations("home");
  const footnotes = await getTranslations("footnotes");
  const routes = home.raw("routes") as Route[];
  return (
    <div className="page-container flex flex-col gap-(--section-space) pt-8 pb-(--section-space) lg:pt-16">
      <div className="flex flex-col gap-4">
        <h1 className="t-display text-ink">Type and colour specimens</h1>
        <p className="t-body-lg measure text-ink-muted">
          Build step 1 review. A working page, not part of the site: it isn’t indexed and is deleted before launch.
          Resize the window to see the desktop (≥ 1200), tablet (768–1199) and mobile sizes.
        </p>
      </div>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Type, at this width</SpecimenHead>
        <ul>
          {typeStyles.map(([cls, name, spec, sample]) => (
            <li key={name} className="flex flex-col gap-2 border-b border-rule py-5 lg:grid lg:grid-cols-[400px_1fr] lg:gap-6">
              <div className="flex flex-col gap-1">
                <span className="t-ui text-ink">{name}</span>
                <span className="t-code text-ink-muted">{spec}</span>
              </div>
              <p className={`${cls} text-ink`}>{sample}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Colour</SpecimenHead>
        <div className="flex flex-col gap-10 lg:grid lg:grid-cols-2 lg:gap-6">
          {(["paper", "petrol"] as const).map((mode) => (
            <div key={mode} data-ground={mode === "petrol" ? "petrol" : undefined} className="flex flex-col gap-6 bg-page p-6 text-ink">
              <p className="t-ui-lg">{mode === "paper" ? "Paper mode (every page)" : "Petrol mode (the band only)"}</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-3 md:grid-cols-3">
                {tokens.map(([token, name]) => (
                  <li key={token} className="flex items-center gap-3">
                    <span aria-hidden="true" className="size-8 shrink-0 border border-rule" style={{ background: `var(${token})` }} />
                    <span className="flex flex-col">
                      <span className="t-ui-sm">{name}</span>
                      <span className="t-code text-ink-muted">{token.replace("--color-", "")}</span>
                    </span>
                  </li>
                ))}
              </ul>
              <Pairings mode={mode === "paper" ? "Paper" : "Petrol"} set={mode === "paper" ? paper : petrol} />
            </div>
          ))}
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Rules and paths</SpecimenHead>
        <ul className="flex flex-col gap-6 lg:max-w-[845px]">
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Hairline · 1 px · rule (between rows)</span><span className="h-px bg-rule" /></li>
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Strong · 2 px · rule-strong (opens and closes a register)</span><span className="h-0.5 bg-rule-strong" /></li>
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Section hairline · 1 px · rule-strong</span><span className="h-px bg-rule-strong" /></li>
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Double rule · header</span><span className="h-[5px] border-y border-rule-strong" /></li>
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Data path · 1.5 px dashed · ink muted</span><span className="border-t-[1.5px] border-dashed border-ink-muted" /></li>
          <li className="flex flex-col gap-2"><span className="t-label text-ink-muted">Money path · 2 px solid · ink</span><span className="h-0.5 bg-ink" /></li>
        </ul>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Controls, links and icons</SpecimenHead>
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-6">
            <ButtonLink href="/contact">Talk to us</ButtonLink>
            <ButtonLink href="/contact" size={44}>Talk to us</ButtonLink>
            <span className="t-ui inline-flex h-12 items-center bg-action px-5 text-on-action outline-2 outline-offset-2 outline-focus">Focus ring</span>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-3">
            <TextLink href="/how-it-works" kind="arrow" size="large">See how it works</TextLink>
            <TextLink href="#main-content" kind="anchor">Follow one receivable</TextLink>
            <TextLink href="https://www.linkedin.com/company/kubarlabs/" kind="external" label="Kubar Labs on LinkedIn (opens in a new tab)">LinkedIn</TextLink>
            <TextLink href="/legal/privacy">Privacy notice</TextLink>
          </div>
          <ul className="flex flex-wrap gap-8">
            {icons.map((name) => (
              <li key={name} className="flex flex-col items-start gap-2 text-ink">
                <Icon name={name} size={40} />
                <Icon name={name} />
                <span className="t-code text-ink-muted">{name}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Buttons: states (step 2)</SpecimenHead>
        <div className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-4">
            <Button>Send message</Button>
            <Button className="bg-action-hover">Hover</Button>
            <Button className="bg-action-pressed">Pressed</Button>
            <Button className="outline-2 outline-offset-2 outline-focus">Focus</Button>
            <Button sending>Send message</Button>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Button variant="outline">Outline</Button>
            <Button variant="outline" size={44}>Outline 44</Button>
            <ButtonLink href="/how-it-works" icon="arrow-right">See how it works</ButtonLink>
          </div>
          <div data-ground="petrol" className="flex flex-wrap items-center gap-6 p-8">
            <ButtonLink href="/contact">Talk to us</ButtonLink>
            <TextLink href="/how-it-works" kind="arrow" size="large">See how it works</TextLink>
          </div>
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Footnotes and Illustrative (step 2)</SpecimenHead>
        <div className="flex flex-col gap-8 lg:max-w-[628px]">
          <p className="t-display text-ink">
            Building the institutional exchange
            <FootnoteMarker n={1} target="fn-specimen-1" refId="fnref-specimen-1" /> for cross-border trade finance.
          </p>
          <Footnote n={1} id="fn-specimen-1" backTo="fnref-specimen-1">
            {footnotes("status")}
          </Footnote>
          <div className="flex items-start justify-between border-t-2 border-rule-strong pt-3">
            <span className="t-tag text-ink">Record RCV-0001</span>
            <Illustrative />
          </div>
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Route rows and the record (step 2)</SpecimenHead>
        <div className="flex flex-col gap-12 lg:flex-row lg:gap-20">
          <div className="lg:w-[600px] lg:shrink-0">
            <RouteRows routes={routes} />
          </div>
          <Record className="min-w-0 flex-1" />
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>The eight-state ledger (step 2)</SpecimenHead>
        <Ledger footnote={{ target: "fn-specimen-ledger", refId: "fnref-specimen-ledger" }} />
        <Footnote n={1} id="fn-specimen-ledger" backTo="fnref-specimen-ledger" className="mt-8 lg:max-w-[628px]">
          {footnotes("status")}
        </Footnote>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Standing and programmes (step 2)</SpecimenHead>
        <div className="flex flex-col gap-16">
          <div className="lg:ml-auto lg:w-[800px]">
            <Standing />
          </div>
          <FinanceProgrammes />
          <TechnologyProgrammes />
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Mark and lock-up</SpecimenHead>
        <div className="flex flex-col gap-6 lg:grid lg:grid-cols-2">
          <div className="flex flex-wrap items-end gap-8 bg-page p-8 text-mark outline outline-rule">
            <KubarLockup height={28} />
            <KubarLockup height={24} />
            <KubarMark height={24} />
            <KubarMark height={20} />
          </div>
          <div data-ground="petrol" className="flex flex-wrap items-end gap-8 p-8 text-mark">
            <KubarLockup height={28} />
            <KubarLockup height={24} />
            <KubarMark height={24} />
            <KubarMark height={20} />
          </div>
        </div>
      </section>

      <section className="border-t border-rule-strong pt-(--section-space)">
        <SpecimenHead>Grid at this width</SpecimenHead>
        <div className="page-grid h-24" aria-hidden="true">
          {Array.from({ length: 12 }, (_, i) => (
            <span key={i} className="bg-inset outline outline-rule max-lg:nth-[n+9]:hidden max-md:nth-[n+5]:hidden" />
          ))}
        </div>
      </section>
    </div>
  );
}
