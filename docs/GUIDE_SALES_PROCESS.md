# Guide Sales Process

Use this process while guide sales are manual through WhatsApp and Mobile Money.

## Rules

- Do not add a payment API until manual demand is proven.
- Do not promise instant delivery unless someone is actively monitoring WhatsApp.
- Do not send a PDF before payment is confirmed.
- Do not guarantee business income or profit from a guide.
- Keep every buyer conversation linked to the guide slug and payment amount.

## Buyer Flow

1. Buyer clicks a guide WhatsApp CTA.
2. UBI confirms the guide title, slug, and price.
3. UBI sends Mobile Money payment instructions.
4. Buyer sends payment confirmation.
5. UBI verifies the payment.
6. UBI sends the PDF.
7. UBI records guide slug, buyer contact, amount, payment status, and delivery time in a manual ledger or external sheet.

## Fulfillment Checklist

For every guide sale:

1. Confirm buyer name and WhatsApp number.
2. Confirm requested guide slug and title.
3. Confirm exact price in UGX.
4. Send Mobile Money instructions.
5. Verify payment before delivery.
6. Send the correct PDF.
7. Mark delivery complete in the manual ledger.
8. Invite one practical follow-up question if appropriate.

## Data Notes

Guide offers live in `app/data/guides.ts`.

Each guide should include:

- `priceUGX`
- `buyerPromise`
- `deliveryTime`
- `whatYouGet`
- `fulfillmentChecklist`
- `whatsappMessage` with title, slug, and price

Keep guide promises matched to the actual PDF contents.
