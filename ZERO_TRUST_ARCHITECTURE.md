# Zero-Trust Data Sovereignty & GDPR Compliance

Warme Miete operates on a strictly enforced **Zero-Trust Data Sovereignty** architecture. 

In the German real estate and property management ecosystem, data privacy is paramount. Traditional prop-tech startups often attempt to acquire massive amounts of Personally Identifiable Information (PII) to build data models. We fundamentally reject this approach. 

### Core Principles
1. **Mathematical Isolation:** We do not track or care *who* the tenants are or *where* the building is specifically located. We only need the mathematical constraints of the building structure (e.g., "20 Units, Age: 1970") to generate the `Cold Rent` vs. `Warm Rent` equilibrium.
2. **Schema-Level Blockade:** Our database layer (`simulations` and `audit_logs` tables) does not contain columns for address, owner names, or tenant details.
3. **API Perimeter Defense:** Edge-level HTTP routes utilize strict `Zod` validation schemas (`z.strict()`). If a Property Management system attempts to upload PII (such as a JSON payload including `tenantName` or `streetAddress`), the API instantly rejects the request with a `403 Forbidden` status.

### Why this is a Moat
By proving to large institutional managers (Hausverwaltungen), banks (GLS, DKB), and government financiers (KfW/BAFA) that we literally *cannot* suffer a GDPR data breach regarding their tenants, we entirely remove the largest friction point in enterprise software procurement. They can confidently utilize our B2B SaaS without undergoing a 6-month legal review cycle, because they are only transmitting anonymized math, not human data.

### The "Defensive Tech" Stack
- **Cryptographic PoE:** All data states are hashed deterministically.
- **Zod Encasement:** The API drops any payload containing unmapped variables.
- **Data Anonymization:** Complete separation between the execution engine and the legacy ERP systems (like Domus / DATEV).
