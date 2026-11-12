"use client";

import { useTranslations } from "next-intl";
import { SystemPage } from "@/components/system/SystemPage";

/*
 * Error boundary for every route under the root layout, so the header and
 * footer stay. The design has no retry control; the line asks the reader to
 * try again in a moment. A render failure on the server returns HTTP 500.
 */
export default function Error() {
  const t = useTranslations("system.error");
  return (
    <>
      <title>{t("title")}</title>
      <SystemPage kind="error" />
    </>
  );
}
