# Supplier Verification Process

Use this checklist before publishing any real supplier contact on Uganda Business Ideas.

## Listing Rules

- Do not label a supplier as verified until every checklist item is complete.
- Do not publish phone, WhatsApp, website, or location details without owner approval.
- Do not invent reviews, ratings, prices, guarantees, or performance claims.
- Keep placeholders as `needs_verification` or `placeholder`.
- If a supplier cannot be reached again, remove public contact details until reconfirmed.

## Verification Checklist

1. Confirm the business name and owner or contact person.
2. Test the phone or WhatsApp number.
3. Confirm operating location or service area.
4. Confirm products, services, prices, and buyer terms.
5. Match the supplier only to relevant idea pages.
6. Send the final listing copy to the owner for approval.
7. Mark `contactStatus` as `verified` only after approval.

## Data Update Notes

Supplier records live in `app/data/suppliers.ts`.

Use:

- `contactStatus: "needs_verification"` while checking details.
- `contactStatus: "verified"` only when the checklist is complete.
- `verificationSummary` to explain what was checked or what is still missing.
- `verificationChecks` to store completed checklist item IDs.

Public cards in `components/SupplierCard.tsx` show contact details only for verified suppliers.
