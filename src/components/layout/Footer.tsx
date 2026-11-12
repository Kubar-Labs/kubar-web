import { useTranslations } from "next-intl";
import { KubarLockup } from "@/components/brand/KubarMark";
import { TextLink } from "@/components/ui/TextLink";

/*
 * Footer (Figma C3 88:158). Opened by a 2 px strong rule; the lock-up; four
 * groups of plain links; under a hairline, the role line (Body small, ink)
 * and the entity, marks and copyright lines (Fine, muted), up to eight
 * columns wide. Below desktop the groups sit two by two.
 */

const LINKEDIN = "https://www.linkedin.com/company/kubarlabs/";

type Group = {
  label: string;
  links: { href: string; label: string; external?: boolean; name?: string }[];
};

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const groups: Group[] = [
    {
      label: t("products"),
      links: [
        { href: "/products/kubar-protocol", label: t("kubarProtocol") },
        { href: "/products/navdhan-sdk", label: t("navdhanSdk") },
      ],
    },
    {
      label: t("company"),
      links: [
        { href: "/how-it-works", label: t("howItWorks") },
        { href: "/about", label: t("about") },
        { href: "/contact", label: t("contact") },
      ],
    },
    {
      label: t("legal"),
      links: [
        { href: "/legal/privacy", label: t("privacy") },
        { href: "/legal/terms", label: t("terms") },
      ],
    },
    {
      label: t("elsewhere"),
      links: [{ href: LINKEDIN, label: t("linkedin"), external: true, name: t("linkedinLabel") }],
    },
  ];

  return (
    <footer className="page-container pb-10 lg:pb-16">
      <div aria-hidden="true" className="h-0.5 bg-rule-strong" />
      <div className="lg:page-grid lg:py-12">
        <div className="py-8 lg:col-span-4 lg:py-0">
          <KubarLockup height={24} className="text-mark lg:hidden" />
          <KubarLockup height={28} className="hidden text-mark lg:block" />
        </div>
        <nav
          aria-label={t("navLabel")}
          className="grid grid-cols-[repeat(2,minmax(0,167px))] gap-x-4 gap-y-8 pb-8 lg:col-span-8 lg:grid-cols-4 lg:gap-x-6 lg:pb-0"
        >
          {groups.map((group) => (
            <div key={group.label} className="flex flex-col gap-1">
              <p className="t-tag pb-2 text-ink-muted">{group.label}</p>
              <ul className="flex flex-col gap-1">
                {group.links.map((link) => (
                  <li key={link.href} className="flex">
                    <TextLink
                      href={link.href}
                      kind={link.external ? "external" : "plain"}
                      label={link.name}
                    >
                      {link.label}
                    </TextLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="flex flex-col gap-3 border-t border-rule pt-6">
        <p className="t-body-sm text-ink lg:max-w-[845px]">{t("role")}</p>
        <p className="t-fine text-ink-muted lg:max-w-[845px]">{t("entity")}</p>
        <p className="t-fine text-ink-muted lg:max-w-[845px]">{t("marks")}</p>
        <p className="t-fine text-ink-muted">{t("copyright", { year })}</p>
      </div>
    </footer>
  );
}
