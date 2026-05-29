import { describe, test, expect } from "bun:test";
import { validateEnvelope } from "./validate-output";

const validStep2 = {
  step: "step-2",
  status: "APPROVED",
  data: { industry: "Retail", subindustry: "E-commerce", services_offered: ["Online sales"] },
  sources: [{ url: "https://example.com", title: "Example", tier: 1, accessed: "2026-05-22" }],
  confidence: "HIGH",
};

describe("validateEnvelope", () => {
  test("accepts a well-formed step-2 envelope", () => {
    const result = validateEnvelope(validStep2);
    expect(result.ok).toBe(true);
  });

  test("rejects envelope with unknown step id", () => {
    const bad = { ...validStep2, step: "step-99" };
    const result = validateEnvelope(bad);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/step/);
  });

  test("rejects envelope missing required data field", () => {
    const bad = { ...validStep2, data: { subindustry: "E-commerce" } };
    const result = validateEnvelope(bad);
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/industry|required/);
  });

  test("rejects envelope with invalid status", () => {
    const bad = { ...validStep2, status: "MAYBE" };
    const result = validateEnvelope(bad);
    expect(result.ok).toBe(false);
  });

  test("rejects envelope with non-uri source URL", () => {
    const bad = { ...validStep2, sources: [{ url: "not-a-url", title: "x", tier: 1, accessed: "2026-05-22" }] };
    const result = validateEnvelope(bad);
    expect(result.ok).toBe(false);
  });

  test("rejects envelope with out-of-range source tier", () => {
    const bad = { ...validStep2, sources: [{ url: "https://example.com", title: "x", tier: 5, accessed: "2026-05-22" }] };
    const result = validateEnvelope(bad);
    expect(result.ok).toBe(false);
  });

  test("accepts a well-formed step-6b envelope with OSINT fields", () => {
    const validStep6b = {
      step: "step-6b",
      status: "APPROVED",
      data: {
        dossiers: [{
          name: "Ravi Sharma",
          role: "MD",
          background: "Former COO at HDFC Ergo (2018-2023)",
          outreach_angle: "Expanding into 3 new cities",
          linkedin: "https://linkedin.com/in/ravi-sharma",
          post_themes: "Operational scaling, team culture",
          personal_interests: "Marathon running, education trusts",
          communication_style: "Formal Executive",
          recent_activity_hook: "Posted about AI in insurance last month",
          other_platforms: "Twitter: @ravi_sharma",
          likely_first_objection: "Cost concerns for mid-market"
        }]
      },
      sources: [{ url: "https://linkedin.com/in/ravi-sharma", title: "LinkedIn Profile", tier: 1, accessed: "2026-05-22" }],
      confidence: "HIGH",
    };
    const result = validateEnvelope(validStep6b);
    expect(result.ok).toBe(true);
  });

  test("accepts a well-formed step-5 envelope with new fields", () => {
    const valid = {
      step: "step-5", status: "APPROVED",
      data: { years_in_existence: 12, founded_year: 2014, cin: "U72200MH2014PTC123456", roc: "ROC Mumbai", company_type: "Private Limited" },
      sources: [{ url: "https://example.com", title: "MCA", tier: 1, accessed: "2026-05-22" }],
      confidence: "HIGH",
    };
    expect(validateEnvelope(valid).ok).toBe(true);
  });

  test("accepts a well-formed step-6 envelope with din", () => {
    const valid = {
      step: "step-6", status: "APPROVED",
      data: { directors: [{ name: "A Sharma", role: "MD", din: "01234567" }] },
      sources: [{ url: "https://example.com", title: "MCA", tier: 1, accessed: "2026-05-22" }],
      confidence: "HIGH",
    };
    expect(validateEnvelope(valid).ok).toBe(true);
  });

  test("accepts a well-formed step-11 envelope with new fields", () => {
    const valid = {
      step: "step-11", status: "APPROVED",
      data: { customer_care_number: "1800-123-456", support_email: "help@example.com", support_hours: "9-6", whatsapp_business: "+911234567890", contact_form_url: "https://example.com/contact" },
      sources: [{ url: "https://example.com", title: "Website", tier: 1, accessed: "2026-05-22" }],
      confidence: "HIGH",
    };
    expect(validateEnvelope(valid).ok).toBe(true);
  });

  test("accepts a well-formed step-17 envelope with competitor fields", () => {
    const valid = {
      step: "step-17", status: "APPROVED",
      data: { competitors: [{ name: "Competitor Inc", rationale: "Direct competitor in BFSI", founded_year: 2010, headcount: "500-1000", linkedin_followers: 5000, funding_stage: "Series C" }] },
      sources: [{ url: "https://example.com", title: "Crunchbase", tier: 1, accessed: "2026-05-22" }],
      confidence: "HIGH",
    };
    expect(validateEnvelope(valid).ok).toBe(true);
  });

  test("accepts step-5 envelope without optional new fields", () => {
    const env = { step: "step-5", status: "APPROVED", data: { years_in_existence: 12, founded_year: 2014 }, sources: [{ url: "https://example.com", title: "MCA", tier: 1, accessed: "2026-05-22" }], confidence: "HIGH" };
    expect(validateEnvelope(env).ok).toBe(true);
  });

  test("accepts step-6 envelope without optional din", () => {
    const env = { step: "step-6", status: "APPROVED", data: { directors: [{ name: "A Sharma", role: "MD" }] }, sources: [{ url: "https://example.com", title: "MCA", tier: 1, accessed: "2026-05-22" }], confidence: "HIGH" };
    expect(validateEnvelope(env).ok).toBe(true);
  });

  test("accepts step-11 envelope without optional new fields", () => {
    const env = { step: "step-11", status: "APPROVED", data: { customer_care_number: "1800-123-456" }, sources: [{ url: "https://example.com", title: "Website", tier: 1, accessed: "2026-05-22" }], confidence: "HIGH" };
    expect(validateEnvelope(env).ok).toBe(true);
  });

  test("accepts step-17 envelope without optional competitor fields", () => {
    const env = { step: "step-17", status: "APPROVED", data: { competitors: [{ name: "Competitor Inc", rationale: "Direct competitor" }] }, sources: [{ url: "https://example.com", title: "Crunchbase", tier: 1, accessed: "2026-05-22" }], confidence: "HIGH" };
    expect(validateEnvelope(env).ok).toBe(true);
  });

  test("accepts step-6b envelope without optional OSINT fields", () => {
    const env = { step: "step-6b", status: "APPROVED", data: { dossiers: [{ name: "A Sharma", role: "MD", background: "Former CFO at HDFC." }] }, sources: [{ url: "https://example.com", title: "MCA", tier: 1, accessed: "2026-05-29" }], confidence: "HIGH" };
    expect(validateEnvelope(env).ok).toBe(true);
  });
});
