import { useTranslations } from "next-intl";
import { RecordView } from "@/components/registers/RecordView";

/** Record RCV-0001: reads its words on the server and hands them to the interactive view. */
export function Record({ className }: { className?: string }) {
  const t = useTranslations();
  return <RecordView copy={t.raw("record")} className={className} />;
}
