# Home  ·  route: /

Extracted from Figma, Home · 1440 (frame 160:6), 13 Nov 2026, in reading order. The bracketed tag is the text style (see ../tokens/README.md); "mixed" means the line carries more than one style (a link inside a sentence). Header and footer are in 00-header-footer.md. Hidden sections (Where we are) are not included and must not be built.

## Hero
(15 Nov, REDRAW-2026-11-14.md section 13 B: the two figure captions in The gap are Sans/Body; "Drawn to scale…" is Sans/Fine, not mono; "Skip the story" has no arrow.)
[Display] Building the institutional exchange¹ for cross-border trade finance.
(16 Nov: the hero has a subline directly under the headline at every width; it replaces "Starting with the asset…". Figma 340:3704 at 1440, 166:3367 at 768, 162:1313 at 390. Below the laptop width the order is headline, subline, picture, routes. No other hero has a subline.)
[BodyL] Indian export receivables, originated, insured and documented so an international financier can buy them again and again.
[UIL] For financial institutions            → /products/kubar-protocol
[UIL] For trade platforms                   → /products/navdhan-sdk
(16 Nov: the hero stays the record, now with eight documents so it matches How it works and leads into it. Figma 245:3225 at 1440, 248:3239 at 768, 353:3704 at 390. Eight sheets, 08 on top and current, with "FILED" on the top sheet only. Eight rows beside them, one line each: number and name. Under the sheets, for the picked document, "From" and "Proves", then the link; 08 is picked on load. Its accessible description: "An example record of one export receivable, with eight documents filed.")
[Tag] Record RCV-0001
[Record] An example: a $225,000 rice invoice to a buyer in Singapore, due 75 days after shipment.
[Code] 01
[UI] Commercial invoice
[Code] 02
[UI] Shipping bill
[Code] 03
[UI] Bill of lading
[Code] 04
[UI] Inspection report
[Code] 05
[UI] No-objection
[Code] 06
[UI] Credit-insurance cover
[Code] 07
[UI] Sweep instruction                      (17 Nov: the payment model's document 07; see the note under the list below)
[Code] 08
[UI] Purchase confirmation
[State] Filed                              (on the top sheet, 08, only)
[Fine] From
[BodyS] The financier
[Fine] Proves
[BodyS] The financier bought the receivable, without recourse for the buyer’s credit
[UI] See how it works                      → /how-it-works
Each document's source and what it proves, shown under the sheets when its row is picked:
01 Commercial invoice | The exporter | What was sold, to whom, for how much and when it’s due, and the collection account the buyer pays
02 Shipping bill | Indian Customs | The goods were cleared for export, as invoiced
03 Bill of lading | The carrier | The goods were shipped on board
04 Inspection report | The inspection agency | The goods are as contracted, where the programme requires a check
05 No-objection | The exporter’s bank | The exporter’s bank has no claim on this receivable
06 Credit-insurance cover | The insurer, in the financier’s name | The buyer’s credit is covered, in the financier’s name
07 Sweep instruction | The payment provider | Each payment into the collection account passes to the financier; the exporter can’t redirect it
08 Purchase confirmation | The financier | The financier bought the receivable, without recourse for the buyer’s credit
(17 Nov, the payment model: the buyer pays a collection account in the exporter’s name, shown on the invoice, and a standing sweep passes each payment to the financier; the exporter can’t redirect it. Nothing is asked of the buyer; the step before purchase is the exporter’s bank’s no-objection. The record stays at eight documents.)
(After step 3, REDRAW-2026-11-14.md section 10: "05 Purchased" under the record is cut.)
(14 Nov: the record's summary is one sentence and "State 05 of 08" is gone. The status footnote ¹ is no longer in the hero; marker ¹ on "exchange" links to the one under the foundations. REDRAW-2026-11-14.md, sections 6 and 9.6.)

## The gap
[H2] The missing piece isn’t capital.
[BodyL] Exporters’ paper doesn’t arrive originated, insured and documented in a form a financier can buy again and again. Kubar builds that layer.
(After step 3, REDRAW-2026-11-14.md section 10: "A year" and "In total" are cut; the sentences under the figures say it.)
[Figure] About $80bn
[BodyS] a year of Indian SME and mid-market export receivables is financeable: Kubar’s estimate for FY 2025–26.²
[Figure] $126.92M
[BodyS] financed in total on GIFT City’s trade-finance platforms (ITFS): 2,857 transactions to June 2026. The average transaction was about $44k.³      (17 Nov: the last sentence added; the footnote is unchanged)
        (drawing: a full-width 8 px bar for $80bn over a hairline track holding a 1 px tick for $126.92M, both to scale)
[Code] Drawn to scale. $126.92M is about 0.16% of the bar above.
[UI] How we estimate this                  (a disclosure link with a plus; footnote ² opens under it. New words, approved 14 Nov)
[Fine] ²
[Fine] Kubar’s estimate: India’s merchandise exports in FY 2025–26, $441.78bn (Ministry of Commerce and Industry), × 75% on open-account terms (Kubar’s planning assumption) × 48.55%, the share of MSME-related products in merchandise exports in 2024–25 (Ministry of MSME, in Parliament) × 50% financeable after screens for tenor, insurable buyers and related parties (Kubar’s planning assumption).
[Fine] Back to text
[Fine] ³
[Fine] IFSCA Bulletin, April–June 2026: ITFS transactions in IFSC reached 2,857, with a total value of $126.92M, as of June 2026.
[Fine] Back to text

## One receivable  (the pinned story; see ../HANDOFF.md, Motion)
[H2] Follow one receivable from shipment to settlement.
(16 Nov: the section's lead, beside the heading; it was the band's line.)
[BodyL] Kubar is in the data path of every step and in the money path of none.
(14 Nov, option B: only the lanes drawing is pinned; each state is a card that scrolls past it, so the panel's "State" label goes and each card carries its own counter, "05 of 08". REDRAW-2026-11-14.md, section 3a.)
(After step 3, REDRAW-2026-11-14.md section 10: "Illustrative" is cut from the story; each card's state word loses its number; the "Party ·" line and the story's own "See how it works" link are cut, since the band right after it has the same link.)
[Tag] Record RCV-0001
[State] Purchased
[Label] 05 of 08
[BodyL] The financier buys the receivable, without recourse for the buyer’s credit.
[Tag] Data path · Kubar
[Body] Package delivered; purchase recorded
[Tag] Money path
[Label] Kubar holds none                    (secondary colour; rule 11.4)
[Body] The financier pays 90% of face to the exporter’s own bank
[UI] Skip the story                         (anchor to the next section)
(14 Nov: the story panel's three-line legend is removed; its data and money lines move to the Who takes part map.)
[UI] Exporter
[UI] Kubar                                  (the one filled column: petrol ground, white mark and name)
[UI] Insurer
[UI] Buyer, Singapore                       (16 Nov: the example's buyer is in Singapore. Where a lane head is too narrow for one line it takes two, "Buyer," over "Singapore"; the type is never shrunk and the word never cut)
[UI] Financier
[UI] Exporter’s bank
[Code] 01 … 08                              (state rows)
[BodyS] Shipment, invoice                   (step 01, data path)
[BodyS] Evidence package checked            (02)
[BodyS] Limit and headroom                  (03)
[BodyS] No-objection                        (04; 17 Nov: its dashed arrow runs from the Exporter’s bank to Kubar)
[BodyS] Evidence package                    (05, data path)
[BodyS] 90% of face                         (05, money path)

The 1440 frame shows the story at state 05. The text for all eight states is the ledger used at 768 and 390 (and with reduced motion), listed under "Only at 768 and 390" below; the story panel steps through the same eight.

## Band · closing line  (petrol ground)
(16 Nov: a new line; the old one is the story section's lead. The link stays.)
[Line] Every receivable that settles adds to a priced loss history, and that history is what brings in the next financier.
[UIL] See how it works                      → /how-it-works

## Foundations first
[H2] An exchange needs more than a venue.
[BodyL] India already runs specialised exchanges for businesses and financial institutions, not the public. At GIFT City, cross-border trade finance has the rules for such an exchange, but not yet the asset. So Kubar builds the foundations first and the venue last.
[Tag] TReDS
[Tag] Indian Energy Exchange
[Tag] GIFT City · ITFS
(After step 3, REDRAW-2026-11-14.md section 10: "On the exchange" is cut; "Today" stays.)
[BodyS] Only banks and other financial institutions permitted by the RBI finance MSME invoices
[BodyS] Distribution companies, generators, traders and large consumers buy and sell electricity
[BodyS] Only institutional financiers would buy export receivables, on Kubar’s planned venue¹
[Tag] Today
[BodyS] Running
[BodyS] Running
[BodyS] The rules exist; the asset doesn’t yet          (rani)
(After step 3, REDRAW-2026-11-14.md section 10: the panel title over the blocks is cut.)
(17 Nov: six foundations, top to bottom; distribution is new, between the venue and the record. Figma 246:3160: at 1440 the sentences run to three lines, so each label sits 14 px under the one above and its leader takes a short 45° dogleg into the title.)
[UIL] The venue, last
[BodyS] An ITFS for institutional financiers only, with Kubar as its neutral operator¹
[Tag] Planned¹                              (secondary colour; the marker is rani)
[UIL] Distribution through trade platforms
[BodyS] Exporters rarely come to a trade-finance platform on their own. NavDhan SDK takes the programme into the trade platforms they already use, and brings the trading history between exporter and buyer with it.
[UIL] A record of performance
[BodyS] Every receivable that settles adds to a priced loss history
[UIL] A clean payment path
[BodyS] A buyer won’t change how it pays because its supplier sold the invoice. The buyer pays a collection account in the exporter’s name; a standing sweep passes the payment to the financier, and the exporter’s bank closes the shipping bill.
[UIL] Standing buyers
[BodyS] No international financier underwrites one invoice at a time. Here it underwrites a programme once and buys every receivable that fits inside its limit.
[UIL] A common standard an insurer can price
[BodyS] An insurer can’t price cover on an invoice alone. Every receivable carries one record, from shipment to settlement: its documents, the buyer’s insurance limit and how it paid.
[Fine] ¹
[Fine] Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

## Who takes part
[H2] Who takes part.
[BodyL] Only institutional financiers buy the receivables. There is no retail access.
(14 Nov: the register becomes a map of six cards, so its column heads "Party" and "Role" are not shown, and Buyers' "—" goes. The legend is under the cards.)
[UI] Financiers
[BodyS] Set a programme limit once, then buy every receivable that fits, insured in their own name
[UI] For financial institutions             → /products/kubar-protocol
[UI] Credit insurers
[BodyS] Cover approved buyers in the financier’s name, with the evidence behind each receivable
[UI] For financial institutions             → /products/kubar-protocol
[UI] Trade platforms
[BodyS] Bring their exporters and shipment data through NavDhan SDK
[UI] For trade platforms                    → /products/navdhan-sdk
[UI] Exporters
[BodyS] Ship, invoice and keep their own banks
[UI] How it works                           → /how-it-works
[UI] Buyers
[BodyS] Pay the account on the invoice, on the terms they already have; nothing new to sign
[UI] Kubar                                  (name only: no mark in this row)
[BodyS] Runs the programme: origination, the evidence package, servicing and reporting. No money and no credit risk
[UI] About                                  → /about
[Fine] Money path: never through Kubar      (legend: solid line)
[Fine] Data path: documents and records     (legend: dashed line)

## Standing
[H2] Standing and memberships.
(14 Nov: the lead under the heading is removed on Home; it stays on About. The register becomes four statements, so its column heads "Kind" and "Entry" are not shown; each kind stays as a small label.)
(After step 3, REDRAW-2026-11-14.md section 10: the kind labels Sandbox, Membership, Award and Award are cut; each statement starts with the same thing.)
[BodyS] Priority entry to the IFSCA FinTech Innovation Sandbox through GIFT IFIH
[BodyS] Member of FACE, an RBI-recognised self-regulatory organisation for fintech
[BodyS] FinVision Award for Most Innovative Startup in Fintech, FinTech Edge 2026, NIBM Pune
[BodyS] Winner, Popular Choice Award, Startup Mahakumbh 2025
        (programme marks: logo and name, six in one row at desktop; no kind labels from 14 Nov)
[UI] GIFT IFIH Young Builders Program
[UI] BharatNetra Startup Accelerator (GFTN)
[UI] STPI FinGlobe
[UI] MeitY GENESIS Entrepreneur in Residence
[UI] T-Hub, RubriX Cohort 5
[UI] Pusa Krishi Incubation Programme 2026–27

## People
[H2] The people building it.
[UI] Vaibhav Sharma        [Tag] Founder and CEO
[UI] Rayansh Srivastava    [Tag] Co-founder and CTO
[UI] Keshav Dudani         [Tag] Founding Engineer
[UI] Manchit Sanan         [Tag] Compliance Lead
[UI] Divyesh Reddy         [Tag] Partnerships Lead
[UI] Kavish Mahajan        [Tag] Creative Director
        (each name links to the person's LinkedIn, external; portraits greyscale at rest, in colour on hover or focus)
[UIL] Meet the team and advisers           → /about#team

## Contact
[H2] Start the right conversation.
(14 Nov: the first two routes become cards and the last two small link rows, so the column heads "If you are" and "Next step" are not shown.)
[UI] A bank, finance company, insurer or fund      [UI] Start a programme conversation   → /contact?intent=institution
[UI] A trade platform or marketplace               [UI] Talk about an integration        → /contact?intent=platform
[UI] An investor                                   [UI] Email us                          → mailto:partnerships@kubar.tech
[UI] Press, or anything else                       [UI] Write to us                       → /contact?intent=other

## Technology programmes
(15 Nov, REDRAW-2026-11-14.md section 13 B4: this section is removed from Home. The logos stay on About only; the list now lives in copy/05-about.md.)

## Only at 768 and 390

Hero, under the display:
(16 Nov: the subline is the same at every width now; see the Hero section above. The page's meta description and the social card carry the same sentence.)
[UI] Follow one receivable                  (anchor to the story; below 1024 only, under the routes)

The eight-state ledger (replaces the lanes and story panel at 768 and 390, and everywhere when reduced motion is on). Each state: number, name, what happens, party, data path. Money path cells follow the lanes.
01 Shipped. The exporter ships the rice and invoices the buyer, with its collection account on the invoice. Party: Exporter. Data path: Kubar. Shipment and invoice data received.
02 Documented. Shipping bill, invoice and bill of lading are checked against each other and filed in one evidence package. Data path: Evidence package assembled and checked.
03 Insured. The buyer’s limit with the insurer is checked; the cover is in the financier’s name. Data path: Limit and headroom confirmed.
04 No-objection. The exporter’s bank confirms it has no objection to the sale. Party: Exporter’s bank. Data path: No-objection filed.
05 Purchased. The financier buys the receivable, without recourse for the buyer’s credit. Party: Financier. Data path: Package delivered; purchase recorded. Money path: Kubar holds none. The financier pays 90% of face to the exporter’s own bank.
06 Settled. On the due date the buyer pays the collection account on its invoice, and the exporter’s bank closes the shipping bill. Party: Buyer, financier, exporter’s bank. Data path: Payment matched; closure tracked. Money path: The buyer pays the exporter’s collection account; the sweep passes it to the financier, which pays the exporter the balance, less its discount and charges. (Copy deck 4.2; Vaibhav, 13 Nov 2026: the ledger and the story panel show the settlement payments the lanes diagram draws. The story panel's counter at state 08 reads "08 of 08".)
07 Recorded. The outcome joins the record of how the asset performs. Data path: Added to the loss history.
08 Transferred, later¹. On the venue, a receivable can move to another institutional financier, with a registry entry. [State] Planned (muted).

Verify the per-state party and money-path cells against the Ledger component (Figma 72:554) before building; the extraction above lists them in the order they appear in the frame.

At 768 and 390 the header shows "Menu" in place of the links and "Talk to us"; tables become stacked rows (column heads are not shown; each cell carries its own label where the design shows one).
