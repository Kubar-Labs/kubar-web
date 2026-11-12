import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SystemPage } from "@/components/system/SystemPage";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("system.notFound");
  return { title: t("title"), robots: { index: false, follow: true } };
}

export default function NotFound() {
  return <SystemPage kind="notFound" />;
}
