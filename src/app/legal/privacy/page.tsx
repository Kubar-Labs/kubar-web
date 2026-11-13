import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import { createPageMetadata } from "@/app/page-metadata";
import { LegalPage, type LegalCopy } from "@/components/legal/LegalPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal.privacy.meta");
  return createPageMetadata({ title: t("title"), description: t("description"), path: "/legal/privacy" });
}

export default function Page() {
  const t = useTranslations("legal");
  return <LegalPage copy={t.raw("privacy") as LegalCopy} />;
}
