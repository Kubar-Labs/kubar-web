import { describe, expect, it } from "vitest";
import messages from "../../messages/en.json";
import { abbreviationPattern, nextAbbreviation } from "./abbreviations";

const keys = Object.keys(messages.abbreviations);
const pattern = abbreviationPattern(keys);
const find = (text: string, seen: string[] = []) => nextAbbreviation(text, pattern, new Set(seen));

describe("abbreviations (copy deck 4.1)", () => {
  it("lists the seventeen from the handoff", () => {
    expect(keys.sort()).toEqual(
      ["AD bank", "DPIIT", "EDPMS", "FACE", "GFTN", "GIFT City", "GIFT IFIH", "IBU", "IFSC", "IFSCA", "ITFS", "MeitY", "MSME", "NIBM", "RBI", "SME", "STPI"].sort(),
    );
  });

  it("finds whole words only, and the longer name first", () => {
    expect(find("Kubar’s own ITFS registration")?.key).toBe("ITFS");
    expect(find("through GIFT IFIH")?.key).toBe("GIFT IFIH");
    expect(find("the IFSCA FinTech Innovation Sandbox")?.key).toBe("IFSCA");
    expect(find("MSME exports")?.key).toBe("MSME");
    expect(find("a surface, in your face")).toBeNull();
    expect(find("FACEBOOK and SMEs2")).toBeNull();
    expect(find("NIBM Pune")).toEqual({ key: "NIBM", index: 0, length: 4 });
  });

  it("accepts a plural and leaves the s outside the match", () => {
    expect(find("banks’ IBUs at GIFT City")).toEqual({ key: "IBU", index: 7, length: 3 });
  });

  it("skips what the page has already explained", () => {
    expect(find("ITFS at GIFT City", ["ITFS"])?.key).toBe("GIFT City");
    expect(find("ITFS at GIFT City", ["ITFS", "GIFT City"])).toBeNull();
  });
});
