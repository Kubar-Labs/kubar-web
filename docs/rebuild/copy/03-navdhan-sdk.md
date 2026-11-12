# NavDhan SDK  ·  route: /products/navdhan-sdk

Extracted from Figma, NavDhan SDK · 1440 (frame 170:6), 13 Nov 2026, in reading order. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md. The "Where it stands" section is removed and must not be built; no "In build" labels anywhere.

## Hero
[Label] NavDhan SDK · For trade platforms and marketplaces      (kept: names who the page is for)
[Display] Trade finance inside the software your exporters already use.
[BodyL] Embed NavDhan SDK and your exporters can check eligibility, apply and be paid for their export receivables without leaving your platform. Financiers buy; Kubar runs the programme; you keep the relationship.
[UI] Talk about an integration                     (filled button → /contact?intent=platform)

Beside it, the embed sketch (component "Embed sketch", 140:2523): a schematic, not a screenshot. At 768 and 390 the "Shipment" column of the sketch is dropped and only the SDK panel shows.
[Tag] Your platform
[Fine] Illustrative
[Tag] Shipment
[BodyS] Booking
[BodyS] Invoice
[BodyS] Inspection report
[BodyS] Bill of lading
[Tag] NavDhan SDK
[UIS] Eligibility check
[BodyS] Buyer country
[BodyS] Terms
[BodyS] Size
[BodyS] Goods
[UIS] Indicative offer
[BodyS] All-in price                       (empty dotted box: no figure)
[BodyS] The exporter’s own alternative     (empty dotted box: no figure)
[UIS] Application and status
[BodyS] Submission
[BodyS] Documents outstanding
[BodyS] Purchase                           (current: rani square)
[BodyS] Settlement                         (open square)

## For your exporters
[H2] Dollar finance beyond their bank limit.
[BodyL] Your exporters can sell their export receivables to institutional financiers, beyond the limits their own banks set, without recourse for the buyer’s credit. They keep their own bank, and their buyers keep their terms.

## For your platform
[H2] Finance in your product, with no credit risk and no money on your books.
[BodyL] Your users are financed where they already book and document their shipments. You make no credit decisions and hold no money: financiers buy, insurers cover and Kubar runs the programme. Kubar is paid through the programme, not by the platform, and terms with each platform are agreed in writing.

## What the SDK does
[H2] What you embed.
[Tag] Capability | [Tag] What your exporter, or your platform, sees        (two columns; no Status column)
Consented onboarding | Identity and business checks, with consent recorded for each data source
Shipment and document capture | Booking, invoice, inspection report and bill of lading, taken from your own records
Eligibility check | Whether a shipment fits a programme’s rules: buyer country, terms, size and goods
Indicative offer | The all-in price, shown against the exporter’s own alternative
Application and status | Submission, documents outstanding, purchase and settlement
Events for your product | Status updates you can show your users
(first column [UI], the other [BodyS]; at 768 and 390 the rows stack with no column heads)

## From your side
[H2] How it runs on your platform.
Desktop: a five-step register beside three lanes (Your platform, Kubar Protocol filled, The financier; component "Platform lanes", 138:2455). At 768 and 390: the register only.
[Tag] Step | [Tag] What happens
[Code] 01  [Body] Your exporter books and documents a shipment in your platform, as it does today.
[Code] 02  [Body] NavDhan SDK checks the shipment against the programme’s rules and shows an indicative offer.
[Code] 03  [Body] With the exporter’s consent, the shipment data and documents go to Kubar Protocol, which assembles the evidence package.
[Code] 04  [Body] A financier buys the receivable and pays the exporter’s own bank.
[Code] 05  [Body] The buyer pays the financier on the due date. Your platform shows each step as it happens.
Lane labels (desktop): [UI] Your platform, [UI] Kubar Protocol, [UI] The financier; path labels [Tag] NavDhan SDK, With the exporter’s consent, The evidence package, Each step as it happens.
[UI] Follow one receivable, shipment to settlement       (→ /how-it-works)

## Rules
[H2] Rules the SDK follows.
[Code] 01  [Body] Kubar never makes the credit decision, holds the money or carries the credit risk.
[Code] 02  [Body] Consent is collected and recorded for each data source, in line with the Digital Personal Data Protection Act, 2023 and its Rules.
[Code] 03  [Body] Offers show the all-in price and the alternative it’s measured against, with no nudge towards any one financier.
[Code] 04  [Body] Data your platform shares is used only for the exporter’s application and its servicing.

## Behind it
[H2] Your exporters see NavDhan. Kubar Protocol runs behind it.
[BodyL] The programme, the evidence package, insurance and payment matching run on Kubar Protocol, the infrastructure Kubar presents to banks, insurers and funds.
Layer stack (component "Layer stack", 139:2456), top to bottom; Kubar Protocol is the filled layer:
[UI] Your platform              [BodyS] You keep the relationship
  [UI] NavDhan SDK              [BodyS] What you embed            (nested inside Your platform)
[UI] Kubar Protocol             [BodyS] The programme, the evidence package, insurance and payment matching
[UI] Banks, insurers and funds  [BodyS] Financiers buy, insurers cover
[UI] See Kubar Protocol         (→ /products/kubar-protocol)

## Next step
[H2] Talk about an integration.
[BodyL] Tell us about your platform and your exporters, and we’ll take you through what an integration involves.
[UI] Talk about an integration  (filled button → /contact?intent=platform)
