import { describe, test, expect } from "bun:test";
import { formatReport, type Envelope } from "./format-report";

const minimalEnvelopes: Envelope[] = [
  {
    step: "step-2",
    status: "APPROVED",
    data: { industry: "Retail", subindustry: "E-commerce", services_offered: ["Online sales"] },
    sources: [{ url: "https://example.com", title: "Example", tier: 1, accessed: "2026-05-22" }],
    confidence: "HIGH",
  },
];

const minimalTemplate = `# {{company}}\n\n## Line of Business\n{{step-2.industry}} — {{step-2.subindustry}}\n`;

describe("formatReport", () => {
  test("substitutes {{company}} and step fields", () => {
    const out = formatReport({ company: "Acme Corp", envelopes: minimalEnvelopes, template: minimalTemplate });
    expect(out).toContain("# Acme Corp");
    expect(out).toContain("Retail — E-commerce");
  });

  test("renders DATA QUALITY footer with no-gap defaults", () => {
    const out = formatReport({ company: "Acme", envelopes: minimalEnvelopes, template: `{{data_quality_footer}}` });
    expect(out).toContain("**Data gaps:** None");
    expect(out).toContain("**Security events:** None");
    expect(out).toContain("**Confidence tally:**");
  });

  test("renders RETRY_EXHAUSTED steps and security events into DATA QUALITY footer", () => {
    const withGap: Envelope[] = [...minimalEnvelopes, { step: "step-3", status: "RETRY_EXHAUSTED", data: {}, sources: [], confidence: "LOW", notes: "no public turnover data" }];
    const out = formatReport({ company: "Acme", envelopes: withGap, template: `{{data_quality_footer}}`, securityEvents: ["INJECTION_FLAGGED: step-2 — Glassdoor"] });
    expect(out).toMatch(/step-3/);
    expect(out).toMatch(/RETRY_EXHAUSTED/);
    expect(out).toMatch(/INJECTION_FLAGGED/);
  });

  test("renders per-step confidence table including step-6b", () => {
    const envs: Envelope[] = [
      ...minimalEnvelopes,
      { step: "step-6b", status: "APPROVED", data: { dossiers: [] }, sources: minimalEnvelopes[0].sources, confidence: "MED" },
    ];
    const out = formatReport({ company: "Acme", envelopes: envs, template: `{{data_quality_footer}}` });
    expect(out).toContain("step-6b");
    expect(out).toContain("Decision-Maker Dossiers");
    expect(out).toContain("MED");
  });

  test("substitutes {{company_website}} and {{research_date}} placeholders", () => {
    const out = formatReport({ company: "Acme", companyWebsite: "https://example.com", researchDate: "2026-05-29", envelopes: minimalEnvelopes, template: `Website: {{company_website}}\nDate: {{research_date}}` });
    expect(out).toContain("Website: https://example.com");
    expect(out).toContain("Date: 2026-05-29");
  });

  test("fallback for {{company_website}} when not provided", () => {
    const out = formatReport({ company: "Acme", envelopes: minimalEnvelopes, template: `Website: {{company_website}}` });
    expect(out).toContain("Website: "); // empty-string replacement is intentional
    expect(out).not.toContain("{{company_website}}");
  });

  test("substitutes {{verification.*}} placeholders", () => {
    const out = formatReport({ company: "Acme", verification: { website: "https://example.com", confirmed_by_user: "Yes" }, envelopes: minimalEnvelopes, template: `{{verification.website}} — {{verification.confirmed_by_user}}` });
    expect(out).toContain("https://example.com — Yes");
  });
});
