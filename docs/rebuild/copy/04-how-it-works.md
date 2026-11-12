# How it works  ·  route: /how-it-works

Extracted from Figma, How it works · 1440 (frame 172:6), 13 Nov 2026, in reading order. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md.

## Hero
[Label] How it works
[Display] From the port to the record.
[BodyL] One illustrative receivable, followed step by step: who does what, the documents behind it and where the money moves. A $225k rice invoice to a buyer in the UAE, due 75 days after shipment.
[Fine] Illustrative
[UIL] For financial institutions     → /products/kubar-protocol
[UIL] For trade platforms            → /products/navdhan-sdk

## The rail  (pinned story, eight steps; see ../HANDOFF.md, Motion)
[H2] What happens to a receivable, in order.
Desktop: the story panel (left) beside the lanes (right), as on Home but with the How it works panel (documents line, Sans/Body). The 1440 frame shows state 06:
[Tag] Record RCV-0001
[Fine] Illustrative
[Tag] State
[Label] 06 of 08
[Code] 06
[State] Settled
[Body] On the due date the buyer pays the financier’s collection account, quoting the receivable’s reference. Kubar matches the payment. The financier pays the exporter the balance, less its discount and charges, and the exporter’s bank closes the shipping bill. Where the exporter qualifies, the government’s interest subvention on export factoring is filed on the financier’s data and paid to the exporter.
[Tag] Documents
[Body] Payment reference; closure of the shipping bill
[Tag] Data path · Kubar
[Body] Payment matched; closure tracked
[Tag] Money path
[Label] Kubar holds none            (rani)
[Body] The buyer pays $225,000 to the financier; the financier pays the exporter the balance, less its discount and charges
[UI] Skip the story                 (anchor past the rail)
Legend: [Tag] Data path: documents and records · Money path: only between banks · Kubar: the one filled column
Lane heads: [UI] Exporter, Kubar (filled), Insurer, Buyer, UAE, Financier, Exporter’s bank
Row numbers: [Code] 01 … 08
Path labels in the lanes: Shipment, invoice (01) · Evidence package checked (02) · Limit and headroom (03) · Acknowledgement (04) · Evidence package and 90% of face (05) · Payment matched, Face value and The balance (06)
[Fine] ¹ Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

The eight states, as the ledger shows them at 768 and 390 (and on desktop with reduced motion). The story panel steps through the same text. Verify each state's party, documents and money cells against the Ledger and Story panel components (Figma 72:554, 119:1280; How it works variants) before building:
01 Shipped. The exporter ships the rice and issues its invoice. The invoice carries the assignment notice: the instruction to pay the financier’s account. Party: The exporter, and its trade platform if it uses one. Data path: Kubar. Shipment and invoice data received. Money path: —
02 Documented. Kubar checks the shipping bill against the invoice (goods, quantity, value and buyer), checks who the exporter and the buyer are, runs the programme’s rules and files everything in one evidence package. The exporter’s bank’s no-objection is on file. Data path: Evidence package assembled and checked.
03 Insured. The buyer’s limit with the insurer is checked for headroom. The cover is in the financier’s name. Data path: Limit and headroom confirmed.
04 Acknowledged. The buyer acknowledges the notice: it will pay the financier’s account. Party: The buyer. Data path: Acknowledgement filed.
05 Purchased. The financier accepts the receivable under its programme limit, without recourse for the buyer’s credit, and pays the purchase price. The credit decision is the financier’s own. Party: The financier. Data path: Package delivered; purchase recorded. Money path: Kubar holds none. The financier pays 90% of face to the exporter’s own bank.
06 Settled. (text as in the 1440 panel above.) Party: The buyer, the financier and the exporter’s bank. Money: into the Financier’s collection account.
07 Recorded. The outcome joins the loss history, by buyer, exporter and commodity. Data path: Added to the loss history.
08 Transferred, later¹. Once the venue is registered, a receivable can move from one institutional financier to another, with a registry entry in place of a fresh assignment. Party: Institutional financiers. [State] Planned (muted).
At 768 and 390 the ledger ends with the line: Kubar is in the data path of every step and in the money path of none.

## The evidence package  (the evidence stack; see Motion)
[H2] Who relies on the record.
[BodyL] The financier buys on it. The insurer prices on it. The exporter’s bank closes the shipping bill against it. And where the exporter qualifies, the government’s interest subvention is filed on it.
Eight document cards that lock into the record one after another (component "Evidence stack", 127:2464); the last card is open:
[Code] Doc 01  [UI] Commercial invoice
[Code] Doc 02  [UI] Shipping bill
[Code] Doc 03  [UI] Bill of lading, electronic where issued
[Code] Doc 04  [UI] Inspection report, where the programme requires one
[Code] Doc 05  [UI] Credit-insurance cover
[Code] Doc 06  [UI] Buyer’s acknowledgement
[Code] Doc 07  [UI] No-objection
[Code] Doc 08  [UI] Purchase confirmation
[Tag] From · The financier
[Body] The financier owns the receivable
The record they lock into:
[Tag] Record RCV-0001 · Evidence package, 8 of 8
[Fine] Illustrative
[BodyS] Commercial invoice · Shipping bill · Bill of lading · Inspection report · Credit-insurance cover · Buyer’s acknowledgement · No-objection · Purchase confirmation   (each with a filled square)
[Tag] State
[Label] 05 of 08
[Code] 05
[State] Purchased                   (rani)
[BodyS] Each element carries its source, its time and who signed it. Any change after signing shows.
[BodyS] The record is built on Corda, a permissioned ledger: one shared record of each receivable, who holds which rights after the purchase, and its payment and loss history.
(No "In build" label under the Corda line: removed.)

## The money path
[H2] Where the money moves.
Same drawing as Kubar Protocol (component "Money path", 120:1167):
[UI] Kubar · Buyer, UAE · Financier · Exporter’s bank
[BodyS] Purchase price, at purchase (90% of face)
[BodyS] Face value, on the due date
[BodyS] Deferred purchase price: the balance, less discount and charges
[Tag] No account, no payment, no release
[BodyS] Every payment carries the receivable’s reference, and Kubar matches each one to its receivable.

## If a buyer doesn’t pay
[H2] If a buyer doesn’t pay, the financier claims under its own policy.
[BodyL] Kubar flags the late payment straight away, checks with the exporter for any dispute and sends the insurer the notices the policy requires. The financier, as the insured, lodges the claim with the evidence package behind it. The exporter answers only for its own side of the trade: disputes, returns, set-off, fraud and its warranties. Kubar holds none of the risk.
A ruled register (component "If a buyer doesn’t pay", 133:2422), no boxes or arrows:
[Tag] If a buyer doesn’t pay
01 | Kubar | Flags the late payment straight away
02 | Kubar | Checks with the exporter for any dispute
03 | Kubar | Sends the insurer the notices the policy requires
04 | The financier, as the insured | Lodges the claim with the evidence package behind it | No dispute
05 | The insurer | Pays claims on the covered share | No dispute
06 | The exporter | Answers only for its own side of the trade: disputes, returns, set-off, fraud and its warranties | A dispute
(number [Label], party [Tag], step [BodyS], branch [Label] in rani, right-aligned)
[Label] Kubar holds none of the risk     (a plain sentence under the register, rani; no chip)
[BodyS] This is how a programme runs with cover in the financier’s name. Where a programme starts on exporters’ own policies, the terms are set out before any receivable is sold.

## Who does what
[H2] Each party signs for its own part.
[Tag] Party | [Tag] Does | [Tag] Signs
Financier | Sets the programme limit, decides credit, buys each receivable, holds the policy and the collection account | Programme terms; the mandate to Kubar; a purchase agreement with each exporter; the insurance policy
Insurer | Approves buyer limits; pays claims on the covered share | The policy, with the financier
Exporter | Ships, invoices with the assignment notice, keeps its own bank | The purchase agreement; Kubar’s services agreement
Exporter’s bank | Gives its no-objection; closes the shipping bill | Its no-objection
Buyer | Acknowledges the notice; pays the financier’s account | Its acknowledgement
Trade platform | Brings exporters and their shipment data through NavDhan SDK | Its agreement with Kubar
Kubar | Designs the pool, checks and documents each receivable, matches payments, services and reports | The mandate from the financier
(first column [UI], the others [BodyS])
[UI] Who holds what                 → /products/kubar-protocol#who-holds-what

## Terms  (glossary; each term is also the target of first-use abbreviation tooltips across the site)
[H2] The terms on this site.
[Tag] Term | [Tag] Meaning
Receivable | The amount an overseas buyer owes an exporter under a shipped invoice.
Financier | The institution that buys the receivable: for Programme 1, a bank’s unit at GIFT City; on Kubar’s own venue¹, other institutional financiers, in GIFT City or abroad.
Institutional financier | A bank, finance company or other institution that finances trade. Only institutional financiers buy the receivables.
Programme | One underwriting for many receivables: the financier’s limit, the rules for what qualifies, the insurance, the mandate to Kubar and the payment path.
Programme limit | The amount a financier sets for a programme. Each receivable that fits is bought inside it, without a new credit decision.
Without recourse for the buyer’s credit | If the buyer doesn’t pay, the financier can’t turn to the exporter, except for disputes, returns, set-off, fraud or the exporter’s own breach.
Purchase price | What the financier pays at purchase: 90% of face in the illustration.
Deferred purchase price | The balance, less the financier’s discount and charges, paid when the buyer pays.
Assignment notice | The instruction on the invoice telling the buyer to pay the financier’s account.
Collection account | The financier’s own account, into which the buyer pays.
Evidence package | One record per receivable that the financier buys on, the insurer prices on and the exporter’s bank closes the shipping bill against.
Shipping bill | The customs document under which goods are cleared for export from India.
EDPMS | The RBI’s Export Data Processing and Monitoring System, in which the exporter’s bank records each shipping bill until the export proceeds arrive.
AD bank | Authorised Dealer bank: the exporter’s own bank for foreign exchange.
Credit insurance | Cover against a buyer’s failure to pay, on limits the insurer sets for each buyer.
Loss history | The record of how each receivable paid, by buyer, exporter and commodity.
GIFT City | India’s international financial services centre, in Gujarat.
IFSC Banking Unit (IBU) | A bank’s unit in GIFT City, working in foreign currency.
ITFS | An International Trade Finance Service platform at GIFT City, on which several financiers can finance trade. Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
(term [UI], meaning [BodyS])

## Next step  (two routes, no heading)
[Tag] For financial institutions
[UIL] Start a programme conversation      → /contact?intent=institution
[Tag] For trade platforms
[UIL] Talk about an integration           → /contact?intent=platform
