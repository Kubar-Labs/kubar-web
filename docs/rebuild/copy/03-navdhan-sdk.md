# NavDhan SDK  ·  route: /products/navdhan-sdk

Extracted from Figma, NavDhan SDK · 1440 (frame 170:6), 13 Nov 2026, in reading order. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md. The "Where it stands" section is removed and must not be built; no "In build" labels anywhere.

## Hero
(14 Nov: the kicker line above the headline is removed. REDRAW-2026-11-14.md, section 3.)
[Display] Trade finance inside the software your exporters already use.
[BodyL] Embed NavDhan SDK and your exporters can check eligibility, apply and be paid for their export receivables without leaving your platform. Financiers buy; Kubar runs the programme; you keep the relationship.
[UI] Talk about an integration                     (filled button → /contact?intent=platform)
(16 Nov: directly under the hero, a strip on the inset ground, "Where this sits": the foundations drawn small with the page's own level in petrol, the sentence and the link, which goes to /#one-receivable. 17 Nov: six foundations, and the level in petrol is Distribution through trade platforms, Figma 310:1331.)
[Fine] Where this sits
[Body] Part of the institutional exchange Kubar is building. NavDhan SDK is its distribution: exporters reach the programme from the platforms they already use, and those platforms’ shipment data is one source for each receivable’s record.
[UI] Follow one receivable through all six         (→ /#one-receivable)
(16 Nov: the names are Home's, the venue's with the marker ¹; no "Planned" in the strip. Phones name only the page's own level. Footnote ¹ shows once on the page, under the strip:)
[Fine] ¹
[Fine] Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

(Build step 6, REDRAW-2026-11-14.md section 12 item 3: the hero carries "What you embed" (see that section below): the H3 and the six capabilities in the left column under the button, beside the sketch; "Eligibility check" is picked from the start.)
(17 Nov, next build step 7: the embed sketch is drawn like the product, Figma 318:1274, the six states on board 316:1377, tablet 320:1661, phone 320:1536. A square platform with the shipment's own records, and inside it the NavDhan SDK widget, which shows the picked row's own screen: its name as the title, its fields with a tick, and a button naming the next part. From 1000 the sketch sits beside the list. Below 1000 the six rows are an accordion, and an open row shows its screen under its sentence: from 768 the whole sketch, on phones the widget alone. The words are the ones below and the rows' own names.)
[Tag] Your platform
(15 Nov, REDRAW-2026-11-14.md section 10: no Illustrative tag on the sketch.)
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
[BodyS] All-in price                       (empty dotted box: no figure; 17 Nov: muted Sans/Fine, in two columns)
[BodyS] The exporter’s own alternative     (empty dotted box: no figure; 17 Nov: muted Sans/Fine, in two columns)
[UIS] Application and status
[BodyS] Submission
[BodyS] Documents outstanding
[BodyS] Purchase                           (current: rani square; 17 Nov: a rani ring on a connected timeline)
[BodyS] Settlement                         (open square; 17 Nov: an open ring, in the secondary colour)
(Build step 6, new strings, Vaibhav, 15 Nov. While "Consented onboarding" is picked, the SDK panel shows three filled marks in place of its content; 17 Nov: the widget's three fields, each with a tick:)
[BodyS] Identity check
[BodyS] Business check
[BodyS] Consent recorded
(While "Events for your product" is picked, a small status shows beside "Invoice" in the Shipment list; 17 Nov: a chip beside "Shipment" in the platform, a rani dot and the word in Sans/UI small:)
[State] Purchased

## For your exporters
(Build step 6, section 13 C1: this and "For your platform" sit side by side as one two-column block from 1200 up, and stacked below that. The words don't change.)
[H2] Dollar finance beyond their bank limit.
[BodyL] Your exporters can sell their export receivables to institutional financiers, beyond the limits their own banks set, without recourse for the buyer’s credit. They keep their own bank, and their buyers keep their terms.

## For your platform
[H2] Finance in your product.
[BodyL] Your users are financed where they already book and document their shipments. You make no credit decisions and hold no money: financiers buy, insurers cover and Kubar runs the programme. Kubar is paid through the programme, not by the platform, and terms with each platform are agreed in writing.

## What the SDK does
(Build step 6, section 12 item 3: this section is removed as a section. Its heading, as an H3, and its six rows sit in the hero beside the sketch. The column heads "Capability" and "What your exporter, or your platform, sees" are gone with the table.)
[H3] What you embed.
Consented onboarding | Identity and business checks, with consent recorded for each data source
Shipment and document capture | Booking, invoice, inspection report and bill of lading, taken from your own records
Eligibility check | Whether a shipment fits a programme’s rules: buyer country, terms, size and goods
Indicative offer | The all-in price, shown against the exporter’s own alternative
Application and status | Submission, documents outstanding, purchase and settlement
Events for your product | Status updates you can show your users
(each row: the capability in [UIL], its sentence under it in muted [BodyS])

## From your side
[H2] How it runs on your platform.
(16 Nov: the page's pinned journey; this link sits above the lanes and goes to the next section.)
[UI] Skip the five steps
(17 Nov, next build step 10: the page's pinned journey, Figma 331:1202. The three lanes pin and the five steps are cards that scroll past them, each with its counter and its sentence; row n of the lanes lights with card n, the lane labels below on the rows. Side by side from 1024; below, the lanes pin above the cards, redrawn narrow on phones. With reduced motion, on a short screen or without script, the register below shows as today.)
[Tag] 01 of 05                                           (the cards' counters, 01 of 05 to 05 of 05)
The register: desktop, a five-step register beside three lanes (Your platform, Kubar Protocol filled, The financier; component "Platform lanes", 138:2455). At 768 and 390: the register only.
(After step 3, REDRAW-2026-11-14.md section 10: the column heads "Step" and "What happens" are cut; they name nothing.)
[Code] 01  [Body] Your exporter books and documents a shipment in your platform, as it does today.
[Code] 02  [Body] NavDhan SDK checks the shipment against the programme’s rules and shows an indicative offer.
[Code] 03  [Body] With the exporter’s consent, the shipment data and documents go to Kubar Protocol, which assembles the evidence package.
[Code] 04  [Body] A financier buys the receivable and pays the exporter’s own bank.
[Code] 05  [Body] On the due date the buyer pays the account on its invoice, and the payment reaches the financier. Your platform shows each step as it happens.
Lane labels (desktop): [UI] Your platform, [UI] Kubar Protocol, [UI] The financier; path labels [Tag] NavDhan SDK, With the exporter’s consent, The evidence package, Each step as it happens.
[UI] See how it works                                    (→ /how-it-works)

## Rules
[H2] Rules the SDK follows.
(Build step 6, REDRAW rule 7: not a sequence, so the numbers 01 to 04 below are not shown.)
[Code] 01  [Body] Kubar never makes the credit decision, holds the money or carries the credit risk.
[Code] 02  [Body] Consent is collected and recorded for each data source, in line with the Digital Personal Data Protection Act, 2023 and its Rules.
[Code] 03  [Body] Offers show the all-in price and the alternative it’s measured against, with no nudge towards any one financier.
[Code] 04  [Body] Data your platform shares is used only for the exporter’s application and its servicing.

## Behind it
[H2] Your exporters see NavDhan. Kubar Protocol runs behind it.
[BodyL] The programme, the evidence package, insurance and payment matching run on Kubar Protocol, the infrastructure Kubar presents to banks, insurers and funds.
Layers · isometric (261:843), top to bottom; Kubar Protocol is the petrol layer, NavDhan SDK a small tile on Your platform:
(After step 3, REDRAW-2026-11-14.md section 10: the four layer descriptions are cut, since each repeats the lead or the hero; the layer names stay.)
[UI] Your platform
  [UI] NavDhan SDK              (nested inside Your platform)
[UI] Kubar Protocol
[UI] Banks, insurers and funds
[UI] See Kubar Protocol         (→ /products/kubar-protocol)

## Next step
(After step 3, REDRAW-2026-11-14.md section 10: the heading repeated the button, so the lead is split.)
[H2] Tell us about your platform and your exporters.
[BodyL] We’ll take you through what an integration involves.
[UI] Talk about an integration  (filled button → /contact?intent=platform)
