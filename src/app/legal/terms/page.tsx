import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { LegalPage, type LegalCopy } from "@/components/legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.terms.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/legal/terms" });
}

export default function Page() {
  const t = useTranslations("legal");
  return <LegalPage copy={t.raw("terms") as LegalCopy} />;
}
