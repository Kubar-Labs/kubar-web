# How it works  ·  route: /how-it-works

Extracted from Figma, How it works · 1440 (frame 172:6), 13 Nov 2026, in reading order. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md.

## Hero
(15 Nov, REDRAW-2026-11-14.md section 12 item 5: under the hero, an "On this page" row with each section as an anchor link, in the words a visitor sees, never an internal section name (Vaibhav, 15 Nov): What happens to a receivable · Where the money moves · If a buyer doesn’t pay · Each party signs · The terms.)
(14 Nov: the kicker line above the headline is removed. REDRAW-2026-11-14.md, section 3.)
(Build step 5: the words sit beside "Eight states · isometric steps" (258:1829), eight blocks numbered 01 to 08, 08 in petrol; the numbers are part of the drawing.)
[Display] From the port to the record.
[BodyL] One illustrative receivable, followed step by step: who does what, the documents behind it and where the money moves. A $225k rice invoice to a buyer in Singapore, due 75 days after shipment.
(After step 3, REDRAW-2026-11-14.md section 10: "Illustrative" is cut in all three places on this page, since the lead already says "illustrative".)
[UIL] For financial institutions     → /products/kubar-protocol
[UIL] For trade platforms            → /products/navdhan-sdk

## The rail  (pinned story, eight steps; see ../HANDOFF.md, Motion)
[H2] What happens to a receivable.
(14 Nov, option B: only the lanes drawing is pinned; each state is a card that scrolls past it, so the panel's "State" label goes and each card carries its own counter. The legend follows the cards. On tablets and phones the closing line below ends the cards too. REDRAW-2026-11-14.md, section 3a.)
Desktop: the story panel (left) beside the lanes (right), as on Home but with the How it works panel (documents line, Sans/Body). The 1440 frame shows state 06:
(After step 3, REDRAW-2026-11-14.md section 10: each card's state word loses its number.)
[Tag] Record RCV-0001
[State] Settled
[Label] 06 of 08
[Body] On the due date the buyer pays the collection account in the exporter’s name, quoting the receivable’s reference, and a standing sweep passes the payment to the financier. Kubar matches the payment. The financier pays the exporter the balance, less its discount and charges, and the exporter’s bank closes the shipping bill. Where the exporter qualifies, the government’s interest subvention on export factoring is filed on the financier’s data and paid to the exporter.
(15 Nov, REDRAW-2026-11-14.md section 13 A: the story is told on the evidence stack, which is the pinned drawing in place of the lanes; the lanes stay on Home only. The card loses its Documents block, "Documents" over "Payment reference; closure of the shipping bill" (and "Purchase confirmation" on state 05), and its legend; the stack's labels carry the documents. Each card keeps its sentence, its data path and its money path.)
[Tag] Data path · Kubar
[Body] Payment matched; closure tracked
[Tag] Money path
[Label] Kubar holds none            (secondary colour; rule 11.4)
[Body] The buyer pays $225,000 into the exporter’s collection account, swept to the financier; the financier pays the exporter the balance, less its discount and charges
[UI] Skip the story                 (anchor past the rail)
Legend: [Tag] Data path: documents and records · Money path: never through Kubar
(After step 3, REDRAW-2026-11-14.md section 10: the legend line "Kubar: the one filled column" is cut.)
Row numbers: [Code] 01 … 08
Path labels in the lanes: Shipment, invoice (01) · Evidence package checked (02) · Limit and headroom (03) · No-objection (04) · Evidence package and 90% of face (05) · Payment matched, Face value and The balance (06)
[Fine] ¹ Kubar’s own ITFS registration is targeted for 2027; until then Kubar acts as the financier’s origination and servicing agent.
[Fine] Back to text

The eight states, as the ledger shows them at 768 and 390 (and on desktop with reduced motion). The story panel steps through the same text. Verify each state's party, documents and money cells against the Ledger and Story panel components (Figma 72:554, 119:1280; How it works variants) before building:
01 Shipped. The exporter ships the rice and issues its invoice, with its collection account on it: the account the buyer pays. Party: The exporter, and its trade platform if it uses one. Data path: Kubar. Shipment and invoice data received. Money path: —
02 Documented. Kubar checks the shipping bill against the invoice (goods, quantity, value and buyer), checks who the exporter and the buyer are, runs the programme’s rules and files everything in one evidence package. Data path: Evidence package assembled and checked.
03 Insured. The buyer’s limit with the insurer is checked for headroom. The cover is in the financier’s name. Data path: Limit and headroom confirmed.
04 No-objection. The exporter’s bank confirms it has no objection to the sale. Party: The exporter’s bank. Data path: No-objection filed.
05 Purchased. The financier accepts the receivable under its programme limit, without recourse for the buyer’s credit, and pays the purchase price. From then on, the collection account’s standing sweep passes each payment to the financier. The credit decision is the financier’s own. Party: The financier. Data path: Package delivered; purchase recorded. Money path: Kubar holds none. The financier pays 90% of face to the exporter’s own bank.
06 Settled. (text as in the 1440 panel above.) Party: The buyer, the financier and the exporter’s bank. Money path: The buyer pays $225,000 into the exporter’s collection account, swept to the financier; the financier pays the exporter the balance, less its discount and charges.
07 Recorded. The outcome joins the loss history, by buyer, exporter and commodity. Data path: Added to the loss history.
08 Transferred, later¹. Once the venue is registered, a receivable can move from one institutional financier to another, with a registry entry in place of a fresh assignment. Party: Institutional financiers. [State] Planned (muted).
At 768 and 390 the ledger ends with the line: Kubar is in the data path of every step and in the money path of none.

## The evidence package  (the evidence stack; see Motion)
(15 Nov, section 13 A: the separate section and its H2 "Who relies on the record." are gone. The stack below is the story's pinned drawing. Each state's documents land as its card passes, bottom up: state 01 brings Doc 01 to 03, state 02 Doc 04 and 05, state 03 Doc 06, state 04 Doc 07, state 05 Doc 08. The relying lines appear with their states: "The financier buys on it." at 05; the exporter's bank and the subvention lines at 06; "The insurer prices on it." at 07. Once shown, each stays. The two notes stay under the stack. With reduced motion or on a short screen the complete stack shows with the ledger.)
(14 Nov: the lead is gone. Its four sentences are the four relying parties in the drawing, under the record, each with a dashed arrow down from it. The fourth is reworded to stand alone, approved in principle by Vaibhav on 14 Nov. REDRAW-2026-11-14.md, section 6.)
[Body] The financier buys on it.
[Body] The insurer prices on it.
[Body] The exporter’s bank closes the shipping bill against it.
[Body] The government’s interest subvention is filed on it, where the exporter qualifies.
Eight document cards that lock into the record one after another (component "Evidence stack", 127:2464); the last card is open:
(Build step 5, REDRAW-2026-11-14.md section 5: drawn as "Evidence package · isometric" (258:1864): the record's identifier, then eight sheets, Doc 08 on top, each tied to its row (number and name); under the stack "From · The financier" beside the line below it, then the four relying parties, then the two notes.)
[Code] Doc 01  [UI] Commercial invoice
[Code] Doc 02  [UI] Shipping bill
[Code] Doc 03  [UI] Bill of lading, electronic where issued
[Code] Doc 04  [UI] Inspection report, where the programme requires one
[Code] Doc 05  [UI] No-objection
[Code] Doc 06  [UI] Credit-insurance cover
[Code] Doc 07  [UI] Sweep instruction
(15 Nov, section 13 A: Doc 05 to 07 renumbered so the documents land in order. 17 Nov: Doc 07 is the sweep instruction, the payment model's document.)
[Code] Doc 08  [UI] Purchase confirmation
[Tag] From · The financier
[Body] The financier owns the receivable
The record they lock into:
(After step 3, REDRAW-2026-11-14.md section 10: ", 8 of 8" in the record's title and "05 Purchased" under the stack are cut.)
(Build step 5: section 5's drawing has no record card, so the element list and the State line below are not on the page; the record's title is the identifier above the stack, and the eight rows carry the documents. Flagged to Vaibhav, 15 Nov.)
[Tag] Record RCV-0001 · Evidence package
[BodyS] Commercial invoice · Shipping bill · Bill of lading · Inspection report · Credit-insurance cover · Sweep instruction · No-objection · Purchase confirmation   (each with a filled square)
[Tag] State
[Label] 05 of 08
[BodyS] Each element carries its source, its time and who signed it. Any change after signing shows.
[BodyS] The record is built on Corda, a permissioned ledger: one shared record of each receivable, who holds which rights after the purchase, and its payment and loss history.
(No "In build" label under the Corda line: removed.)

## The money path
[H2] Where the money moves.
Same drawing as Kubar Protocol (17 Nov, next build step 8: the money path, Figma 333:2736, centred in the section; with the face value's stop, as on Kubar Protocol):
[UI] Kubar · Buyer, Singapore · Financier · Exporter’s bank
[BodyS] Purchase price, at purchase (90% of face)
[BodyS] Face value, on the due date
[BodyS] Deferred purchase price: the balance, less discount and charges
[Fine] swept to the financier             (17 Nov: the stop's caption, after "Collection account, in the exporter’s name,")
(16 Nov: four controls under the drawing, as on Kubar Protocol.)
[UI] Purchase price
[UI] Face value
[UI] Deferred purchase price
[UI] All three
[Tag] Data path · Kubar               (17 Nov: over Kubar's dashed path)
[Tag] Kubar holds none                 (was "No account, no payment, no release"; 17 Nov: at the end of Kubar's path)
(17 Nov: in the table that assistive technology reads in place of the drawing, each payment with its from and to:)
[Fine] Financier → Exporter’s bank
[Fine] Buyer → Collection account, in the exporter’s name
[Fine] Financier → Exporter’s bank
(17 Nov: the face value's "to" there reads "Collection account, in the exporter’s name, swept to the financier". The table's caption, which describes the drawing:)
[Fine] Three payments move between the buyer, the financier and the exporter’s bank. The buyer’s payment passes through a collection account in the exporter’s name. None touches Kubar.
[BodyS] Every payment carries the receivable’s reference, and Kubar matches each one to its receivable.

## If a buyer doesn’t pay
[H2] If a buyer doesn’t pay.
(14 Nov: the paragraph beside the heading is cut; it repeated the flow. With no lead, the heading runs 800 wide at desktop.)
A ruled register (component "If a buyer doesn’t pay", 133:2422), no boxes or arrows:
(Build step 5, REDRAW-2026-11-14.md section 5: drawn as "If a buyer doesn’t pay · flow" (259:2120): steps 01 to 03 in a row, a fork under step 03 labelled "No dispute" and "A dispute", steps 04 and 05 on the first branch and 06 on the second, then "Kubar holds none of the risk" in Sans/UI large, ink. The register's title below is not drawn in the flow (it repeats the heading); flagged to Vaibhav, 15 Nov. Step numbers and branch labels are in the secondary colour, REDRAW section 11.4.)
[Tag] If a buyer doesn’t pay
01 | Kubar | Flags the late payment straight away
02 | Kubar | Checks with the exporter for any dispute
03 | Kubar | Sends the insurer the notices the policy requires
04 | The financier, as the insured | Lodges the claim with the evidence package behind it | No dispute
05 | The insurer | Pays claims on the covered share | No dispute
06 | The exporter | Answers only for its own side of the trade: disputes, returns, set-off, fraud and its warranties | A dispute
(number [Label], party [Tag], step [BodyS], branch [Label] in rani, right-aligned)
(18 Nov, next build step 11, Figma 333:2784: the path draws with the scroll, and the two branch labels, "No dispute" and "A dispute", are buttons, "No dispute" picked on load; the picked branch is lit and the other sits at 30%. Where the flow doesn't fit in one row the steps stack, the two buttons sit between step 03 and the branch, and only the picked branch shows. Without script or with reduced motion everything is lit and both branches show under their labels.)
[Label] Kubar holds none of the risk     (a plain sentence under the register, ink; no chip)
[BodyS] This is how a programme runs with cover in the financier’s name. Where a programme starts on exporters’ own policies, the terms are set out before any receivable is sold.

## Who does what
[H2] Each party signs for its own part.
[Tag] Party | [Tag] Does | [Tag] Signs
Financier | Sets the programme limit, decides credit, buys each receivable, holds the policy and receives the swept payments | Programme terms; the mandate to Kubar; a purchase agreement with each exporter; the insurance policy
Insurer | Approves buyer limits; pays claims on the covered share | The policy, with the financier
Exporter | Ships, invoices with its collection account on the invoice, keeps its own bank | The purchase agreement; Kubar’s services agreement
Exporter’s bank | Gives its no-objection; closes the shipping bill | Its no-objection
Buyer | Pays the account on the invoice, on its usual terms | Nothing new to sign
Trade platform | Brings exporters and their shipment data through NavDhan SDK | Its agreement with Kubar
Kubar | Designs the pool, checks and documents each receivable, matches payments, services and reports | The mandate from the financier
(first column [UI], the others [BodyS])
(Build step 5, Vaibhav, 15 Nov: from 1200 up the register is drawn as a map, Figma 287:2806 (from 1024 since 16 Nov, when the laptop layout moved there); below that the stacked register stays, and the table stays in the page for screen readers at every width. Seven cards, each with the party's name and its "Does" sentence above, unchanged. The map's own strings, all taken from the table's wording:
  five agreements, a label on each line: "The policy" (Insurer–Financier), "The mandate" (Financier–Kubar), "Purchase agreement" (Financier–Exporter), "Agreement with Kubar" (Trade platform–Kubar), "Services agreement" (Kubar–Exporter);
  two papers a party signs alone, a tag in its card: "Programme terms" (Financier) and "Its no-objection" (Exporter’s bank); 17 Nov: the buyer signs nothing on its own, so its card has no tag;
  the key: "A line is an agreement between the two parties it joins." and "A tag is a paper one party signs on its own.")
[UI] Who holds what                 → /products/kubar-protocol#who-holds-what

## Terms  (glossary; each term is also the target of first-use abbreviation tooltips across the site)
[H2] The terms on this site.
(After step 3, REDRAW-2026-11-14.md section 10: the column heads "Term" and "Meaning" are cut; they name nothing.)
Receivable | The amount an overseas buyer owes an exporter under a shipped invoice.
Financier | The institution that buys the receivable: for Programme 1, a bank’s unit at GIFT City; on Kubar’s own venue¹, other institutional financiers, in GIFT City or abroad.
Institutional financier | A bank, finance company or other institution that finances trade. Only institutional financiers buy the receivables.
Programme | One underwriting for many receivables: the financier’s limit, the rules for what qualifies, the insurance, the mandate to Kubar and the payment path.
Programme limit | The amount a financier sets for a programme. Each receivable that fits is bought inside it, without a new credit decision.
Without recourse for the buyer’s credit | If the buyer doesn’t pay, the financier can’t turn to the exporter, except for disputes, returns, set-off, fraud or the exporter’s own breach.
Purchase price | What the financier pays at purchase: 90% of face in the illustration.
Deferred purchase price | The balance, less the financier’s discount and charges, paid when the buyer pays.
Collection account | A dollar account in the exporter’s name, shown on the invoice, into which the buyer pays; a standing sweep passes each payment to the financier.
Standing sweep | An instruction on the exporter’s collection account that passes each payment to the financier as it arrives; the exporter can’t redirect it.
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
(16 Nov: the first six rows show; the control below opens the rest in place. Built 18 Nov, step 11, Figma 333:2955: a link to a folded term opens the list and lands on its row; without script all 19 show.)
[UI] Show all 19 terms

## Next step  (two routes, no heading)
[Tag] For financial institutions
[UIL] Start a programme conversation      → /contact?intent=institution
[Tag] For trade platforms
[UIL] Talk about an integration           → /contact?intent=platform
