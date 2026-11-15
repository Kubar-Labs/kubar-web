import { clsx, type ClassValue } from "clsx";

/*
 * Class names for client components: clsx only. `cn` in utils.ts also runs
 * tailwind-merge, which is worth its weight on the server but not in the
 * browser bundle (HANDOFF section 11), so components that ship to the client
 * never pass two utilities for the same property.
 */
export function cx(...inputs: ClassValue[]) {
  return clsx(inputs);
}
