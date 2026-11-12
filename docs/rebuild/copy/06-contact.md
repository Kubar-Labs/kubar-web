# Contact  ·  route: /contact

Extracted from Figma, Contact · 1440 (frame 174:6), 13 Nov 2026. Bracketed tags are text styles (../tokens/README.md). Header and footer: 00-header-footer.md. The form posts to the existing /api/contact pipeline (see ../HANDOFF.md, What carries over).

## Hero and routes
[Display] Talk to us.
[BodyL] Tell us who you are and what you’d like to discuss, and your message reaches the right people.
[Tag] If you are | [Tag] Next step | [Tag] Goes to
A bank, finance company, insurer or fund | Start a programme conversation | partnerships@kubar.tech
A trade platform or marketplace | Talk about an integration | partnerships@kubar.tech
An exporter | Ask about Programme 1 | outreach@kubar.tech
An investor | Email us | partnerships@kubar.tech
Press, or anything else | Write to us | outreach@kubar.tech
(first column [UI], next step [UI] link, goes to [BodyS]. Each "next step" goes to the form with "I’m writing as" preset: /contact?intent=institution, platform, exporter, other; "Email us" is mailto:partnerships@kubar.tech. At 768 and 390 the rows stack without column heads.)

## The form  (component set: Text field 151:73, Message field 151:154, Select 152:119, Error summary 152:157, Form message 152:197)
Field contract, from copy deck 4.7 (Notion), which this frame follows:

| Field | Label | Required | Help text | Error messages |
|---|---|---|---|---|
| intent | I’m writing as | Yes | — | Please choose who you’re writing as. |
| name | Full name | Yes | — | Please enter your full name. |
| email | Work email | Yes | We’ll reply to this address. | Please enter your work email. · Please enter an email address in the form name@organisation.com. |
| organisation | Organisation | Yes | — | Please enter your organisation. |
| role | Your role | No ("(optional)" after the label) | — | — |
| message | What would you like to discuss? | Yes, 2,000 characters at most | Changes with the intent (below) | Please tell us what you’d like to discuss. · Please keep your message under 2,000 characters. |
| website (honeypot, hidden from people and assistive tech) | Leave this field empty | — | — | — |

Intent options and their ?intent= values: A bank, finance company, insurer or fund (institution) · A trade platform or marketplace (platform) · An exporter (exporter) · An investor (investor) · Press (press) · Something else (other). Each ?intent= value preselects its option.

Help text under the message box, by intent:
- institution: For example: the trade you finance today, the limits you work with, or what your credit committee will ask.
- platform: For example: your platform, the exporters on it and what you’d like them to have.
- exporter: For example: what you export, where your buyers are and how much of your bank limit you use.
- investor: For example: your fund and what you’d like to know.
- press: For example: your publication, your deadline and your question.
- other: (none)

After sending:
- Success, heading: Message sent.
- Success, body: Thank you, [first name]. Your message is with the team, and we’ll reply from a kubar.tech address.
- Success, link: Back to the home page
- Server error: Your message didn’t send. Please try again, or email outreach@kubar.tech directly.
- Rate limit: We’ve had several messages from this connection in a short time. Please wait a few minutes and try again, or email outreach@kubar.tech.
- Offline: You seem to be offline. Your message is still here; send it again when you’re connected.
No reply-time promise anywhere (the live site's "within 24 hours" goes).

Routing: institution, platform and investor messages go to partnerships@kubar.tech; exporter, press and other to outreach@kubar.tech. Internal email subject: "kubar.tech · [intent] · [organisation]".

The fields as drawn:
[UI] I’m writing as                       (select)
[UI] Full name
[UI] Work email
[BodyS] We’ll reply to this address.     (hint)
[UI] Organisation
[UI] Your role
[BodyS] (optional)
[UI] What would you like to discuss?
[BodyS] For example: the trade you finance today, the limits you work with, or what your credit committee will ask.   (hint)
[Tag] 0 of 2,000                         (live character count)
[UI] Send message                        (filled button; "Sending…" while sending, keeps its width; never disabled)
[Fine] We use these details only to reply to you and to continue the conversation you start. [UI] Privacy notice (→ /legal/privacy)

The 1440 frame shows the form filled in as an example (Arjun Mehta, arjun.mehta@bank.example, A bank’s IFSC Banking Unit, Head of trade finance, a sample message, "170 of 2,000"). Those are demonstration values, not placeholders: build the fields empty, with no placeholder text.
States to build from the Forms board (Figma 153:53): rest, hover, focus, filled, error (field message under the field, and an error summary at the top of the form that takes focus and links to each field), sending, sent (form message replaces the form), and failed (form message above the button with outreach@kubar.tech as the fallback).

## Direct
[Label] Direct                           (a label, no heading; no section number)
[Tag] For | [Tag] Write to
Partnerships and investors | partnerships@kubar.tech
Everything else, including press | outreach@kubar.tech
Privacy requests and grievances | Keshav Dudani, Grievance Officer: keshav@kubar.tech
Registered office | Paras Market, Station Road, Barakar, West Bengal 713324
(labels [Tag], entries [BodyS]; email addresses are mailto links)
