# Security Specification - Firestore Security Rules

This document specifies the security requirements, data invariants, and adversarial test scenarios (the "Dirty Dozen") for the Smart Budget Firebase integration.

## 1. Data Invariants

1. **User Ownership**: A user document at `/users/{userId}` can only be read, created, or updated by the authenticated user whose `request.auth.uid` matches `{userId}`.
2. **Profile Ownership**: A user profile document at `/users/{userId}/profiles/custom` can only be read, created, or updated by the owner whose `request.auth.uid` matches `{userId}`.
3. **No Cross-User Access**: Users are strictly forbidden from reading or writing other users' data.
4. **Valid Email Verification**: Email must be verified if verification is required (`request.auth.token.email_verified == true`).
5. **No Spoofing**: The `userId` property within `/users/{userId}/profiles/custom` must match `request.auth.uid`.
6. **Immutable Fields**: `createdAt` must be immutable and match `request.time`. `userId` on the custom profile must be immutable.
7. **Value Safety**: Numeric fields such as `netIncome` must be positive or zero, and not exceed reasonable constraints (e.g., 10,000,000) to prevent Denial of Wallet memory/indexing attacks.
8. **Document ID Safety**: Every document ID must conform to alpha-numeric patterns and be bounded in size to prevent path poisoning.

---

## 2. The "Dirty Dozen" Adversarial Payloads

The following payloads represent malicious attempts to bypass identity, integrity, and state transition laws. Our security rules will mathematically guarantee their rejection.

### ID & Identity Spoofing Attacks
1. **Payload 1 (Cross-user user creation)**: Trying to write a user document for `victim_user_id` when authenticated as `attacker_user_id`.
2. **Payload 2 (Cross-user profile creation)**: Trying to write a profile document for `/users/victim_user_id/profiles/custom` as `attacker_user_id`.
3. **Payload 3 (Self-assigned UID)**: Authenticated user `attacker_user_id` trying to save a custom profile with `userId = 'victim_user_id'` inside `/users/attacker_user_id/profiles/custom`.

### PII & Privilege Escalation Attacks
4. **Payload 4 (Email Spoofing)**: Attempting to read `/users/victim_user_id` by passing an unverified email token.
5. **Payload 5 (PII Scraping / Blanket Read)**: An authenticated user requesting a blanket list of all users' profiles.

### Data Poisoning & Value Injection
6. **Payload 6 (Junk ID Poisoning)**: Creating a profile document using a 50KB corrupted string as the document ID to cause storage/denial-of-wallet attacks.
7. **Payload 7 (Extreme Values)**: Saving a profile where `netIncome` is negative (`-5000`) or exceptionally large (`9999999999999999`).
8. **Payload 8 (Invalid Field Types)**: Injecting a boolean `true` or an object array for `netIncome` instead of a number.
9. **Payload 9 (Unknown Ghost Fields)**: Injecting a field `isPremiumUser: true` (a shadow privilege field) during a profile write.

### Temporal & State Corruption
10. **Payload 10 (Client-Generated Backdated Timestamps)**: Attempting to create a profile with a manually set historical `createdAt` (e.g., "1970-01-01").
11. **Payload 11 (Updating Immutable Creation Dates)**: Attempting to modify `createdAt` during an update.
12. **Payload 12 (Self-Assigned Admin privileges)**: Attempting to create or modify an admin role.

---

## 3. PASS / FAIL Matrix and Assertions

| Payload ID | Target Path | Auth State | Intent | Expected Result | Hardening Rule |
|------------|-------------|------------|--------|-----------------|----------------|
| 1 | `/users/victim` | Authenticated as `attacker` | Write user metadata | **DENIED** | `{userId} == request.auth.uid` |
| 2 | `/users/victim/profiles/custom` | Authenticated as `attacker` | Write profile | **DENIED** | `{userId} == request.auth.uid` |
| 3 | `/users/attacker/profiles/custom` | Authenticated as `attacker` | Write custom `userId: "victim"` | **DENIED** | `incoming().userId == request.auth.uid` |
| 4 | `/users/victim` | Unauthenticated | Read metadata | **DENIED** | `request.auth != null` |
| 5 | `/users` | Authenticated | Blanket query / list | **DENIED** | List queries must be restricted per owner |
| 6 | `/users/attacker/profiles/{junkId}` | Authenticated as `attacker` | Path poisoning | **DENIED** | Document ID size and pattern check |
| 7 | `/users/attacker/profiles/custom` | Authenticated as `attacker` | Negative income | **DENIED** | Number boundaries checking |
| 8 | `/users/attacker/profiles/custom` | Authenticated as `attacker` | Type injection | **DENIED** | Type checks (`is number`) |
| 9 | `/users/attacker/profiles/custom` | Authenticated as `attacker` | Inject non-blueprint field | **DENIED** | strict schema `keys().size() == N` and `affectedKeys().hasOnly()` |
| 10 | `/users/attacker` | Authenticated as `attacker` | Client timestamp spoofing | **DENIED** | `createdAt == request.time` |
| 11 | `/users/attacker/profiles/custom` | Authenticated as `attacker` | Modify `createdAt` | **DENIED** | `incoming().createdAt == existing().createdAt` |
| 12 | `/admins/{attacker}` | Authenticated as `attacker` | Write admin document | **DENIED** | Default-deny catch-all |
