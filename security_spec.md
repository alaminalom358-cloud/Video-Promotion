# Security Specification: Video Promotion & Reward Platform

## 1. Data Invariants
1. **Identity Isolation**: A user can only write to their own profile in `/users/{userId}` where `userId == request.auth.uid`.
2. **Vendor Isolation**: A vendor can only write to their own profile in `/vendors/{vendorId}` where `vendorId == request.auth.uid`.
3. **Admin Exclusivity**: Access to `/admins/{adminId}` and administrative mutations is strictly reserved for users who exist in the `/admins` collection or match the verified root owner email (`alaminalom358@gmail.com`). Public registration as admin is prohibited.
4. **Campaign Approval Integrity**: Vendors can create campaigns with `status: 'pending'`. Only an administrator can update the status to `'approved'`, `'active'`, or `'rejected'`, or set `rejectionReason`. A vendor cannot approve their own campaign.
5. **Wallet Protection**: Users cannot modify their own point balances in `/user_wallets/{userId}` directly. Points can only be adjusted via verified admin or server-controlled transaction writes.
6. **Redemption Request Immutability**: Users can create redemption requests with `status: 'pending'`. Only administrators can transition status to `'completed'` or `'rejected'`.
7. **Anti-Cheat Challenge Integrity**: Quizzes and challenges can only be configured by campaign vendors or admins; users can only read them.
8. **Audit Trail Immutability**: Activity logs and point transactions once written cannot be updated or deleted by users.

---

## 2. The "Dirty Dozen" Threat Payloads (Security Test Vectors)

1. **Payload 1 (Privilege Escalation - Admin Self-Creation)**
   Attacker attempts to create a document in `/admins/{attackerUid}` with role `admin`.
   Expected: `PERMISSION_DENIED`.

2. **Payload 2 (Self-Approval Attack)**
   Vendor attempts to submit or update a campaign with `status: 'active'` or `status: 'approved'`.
   Expected: `PERMISSION_DENIED`.

3. **Payload 3 (Point Wallet Spoofing)**
   Viewer attempts to update `/user_wallets/{viewerUid}` setting `points: 99999999`.
   Expected: `PERMISSION_DENIED`.

4. **Payload 4 (Identity Impersonation in Users Collection)**
   Attacker authenticated as `uid_attacker` attempts to create `/users/uid_victim`.
   Expected: `PERMISSION_DENIED`.

5. **Payload 5 (Unauthenticated Read of PII)**
   Unauthenticated user attempts to list or get `/users/{userId}` containing sensitive private fields.
   Expected: `PERMISSION_DENIED`.

6. **Payload 6 (Unauthorized Redemption State Tampering)**
   Viewer attempts to update their own pending redemption request to `status: 'completed'`.
   Expected: `PERMISSION_DENIED`.

7. **Payload 7 (Platform Settings Hijack)**
   Non-admin user attempts to overwrite `/platform_settings/current` with modified exchange rates.
   Expected: `PERMISSION_DENIED`.

8. **Payload 8 (Vendor Wallet Balance Fraud)**
   Vendor attempts to directly update `/vendors/{vendorId}` field `balance` without admin/stripe deposit confirmation.
   Expected: `PERMISSION_DENIED`.

9. **Payload 9 (Quiz Answer Tampering)**
   Viewer attempts to alter the `correctIndex` in `/campaign_quizzes/{quizId}`.
   Expected: `PERMISSION_DENIED`.

10. **Payload 10 (Transaction Ledger Deletion)**
    Attacker attempts to delete documents from `/point_transactions/{txId}` to erase audit logs.
    Expected: `PERMISSION_DENIED`.

11. **Payload 11 (Campaign Budget Drain / Overspend)**
    Attacker tries to alter another vendor's `budgetSpent` or `budgetTotal`.
    Expected: `PERMISSION_DENIED`.

12. **Payload 12 (Denial of Wallet Oversized ID Injection)**
    Malicious client attempts to create document with an oversized 2KB garbage ID string or invalid characters.
    Expected: `PERMISSION_DENIED`.

---

## 3. Security Rules Architecture Plan
- Default deny catch-all `match /{document=**} { allow read, write: if false; }`.
- Reusable validator functions (`isValidId`, `isSignedIn`, `isAdmin`, `isOwner`).
- Distinct match blocks for all 13 collections from `firebase-blueprint.json`.
