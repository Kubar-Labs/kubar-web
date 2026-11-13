import { useTranslations } from "next-intl";
import { IllustrativeToggle } from "@/components/ui/IllustrativeToggle";

/** Illustrative with its words read on the server; the toggle itself is the client part. */
export function Illustrative({ align = "end", className }: { align?: "start" | "end"; className?: string }) {
  const t = useTranslations("common");
  return <IllustrativeToggle label={t("illustrative")} note={t("illustrativeNote")} align={align} className={className} />;
}
