# Security Specification for FinGuard AI

## 1. Data Invariants
- An invoice must belong to a specific user (`userId`).
- A user can only read, create, update, or delete their own invoices.
- Critical fields like `userId` and `createdAt` are immutable after creation.
- Root collection `/invoices/` is restricted to owners only.

## 2. The "Dirty Dozen" Payloads
1. **Identity Spoofing**: Attempt to create an invoice with `userId` of another user.
2. **Resource Poisoning**: Use a document ID longer than 128 characters.
3. **Ghost Field Injection**: Add `isVerified: true` to an invoice update.
4. **PII Blanket Leak**: List all invoices without a `where` clause on `userId`.
5. **Backdated Entry**: Set `createdAt` to a past date instead of `serverTimestamp()`.
6. **Negative Total**: Set `total` to a negative number.
7. **Cross-User Edit**: User B attempts to change the vendor of User A's invoice.
8. **Malicious ID injection**: Use special characters in document ID to exploit path parsing.
9. **Size Attack**: Post an items array with 10,000 strings.
10. **Type Mismatch**: Post a string in the `total` field.
11. **Shadow Update**: Attempt to update `userId` on an existing document.
12. **Unverified Auth**: Attempt to write without a verified email (if strict verification is enabled).

## 3. Test Cases (Summary)
- `reports` create: Reject if `incoming().userId != request.auth.uid`, or if schema doesn't strictly match (12 keys required).
- `invoices` create: Reject if `incoming().userId != request.auth.uid`.
- `invoices` update: Reject if `affectedKeys().hasOnly(['vendor', 'total', 'tax', 'category', 'items'])` logic is bypassed.
- `invoices` list: Reject if `resource.data.userId != request.auth.uid`.
