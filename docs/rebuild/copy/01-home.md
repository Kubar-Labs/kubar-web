# Home  ·  route: /

Extracted from Figma, Home · 1440 (frame 160:6), 13 Nov 2026, in reading order. The bracketed tag is the text style (see ../tokens/README.md); "mixed" means the line carries more than one style (a link inside a sentence). Header and footer are in 00-header-footer.md. Hidden sections (Where we are) are not included and must not be built.

## Hero
[Display] Building the institutional exchange¹ for cross-border trade finance.
[UIL] For financial institutions            → /products/kubar-protocol
[UIL] For trade platforms                   → /products/navdhan-sdk
[Tag] Record RCV-0001
[Fine] Illustrative                         (rani, dotted underline; opens "An example receivable, not a real transaction." in place)
[Record] $225,000 rice invoice to a buyer in the UAE, due 75 days after shipment. 90% of face paid at purchase; the balance, less the financier’s discount and charges, when the buyer pays.
[Tag] No.
[Tag] Document
[Tag] Source
[Tag] Status
[Code] 01
[UI] Commercial invoice
[BodyS] The exporter
[State] Filed
[Code] 02
[UI] Shipping bill
[BodyS] Indian Customs
[State] Filed
[Code] 03
[UI] Electronic bill of lading
[BodyS] The carrier
[State] Filed
[Code] 04
[UI] Credit-insurance cover
[BodyS] The insurer, in the financier’s name
[State] Filed
[Code] 05
[UI] Assignment notice, acknowledged
[BodyS] The buyer
[State] Filed
[Code] 06
[UI] Purchase confirmation
[BodyS] The financier
[State] Filed                              (row 06 is current: inset ground, rani marker, rani status)
[Tag] Proves
[BodyS] The financier bought the receivable, without recourse for the buyer’s credit
[Tag] State
[Label] 05 of 08
[Tag] 05 Purchased                          (rani)
[Fine] ¹
[Fine] Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

## The gap
[H2] The missing piece isn’t capital.
[BodyL] Exporters’ paper doesn’t arrive originated, insured and documented in a form a financier can buy again and again. Kubar builds that layer.
[Tag] A year
[Figure] About $80bn
[BodyS] a year of Indian SME and mid-market export receivables is financeable: Kubar’s estimate for FY 2025–26.²
[Tag] In total
[Figure] $126.92M
[BodyS] financed in total on GIFT City’s trade-finance platforms (ITFS): 2,857 transactions to June 2026.³
        (drawing: a full-width 8 px bar for $80bn over a hairline track holding a 1 px tick for $126.92M, both to scale)
[Code] Drawn to scale. $126.92M is about 0.16% of the bar above.
[Fine] ²
[Fine] Kubar’s estimate: India’s merchandise exports in FY 2025–26, $441.78bn (Ministry of Commerce and Industry), × 75% on open-account terms (Kubar’s planning assumption) × 48.55%, the share of MSME-related products in merchandise exports in 2024–25 (Ministry of MSME, in Parliament) × 50% financeable after screens for tenor, insurable buyers and related parties (Kubar’s planning assumption).
[Fine] Back to text
[Fine] ³
[Fine] IFSCA Bulletin, April–June 2026: ITFS transactions in IFSC reached 2,857, with a total value of $126.92M, as of June 2026.
[Fine] Back to text

## One receivable  (the pinned story; see ../HANDOFF.md, Motion)
[H2] Follow one receivable from shipment to settlement.
[Tag] Record RCV-0001
[Fine] Illustrative
[Tag] State
[Label] 05 of 08
[Code] 05
[State] Purchased
[BodyL] The financier buys the receivable, without recourse for the buyer’s credit.
[Tag] Party · Financier
[Tag] Data path · Kubar
[Body] Package delivered; purchase recorded
[Tag] Money path
[Label] Kubar holds none                    (rani)
[Body] The financier pays 90% of face to the exporter’s own bank
[UI] Skip the story                         (anchor to the next section)
[UI] See how it works                       → /how-it-works
[Tag] Data path: documents and records      (legend)
[Tag] Money path: only between banks
[Tag] Kubar: the one filled column
[UI] Exporter
[UI] Kubar                                  (the one filled column: petrol ground, white mark and name)
[UI] Insurer
[UI] Buyer, UAE
[UI] Financier
[UI] Exporter’s bank
[Code] 01 … 08                              (state rows)
[BodyS] Shipment, invoice                   (step 01, data path)
[BodyS] Evidence package checked            (02)
[BodyS] Limit and headroom                  (03)
[BodyS] Acknowledgement                     (04)
[BodyS] Evidence package                    (05, data path)
[BodyS] 90% of face                         (05, money path)

The 1440 frame shows the story at state 05. The text for all eight states is the ledger used at 768 and 390 (and with reduced motion), listed under "Only at 768 and 390" below; the story panel steps through the same eight.

## Band · closing line  (petrol ground)
[Line] Kubar is in the data path of every step and in the money path of none.
[UIL] See how it works                      → /how-it-works

## Foundations first
[H2] An exchange needs more than a venue.
[BodyL] India already runs specialised exchanges for businesses and financial institutions, not the public. At GIFT City, cross-border trade finance has the rules for such an exchange, but not yet the asset. So Kubar builds the foundations first and the venue last.
[Tag] TReDS
[Tag] Indian Energy Exchange
[Tag] GIFT City · ITFS
[Tag] On the exchange
[BodyS] Only banks and other financial institutions permitted by the RBI finance MSME invoices
[BodyS] Distribution companies, generators, traders and large consumers buy and sell electricity
[BodyS] Only institutional financiers would buy export receivables, on Kubar’s planned venue¹
[Tag] The public
[BodyS] Not admitted
[BodyS] Not admitted
[BodyS] Not admitted
[Tag] Today
[BodyS] Running
[BodyS] Running
[BodyS] The rules exist; the asset doesn’t yet          (rani)
[Tag] Five foundations, built from the bottom up
[UIL] The venue, last
[BodyS] An ITFS for institutional financiers only, with Kubar as its neutral operator¹
[Tag] State 08 · Planned¹
[UIL] A record of performance
[BodyS] Every receivable that settles adds to a priced loss history
[Tag] State 07
[UIL] A clean payment path
[BodyS] The buyer pays the financier’s account; the exporter’s bank closes the shipping bill
[Tag] State 06
[UIL] Standing buyers
[BodyS] A financier underwrites a programme once and buys every receivable that fits inside its limit
[Tag] State 05
[UIL] A common standard for what qualifies
[BodyS] Every receivable has a shipping bill, an invoice that names the financier’s account, a buyer on an approved insurance limit and the buyer’s acknowledgement
[Tag] States 02 · 03 · 04
[Fine] ¹
[Fine] Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

## Who takes part
[H2] Who takes part, and what each one does.
[BodyL] Only institutional financiers buy the receivables. There is no retail access.
[Tag] Party
[Tag] Role
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
[BodyS] Pay the financier’s account, on the terms they already have
[BodyS] —
[UI] Kubar                                  (name only: no mark in this row)
[BodyS] Runs the programme: origination, the evidence package, servicing and reporting. No money and no credit risk
[UI] About                                  → /about

## Standing
[H2] Standing and memberships.
[BodyL] Kubar acts as the financier’s origination and servicing agent. It never holds the money or the credit risk.
[Tag] Kind
[Tag] Entry
[Tag] Sandbox
[BodyS] Priority entry to the IFSCA FinTech Innovation Sandbox through GIFT IFIH
[Tag] Membership
[BodyS] Member of FACE, an RBI-recognised self-regulatory organisation for fintech
[Tag] Award
[BodyS] FinVision Award for Most Innovative Startup in Fintech, FinTech Edge 2026, NIBM Pune
[Tag] Award
[BodyS] Winner, Popular Choice Award, Startup Mahakumbh 2025
        (programme rows: logo, name, kind; two lists of three at desktop)
[UI] GIFT IFIH Young Builders Program            [Tag] Programme
[UI] BharatNetra Startup Accelerator (GFTN)      [Tag] Accelerator
[UI] STPI FinGlobe                               [Tag] Incubation
[UI] MeitY GENESIS Entrepreneur in Residence     [Tag] Residency
[UI] T-Hub, RubriX Cohort 5                      [Tag] Incubation
[UI] Pusa Krishi Incubation Programme 2026–27    [Tag] Incubation

## People
[H2] The people building it.
[UI] Vaibhav Sharma        [Tag] Founder and CEO
[UI] Rayansh Srivastava    [Tag] Co-founder and CTO
[UI] Keshav Dudani         [Tag] Founding Engineer
[UI] Manchit Sanan         [Tag] Compliance Lead
[UI] Divyesh Reddy         [Tag] Partnerships Lead
[UI] Kavish Mahajan        [Tag] Creative Director
        (each name links to the person's LinkedIn, external; portraits in colour)
[UIL] Meet the team and advisers           → /about#team

## Contact
[H2] Start the right conversation.
[Tag] If you are
[Tag] Next step
[UI] A bank, finance company, insurer or fund      [UI] Start a programme conversation   → /contact?intent=institution
[UI] A trade platform or marketplace               [UI] Talk about an integration        → /contact?intent=platform
[UI] An investor                                   [UI] Email us                          → mailto:partnerships@kubar.tech
[UI] Press, or anything else                       [UI] Write to us                       → /contact?intent=other

## Technology programmes
[Label] Technology programmes, grants and credits
[Fine] Google for Startups
[Fine] NVIDIA Inception
[Fine] Perplexity for Startups
[Fine] OpenAI for Startups
[Fine] Microsoft for Startups
[Fine] STPI-Intel PRAGATI Accelerator
[Fine] ElevenLabs Grants
[Fine] Amplitude for Startups
[Fine] Polkadot Blockchain Academy
[Fine] Uniswap Hook Incubator
[Fine] Sarvam Startup Program
[Fine] Cloudflare for Startups
[Fine] Claude for Startups
[Fine] MongoDB for Startups

## Only at 768 and 390

Hero, under the display:
[BodyL] Starting with the asset: export receivables an international financier can buy again and again, insured in its own name.
[UI] Follow one receivable                  (anchor to the ledger)

The eight-state ledger (replaces the lanes and story panel at 768 and 390, and everywhere when reduced motion is on). Each state: number, name, what happens, party, data path. Money path cells follow the lanes.
01 Shipped. The exporter ships the rice and invoices the buyer, with the instruction to pay the financier’s account. Party: Exporter. Data path: Kubar. Shipment and invoice data received.
02 Documented. Shipping bill, invoice and bill of lading are checked against each other and filed in one evidence package. Data path: Evidence package assembled and checked.
03 Insured. The buyer’s limit with the insurer is checked; the cover is in the financier’s name. Data path: Limit and headroom confirmed.
04 Acknowledged. The buyer acknowledges that it will pay the financier. Party: Buyer. Data path: Acknowledgement filed.
05 Purchased. The financier buys the receivable, without recourse for the buyer’s credit. Party: Financier. Data path: Package delivered; purchase recorded. Money path: Kubar holds none. The financier pays 90% of face to the exporter’s own bank.
06 Settled. On the due date the buyer pays, and the exporter’s bank closes the shipping bill. Party: Buyer, financier, exporter’s bank. Data path: Payment matched; closure tracked. Money path: The buyer pays the financier’s collection account; the financier pays the exporter the balance, less its discount and charges. (Copy deck 4.2; Vaibhav, 13 Nov 2026: the ledger and the story panel show the settlement payments the lanes diagram draws. The story panel's counter at state 08 reads "08 of 08".)
07 Recorded. The outcome joins the record of how the asset performs. Data path: Added to the loss history.
08 Transferred, later¹. On the venue, a receivable can move to another institutional financier, with a registry entry. [State] Planned (muted).

Verify the per-state party and money-path cells against the Ledger component (Figma 72:554) before building; the extraction above lists them in the order they appear in the frame.

At 768 and 390 the header shows "Menu" in place of the links and "Talk to us"; tables become stacked rows (column heads are not shown; each cell carries its own label where the design shows one).
