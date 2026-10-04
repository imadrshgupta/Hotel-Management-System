import { describe, it, expect } from "vitest";
import { formatCurrency, formatDate, getInitials, truncate, cn } from "./utils";

describe("formatCurrency", () => {
  it("formats amounts as USD by default", () => {
    expect(formatCurrency(1234.5)).toBe("$1,234.50");
  });

  it("formats zero and negative values", () => {
    expect(formatCurrency(0)).toBe("$0.00");
    expect(formatCurrency(-25)).toBe("-$25.00");
  });

  it("respects a custom currency", () => {
    expect(formatCurrency(100, "EUR")).toContain("€");
  });
});

describe("formatDate", () => {
  it("formats a Date object", () => {
    expect(formatDate(new Date("2026-09-06T10:00:00Z"))).toBe("Sep 6, 2026");
  });

  it("formats an ISO string", () => {
    expect(formatDate("2026-09-06")).toBe("Sep 6, 2026");
  });

  it("returns empty string for falsy input", () => {
    expect(formatDate("")).toBe("");
    expect(formatDate(null as unknown as string)).toBe("");
  });
});

describe("getInitials", () => {
  it("combines first and last name initials", () => {
    expect(getInitials("Jane", "Smith")).toBe("JS");
  });

  it("handles missing names gracefully", () => {
    expect(getInitials("Jane", "")).toBe("J");
    expect(getInitials("", "")).toBe("");
  });
});

describe("truncate", () => {
  it("shortens strings longer than the limit", () => {
    expect(truncate("abcdef", 3)).toBe("abc...");
  });

  it("leaves short strings untouched", () => {
    expect(truncate("abc", 5)).toBe("abc");
  });
});

describe("cn", () => {
  it("merges class names and resolves conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
    expect(cn("a", undefined, "b")).toBe("a b");
  });
});