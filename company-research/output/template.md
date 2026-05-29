<!--
  company-research/output/template.md
  Substitution syntax (handled by company-research/scripts/format-report.ts):
    {{company}}                — the canonical company name (verified in Phase 1)
    {{step-<id>.<field>}}      — value from envelope step-<id> data.<field>
    {{data_quality_footer}}    — rendered DATA QUALITY footer (RETRY_EXHAUSTED gaps, security events, confidence tally, oldest source date)
  Markdown unrecognized as a placeholder passes through verbatim.
-->

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏢 KSERVE BD RESEARCH REPORT
Company: {{company}}
Website: {{company_website}}
Research Date: {{research_date}}
Prepared for: KServe BPO BD Team
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

✅ VERIFICATION
Website: {{verification.website}} | Address: {{verification.address}} | Confirmed by user: {{verification.confirmed_by_user}}

📋 LINE OF BUSINESS
{{step-2.summary}}
Source(s): {{step-2.sources}} | Confidence: {{step-2.confidence}} | Source date: {{step-2.source_date}}

💰 TURNOVER
{{step-3.turnover_recent_fy}}: ₹{{step-3.turnover_recent}} Cr | {{step-3.turnover_prior_fy}}: ₹{{step-3.turnover_prior}} Cr | {{step-3.turnover_prior_prior_fy}}: ₹{{step-3.turnover_prior_prior}} Cr
Trend: {{step-3.trend}}
BD signal: {{step-3.bd_signal}}
Source(s): {{step-3.sources}} | Confidence: {{step-3.confidence}} | Source date: {{step-3.source_date}}

📍 HEAD OFFICE
{{step-4.address}}
Source(s): {{step-4.sources}} | Confidence: {{step-4.confidence}} | Source date: {{step-4.source_date}}

📅 YEARS IN EXISTENCE
Founded {{step-5.founded_year}} | {{step-5.years_old}} years old
Source(s): {{step-5.sources}} | Confidence: {{step-5.confidence}} | Source date: {{step-5.source_date}}

👔 DIRECTORS
{{step-6.directors_rendered}}
Board Classification: {{step-6.board_classification}}
BD signal: {{step-6.bd_signal}}
Source(s): {{step-6.sources}} | Confidence: {{step-6.confidence}} | Source date: {{step-6.source_date}}

🧑‍💼 DECISION-MAKER DOSSIERS
{{step-6b.dossiers_rendered}}
Source(s): {{step-6b.sources}} | Confidence: {{step-6b.confidence}} | Checked: {{step-6b.checked}}

🗺️ BRANCHES & OFFICES
{{step-7.location_count}} locations | Key cities: {{step-7.key_cities}}
Source(s): {{step-7.sources}} | Confidence: {{step-7.confidence}} | Source date: {{step-7.source_date}}

💼 JOB POSTINGS & WORKFORCE SIGNALS
Open roles: ~{{step-7b.open_roles_total}} | Top functions: {{step-7b.top_functions}}
KServe-relevant openings:
{{step-7b.kserve_relevant_rendered}}
BD signal: {{step-7b.bd_signal}}
LinkedIn Headcount: ~{{step-7b.linkedin_headcount}} employees [as of {{step-7b.linkedin_headcount_date}}]
Trend: {{step-7b.headcount_trend}}
Basis: {{step-7b.headcount_basis}}
Headcount signal: {{step-7b.headcount_signal}}
Attrition signal: {{step-7b.attrition_signal}}
Source(s): {{step-7b.sources}} | Confidence: {{step-7b.confidence}} | Checked: {{step-7b.checked}}

🛠️ TECHNOLOGY STACK
CRM: {{step-7c.crm}} | Support tool: {{step-7c.support_tool}} | Review tool: {{step-7c.review_tool}}
Marketing automation: {{step-7c.marketing_automation}}
BD framing: {{step-7c.bd_framing}}
Source(s): {{step-7c.sources}} | Confidence: {{step-7c.confidence}} | Checked: {{step-7c.checked}}

⭐ REVIEWS & REPUTATION (Last 12 months)

📦 A — PRODUCT REVIEW
{{step-8.a_platforms_rendered}}
Top critical themes: {{step-8.a_critical_themes}}
Top positive themes: {{step-8.a_positive_themes}}
Trend: {{step-8.a_trend}}
App:
{{step-8.a_app_rendered}}
Confidence: {{step-8.a_confidence}} | Most recent: {{step-8.a_most_recent}}

🛎️ B — SERVICE REVIEW
{{step-8.b_platforms_rendered}}
Top positives: {{step-8.b_positives}}
Top negatives: {{step-8.b_negatives}}
Trend: {{step-8.b_trend}}
Notable signal: {{step-8.b_notable_signal}}
BD signal: {{step-8.b_bd_signal}}
Confidence: {{step-8.b_confidence}} | Most recent: {{step-8.b_most_recent}}

👥 C — EMPLOYEE REVIEW
{{step-8.c_platforms_rendered}}
Top positives: {{step-8.c_positives}}
Top negatives: {{step-8.c_negatives}}
BD signal: {{step-8.c_bd_signal}}
Confidence: {{step-8.c_confidence}} | Most recent: {{step-8.c_most_recent}}

🌐 D — GENERAL COMPANY REVIEW
{{step-8.d_platforms_rendered}}
Overall reputation narrative: {{step-8.d_reputation_narrative}}
Notable: {{step-8.d_notable}}
BD signal: {{step-8.d_bd_signal}}
Confidence: {{step-8.d_confidence}} | Most recent: {{step-8.d_most_recent}}

🔄 E — REVIEW HANDLING METHODOLOGY
Response channel(s): {{step-8.e_response_channels}}
Response style: {{step-8.e_response_style}}
Response rate: {{step-8.e_response_rate}}
Response speed: {{step-8.e_response_speed}}
Tool indicators: {{step-8.e_tool_indicators}}
BD signal: {{step-8.e_bd_signal}}
Source(s): {{step-8.e_sources}} | Confidence: {{step-8.e_confidence}} | Source date: {{step-8.e_source_date}}

🎯 OVERALL RATING: {{step-9.rating}}/10 — {{step-9.label}}
{{step-9.rationale}}

🤝 KSERVE FIT ASSESSMENT
{{step-10.fits_rendered}}
Excluded: {{step-10.excluded_rendered}}

📈 ICP SCORE: {{step-10b.score}}/100 — {{step-10b.tier_label}}
Score breakdown:
  Industry match: {{step-10b.breakdown.industry_match}}/15 · Revenue band: {{step-10b.breakdown.revenue_band}}/10 · Employee proxy: {{step-10b.breakdown.employee_proxy}}/10
  Pain point evidence: {{step-10b.breakdown.pain_point_evidence}}/15 · Review quality: {{step-10b.breakdown.review_quality}}/10 · Growth/change: {{step-10b.breakdown.growth_change}}/10
  Decision-maker access: {{step-10b.breakdown.decision_maker_access}}/10 · Job postings: {{step-10b.breakdown.job_postings}}/10 · Social presence: {{step-10b.breakdown.social_presence}}/5 · Data confidence: {{step-10b.breakdown.data_confidence}}/5
Primary drivers: {{step-10b.primary_drivers}}
Recommended action: {{step-10b.recommended_action}}

📞 CUSTOMER CARE NUMBER
{{step-11.number}} | Source(s): {{step-11.sources}} | Confidence: {{step-11.confidence}} | Source date: {{step-11.source_date}}

📱 SOCIAL MEDIA FOLLOWERS
LinkedIn: {{step-12.linkedin}} | Instagram: {{step-12.instagram}} | Facebook: {{step-12.facebook}} | Twitter/X: {{step-12.twitter}} | YouTube: {{step-12.youtube}}
Source(s): {{step-12.sources}} | Confidence: {{step-12.confidence}} | Checked: {{step-12.checked}}

📊 TRACXN / FUNDING PROFILE
Tracxn: {{step-13.tracxn_score}} | Stage: {{step-13.stage}} | Badges: {{step-13.badges}}
Crunchbase: Employees: {{step-13.cb_employees}} | Total funding: {{step-13.cb_total_funding}} | Last round: {{step-13.cb_last_round}}
BD signal: {{step-13.bd_signal}}
Source(s): {{step-13.sources}} | Confidence: {{step-13.confidence}} | Source date: {{step-13.source_date}}

🔀 M&A, FUNDING, LEGAL RISK & KEY PARTNERSHIPS
{{step-14.ma_summary}}
GeM supplier: {{step-14.ma_gem_supplier}}
PE ownership: {{step-14.ma_pe_ownership}}
BD signal: {{step-14.ma_bd_signal}}
Source(s): {{step-14.ma_sources}} | Confidence: {{step-14.ma_confidence}} | Source date: {{step-14.ma_source_date}}

⚖️ REGULATORY & LEGAL RISK
MCA compliance: {{step-14.legal_mca_compliance}}
Consumer court: {{step-14.legal_consumer_court}}
SEBI / RBI: {{step-14.legal_sebi_rbi}}
BD signal: {{step-14.legal_bd_signal}}
Source(s): {{step-14.legal_sources}} | Confidence: {{step-14.legal_confidence}} | Checked: {{step-14.legal_checked}}

🤝 KEY PARTNERSHIPS & INTEGRATIONS
{{step-14.partnerships_rendered}}
BD signal: {{step-14.partnerships_bd_signal}}
Source(s): {{step-14.partnerships_sources}} | Confidence: {{step-14.partnerships_confidence}} | Source date: {{step-14.partnerships_source_date}}

🧠 BD INTELLIGENCE BRIEFING
{{step-15.briefing}}

🏭 CURRENT OUTSOURCING VENDORS
Vendors detected:
{{step-16.vendors_rendered}}
BD signal: {{step-16.bd_signal}}
Source(s): {{step-16.sources}} | Confidence: {{step-16.confidence}} | Checked: {{step-16.checked}}

🏆 COMPETITIVE LANDSCAPE
{{step-17.competitors_rendered}}
BD signal: {{step-17.bd_signal}}
Source(s): {{step-17.sources}} | Confidence: {{step-17.confidence}} | Checked: {{step-17.checked}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 DATA QUALITY
{{data_quality_footer}}

Confidence key: HIGH = MCA-verified or 2+ independent sources · MED = single credible source or aggregator · LOW = estimated, partial, or unverified
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
