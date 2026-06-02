# BD Org Creation — Field Reference

## Required Fields

Must have real data. Cannot be `"NA"`. Validate before submitting.

| Field | Type | Description | Validation Rule |
|---|---|---|---|
| `companyName` | String | Company name | Non-empty string |
| `lob` | String | Line of business | Must match approved LOB list (see below). Create new only if company fits nothing in list AND absolutely necessary — confirm new LOB with user before using. |
| `bdName` | String | BD Manager name | Always `"VBDE"` — hardcoded, never ask user |
| `formType` | String | Form type | Always `"Company"` — hardcoded, never ask user |
| `websiteExist` | String | Whether company has website | Always `"Yes"` — hardcoded (website is always mandatory) |
| `website` | String | Company website | **Mandatory — cannot be empty or NA.** Main domain only — strip `https://`, `http://`, `www.`, any path (`/about`, `/products`), and trailing slashes. Preserve subdomains (e.g. `api.example.com` stays as-is). Example: `"kserve.co.in"` not `"https://www.kserve.co.in/about"` |
| `turnover` | Decimal | Annual revenue | Latest year's figure. Numbers only in Crore (INR). Strip any "Cr" / "crore" / "₹" text. Submit as a JSON number, not a string — e.g. `2.5` not `"2.5"`. |
| `location` | String | Company's primary location | Format: `"City, Country"`. Example: `"Mumbai, India"`, `"Pune, India"` |

## Approved LOB List

Accept case-insensitive input and normalize to the exact casing above before submitting (e.g. "bfsi" → `BFSI`, "manufacturing" → `Manufacturing`).

```
BFSI
Manufacturing
Edutech
FMCG
Real Estate
Entertainment
Healthcare
Ecommerce
Retail
Data Services
Pest Management
Technology
Hospitality
Fintech
NBFC
```

**New LOB rule:** Only propose a new LOB if the company genuinely does not fit any item in the list AND it is absolutely necessary. Present the proposed new LOB to the user and get explicit confirmation before using it.

## Optional Fields

Submit as `"NA"` if not available. Never leave blank — always include in payload.

| Field | Type | Description | Format |
|---|---|---|---|
| `yearInExistence` | String | Years since established | Numbers only. Example: `"12"`, `"5"`, `"40"` |
| `nameOfDirectors` | String | Director names with current roles, comma-separated. If roles unavailable, names only. | `"Rakesh Jha - Chairman, Sanjeev Mantri - MD & CEO"` |
| `numberOfCompanyBranches` | String | Total branch count | `"3"`, `"12"`, `"50+"` |
| `Review` | String | Overall company review | 1–2 sentences summarising company quality, market reputation, or notable strengths/weaknesses |
| `rating` | String | Overall product/service rating | 1–2 sentences describing rating and context. Example: `"Rated 4.2 on Google with strong customer satisfaction feedback"` |
| `services` | String | KServe services to pitch | `"Customer Service, AI Bot"` |
| `customerCareNumber` | String | Company's customer care number | `"1800-260000"` |
| `socialMedia` | String | Social media presence | Format: `"Platform - Follower count"`, comma-separated. Example: `"Instagram - 10K Followers, Linkedin - 5K Followers"` |
| `Tracxn` | String | Tracxn platform rating | Number only. Example: `"4.5"` not `"4.5/5"` or `"Tracxn rating 4.5"` |
| `acquisitions` | String | Acquisition or partnership info | Short pointers, comma-separated. Example: `"Acquired by Reliance 2023, Partnered with Jio 2025"`. Use `"NA"` if none. |

## Extraction Mapping (Research Report → API Field)

When extracting from a company-research report output, map sections to API fields:

| Research Report Section | API Field | Notes |
|---|---|---|
| Company name / report header | `companyName` | |
| Industry / sector / vertical | `lob` | Match to approved LOB list |
| Website URL | `website` | Extract main domain only |
| Turnover / revenue figures | `turnover` | Latest year, numeric in Crore only |
| City / head office / registered address | `location` | Format as "City, Country" |
| Year founded / MCA incorporation year | `yearInExistence` | Numbers only |
| Directors / board members | `nameOfDirectors` | Include each person's current role — format: `"Name - Role"`, comma-separated. If roles are unavailable, submit names only (e.g. `"Rakesh Jha, Sanjeev Mantri"`). |
| Branch count / office locations count | `numberOfCompanyBranches` | |
| Product or service reviews | `Review` | Summarise in 1–2 sentences |
| Star ratings / Google ratings | `rating` | Summarise in 1–2 sentences |
| KServe services to pitch / recommended services section | `services` | Comma-separated service names |
| Customer care / support / helpline number | `customerCareNumber` | Phone number as-is |
| Social media section | `socialMedia` | Format: "Platform - XK Followers" |
| Tracxn data | `Tracxn` | Number only |
| Acquisitions / funding / partnerships section | `acquisitions` | Short pointers |
