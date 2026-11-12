# Kubar Protocol  ·  route: /products/kubar-protocol

Extracted from Figma, Kubar Protocol · 1440 (frame 167:6), 13 Nov 2026, in reading order, after the last status words were removed that night. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md.

## Hero
[Label] Kubar Protocol · For banks, finance companies, insurers and funds      (kept: names who the page is for)
[Display] Underwrite once. Buy every receivable that fits.
[BodyL] Kubar runs the programme around your limit: origination, the evidence package, the data your insurer needs and the matching of every payment. You buy each receivable without recourse for the buyer’s credit, insured in your own name.
[UI] Start a programme conversation                  (filled button → /contact?intent=institution)
[UI] Follow one receivable, shipment to settlement   (→ /how-it-works)

## What you buy
[H2] An export receivable, with everything behind it.
[Tag] Receivable RCV-0001
[Fine] Illustrative
[Tag] Face value                 [BodyS] $225,000
[Tag] Goods                      [BodyS] Rice, shipped from India
[Tag] Buyer                      [BodyS] An importer in the UAE, on an approved insurance limit
[Tag] Terms                      [BodyS] Open account, due 75 days after shipment
[Tag] Purchase price             [BodyS] 90% of face, paid at purchase to the exporter’s own bank
[Tag] Deferred purchase price    [BodyS] The balance, less your discount and charges, paid when the buyer pays
[Tag] Recourse                   [BodyS] None for the buyer’s credit; the exporter answers for disputes, returns, set-off and fraud
[Tag] Cover                      [BodyS] Credit insurance on the buyer, in your name
[Tag] Payment                    [BodyS] The buyer pays your collection account
[Tag] Evidence                   [BodyS] One package, with your own read access
[Fine] Illustrative: an example receivable, not a real transaction.

Beside it, the money timeline (drawn to scale on a day axis; Figma component "Money timeline", 123:1184):
[Tag] When the money moves · your side
[Label] Kubar holds none                (rani)
[Tag] Received
[Tag] Paid out
[BodyS] $225,000 · face value, from the buyer, into your collection account
[BodyS] $202,500 · the purchase price, 90% of face, to the exporter’s bank
[BodyS] Meanwhile you carry the buyer’s credit, insured in your name
[BodyS] The deferred purchase price: the balance (10% of face), less your discount and charges, to the exporter. Its amount depends on pricing, so it has no figure.     (dotted box, no figure)
[Code] Shipment · day 0
[Code] Purchase
[Code] Due date · day 75
[Fine] Days after shipment. The purchase date is illustrative: it follows the documents, the insurer’s limit check and the buyer’s acknowledgement.

At 768 and 390 the timeline is a stacked register; its labels there: "Day 0", "Paid out · at purchase", "Received · day 75", "Paid out · later", "Meanwhile", "Day 75", and the receiving account is named "Financier’s collection account".

## How a programme runs
[H2] How a programme runs.
Two ruled registers side by side at desktop (Set up once, 440 wide; Then, for every receivable, the rest); stacked at 768 and 390. No boxes or arrows.
[Tag] Set up once
[Code] 01  [BodyS] Kubar proposes the pool and its rules                                  [Tag] Kubar, to you
[Code] 02  [BodyS] You agree the terms and set a programme limit                          [Tag] You
[Code] 03  [BodyS] The insurer approves limits on the buyers, in your name                [Tag] The insurer
[Code] 04  [BodyS] You appoint Kubar as your origination and servicing agent              [Tag] You, to Kubar
[Code] 05  [BodyS] Exporters join: identity checks, their bank’s no-objection, a notice on their invoices   [Tag] Kubar and exporters
[Code] 06  [BodyS] Buyers are told to pay your account, and acknowledge it                [Tag] Buyers
[UI] See every step in detail                                                           (→ /how-it-works)
[Tag] Then, for every receivable · limit set
[Code] 01  [BodyS] The exporter, or its platform, submits the shipment                    [Tag] Exporter
[Code] 02  [BodyS] Kubar checks it against the programme’s rules and assembles the evidence package   [Tag] Kubar
[Code] 03  [BodyS] You accept it under your limit                                         [Tag] You
           [BodyS] The credit decision is yours; Kubar can’t override it.               (note with a 2 px rani rule on its left)
[Code] 04  [BodyS] You pay the purchase price; the buyer pays you on the due date; you pay the exporter the balance   [Tag] You and the buyer
[Code] 05  [BodyS] The outcome enters the loss history                                    [Tag] Kubar
[Code] RCV-0001 · RCV-0002 · RCV-0003 · …
[BodyS] Every receivable that fits, inside your limit
[Fine] Illustrative

## The evidence package
[H2] Every element traces to a system the exporter doesn’t control.
[BodyL] Financiers have lost money on paper they couldn’t verify. So each receivable comes with one record: you buy on it, the insurer prices on it, and the exporter’s bank closes the shipping bill against it.
Drawing (desktop only; component "Evidence sources", 130:2584): ten elements, each with its source, joined by dashed data-path stubs to one spine and one arrow into the record.
[BodyS] Identity of the exporter and the buyer                       [Tag] From Government registries; screening
[BodyS] Commercial invoice, with the instruction to pay you          [Tag] From The exporter
[BodyS] Shipping bill                                                [Tag] From Indian Customs
[BodyS] Bill of lading, electronic where the carrier issues one      [Tag] From The carrier
[BodyS] Inspection report, where the programme requires one          [Tag] From The inspection agency
[BodyS] Insurance limit                                              [Tag] From The insurer
[BodyS] Buyer’s acknowledgement                                      [Tag] From The buyer
[BodyS] No-objection                                                 [Tag] From The exporter’s bank
[BodyS] Programme checks                                             [Tag] From Kubar
[BodyS] Purchase and settlement                                      [Tag] From You and the exporter’s bank
[Tag] Record RCV-0001
[Fine] Illustrative
[Body] You buy on it
[Body] The insurer prices on it
[Body] The exporter’s bank closes the shipping bill against it
Register (all sizes):
[Tag] Element | [Tag] From | [Tag] Checked against
Identity of the exporter and the buyer | Government registries; screening | Kubar’s checks, kept on file
Commercial invoice, with the instruction to pay you | The exporter | The shipping bill; the e-invoice reference where one applies
Shipping bill | Indian Customs | The invoice: goods, quantity, value and buyer
Bill of lading, electronic where the carrier issues one | The carrier | The shipped-on-board date and vessel
Inspection report, where the programme requires one | The inspection agency | The report’s reference
Insurance limit | The insurer | Headroom on the buyer’s limit
Buyer’s acknowledgement | The buyer | Signatory, date and channel
No-objection | The exporter’s bank | The bank’s letter
Programme checks | Kubar | Eligibility, concentration, sanctions and related-party results
Purchase and settlement | You and the exporter’s bank | Payment references; the closure of the shipping bill
(first column [UI], the others [BodyS])
[BodyS] Each element carries its source, its time and who signed it, and any change after signing shows. You and the insurer each get your own read access.
[BodyS] The record is built on Corda, a permissioned ledger: one shared record of each receivable, who holds which rights after the purchase, and its payment and loss history.

## Insurance
[H2] Cover in your name, on approved buyers.
[BodyL] The credit-insurance policy is yours: you are the insured, on buyer limits the insurer approves. Kubar insures nothing. It gives the insurer what it needs to set and keep those limits: the pool, each receivable as it’s bought and how each one paid. No receivable is bought without headroom on an approved limit.

## The payment path
[H2] The money moves only between banks.
Drawing (component "Money path", 120:1167; shared with How it works): four parties, Kubar filled and off to the side, solid money arrows only between the three banks' columns.
[UI] Kubar
[UI] Buyer, UAE
[UI] Financier
[UI] Exporter’s bank
[BodyS] Purchase price, at purchase (90% of face)
[BodyS] Face value, on the due date
[BodyS] Deferred purchase price: the balance, less discount and charges
[Tag] No account, no payment, no release           (under Kubar; plain words, no chip)
[BodyS] Every payment carries the receivable’s reference, and Kubar matches each one to its receivable.

## The loss history
[H2] Every receivable that settles adds to a priced loss history.
[BodyL] Recorded by buyer, exporter and commodity, it lets an insurer price the pool, and it brings in the next financier.

## Who holds what
[H2] You hold the receivable, the policy and the account.
[Tag] Party | [Tag] Holds | [Tag] Doesn’t hold
You, the financier | The receivable, the collection account, the insurance policy and the buyer’s credit risk | Recourse to the exporter for the buyer’s credit
The insurer | The buyer’s credit risk on the covered share | Dispute or fraud risk
The exporter | Disputes, returns, set-off and fraud on its own trades | The receivable, once sold
The exporter’s bank | Its relationship with the exporter | The receivables sold
Kubar | Origination, the evidence package, servicing and reporting | Money or credit risk
(first column [UI], the others [BodyS])

## Questions  (disclosure list: question opens its answer in place)
[H2] Questions a credit committee asks.
[UIL] What am I buying?
[Body] An export receivable: the amount an overseas buyer owes an Indian exporter under a shipped invoice. You buy it outright, inside your programme limit, without recourse for the buyer’s credit.
[UIL] Who carries the buyer’s credit, and who carries disputes?
[Body] You carry the buyer’s credit, insured in your name. The exporter carries disputes, returns, set-off and fraud, and answers for its own warranties.
[UIL] Is the cover in my name?
[Body] Yes. In a programme the credit-insurance policy is in your name, on buyer limits the insurer approves. Until that policy is signed, a programme can start on exporters’ own policies with claims assigned to you; we say which applies before you buy anything.
[UIL] Who holds the money?
[Body] You do. The buyer pays your collection account, and you pay the exporter’s account at its own bank. Kubar never holds an account, receives a payment or releases funds.
[UIL] How do I know the shipment and the invoice are real?
[Body] Each element of the evidence package comes from a system the exporter doesn’t control: Indian Customs for the shipping bill, the carrier for the bill of lading, the insurer for the limit, the buyer for its acknowledgement and the exporter’s bank for its no-objection. Kubar checks them against each other before anything is offered to you.
[UIL] Who is Kubar, and under what mandate does it act?
[Body] Kubar Labs is the brand of Kubar Protocol Private Limited, founded in India in 2024. Under a written mandate from you, Kubar designs the pool and its rules, checks and documents each receivable, services it and reports. The purchase runs on your licence and your credit policies; Kubar never makes the credit decision, holds money or carries credit risk. Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[UIL] What happens if a buyer doesn’t pay?
[Body] Kubar flags the late payment, checks with the exporter for any dispute and sends the notices your policy requires. As the insured, you lodge the claim under your policy, with the evidence package behind it. The exporter answers only for its own side of the trade: disputes, returns, set-off, fraud and its warranties.
[UIL] What do I sign?
[Body] Programme terms on your own paper (the rules, your limit, the caps and the reporting); a mandate appointing Kubar as your origination and servicing agent; the credit-insurance policy, between you and the insurer; and a receivables purchase agreement with each exporter in the programme.
[UIL] How is Kubar paid?
[Body] By a fee from you and a fee from the exporter, for running the programme. Kubar earns nothing from holding money or credit risk.
[UIL] Can individuals invest?
[Body] No. Only institutional financiers buy the receivables. There is no retail access, and nothing on this site is an offer to the public.

## Where you fit
[H2] Where each institution fits.
[Tag] Institution | [Tag] Role                         (the Status column is removed)
Banks’ units at GIFT City (IFSC Banking Units) | Programme financier: set a limit and buy every receivable that fits
IFSC finance companies and factors | Programme financier; later, a lane for smaller receivables held on a finance company’s balance sheet
Banks, factors and finance companies abroad | Bid for programmes on Kubar’s own venue once it is registered¹, with no entity at GIFT City, if they meet its admission rules
Credit insurers | Cover the buyers in the financier’s name, with the evidence behind every receivable and a loss history over time
Funds | Later, buying receivables from financiers
(first column [UI], the other [BodyS])

## Programme 1
[H2] Programme 1: rice, to buyers in the UAE and the Gulf.
[Tag] Field | [Tag] Entry                         (the Status row is removed)
Exporters | Indian rice exporters
Buyers | Importers in the UAE and the wider Gulf, on approved insurance limits
Terms | Open account
Financier | A bank’s unit at GIFT City. In discussions with IBUs
Cover | Credit insurance on the buyers, in the financier’s name
Next | Chemicals and pharmaceutical formulations, then engineering goods and auto components
(labels [Tag], entries [BodyS])

## The venue
[H2] The venue comes last.
[Body] Kubar’s own ITFS, once registered¹, is meant to do three things the programmes can’t:
[State] Planned                                  (muted; the one status word kept on the site, with its footnote)
[Code] 01  [Body] Admit institutional financiers beyond banks’ units at GIFT City, including those with no presence there
[Code] 02  [Body] Keep a registry so a receivable can change hands without a fresh assignment each time
[Code] 03  [Body] Give insurers, rating agencies and funds a neutral operator’s record to rely on
[BodyS] Like the programmes, it is for institutional financiers only.
[Fine] ¹
[Fine] Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

## Next step
[H2] Start a programme conversation.
[BodyL] Tell us what you finance today, and we’ll take you through how a programme would run for you.
[UI] Start a programme conversation              (filled button → /contact?intent=institution)
[BodyS] Or email
[UI] partnerships@kubar.tech                     (mailto)
