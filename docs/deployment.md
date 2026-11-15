# Production deployment and rollback

The production site uses two Cloudflare Workers:

- `kubar-web` serves the OpenNext application and publishes contact requests to
  `kubar-contact-email`.
- `kubar-contact-email-consumer` sends those requests through the `EMAIL`
  binding. Cloudflare retries failures five times before moving them to
  `kubar-contact-email-dlq`.

GitHub Actions are intentionally not used. Run releases locally from a clean,
reviewed commit on Node 22 with the npm version pinned in `package.json`.

## One-time Cloudflare setup

Authenticate Wrangler, then create both queues before the first deployment:

```bash
npx wrangler login
npx wrangler queues create kubar-contact-email
npx wrangler queues create kubar-contact-email-dlq
```

In the Cloudflare dashboard, confirm that:

1. SSL/TLS encryption mode is `Full (strict)`.
2. `Always Use HTTPS` is enabled. The application redirect is a fallback, not a
   substitute for rejecting HTTP at the edge.
3. Email Routing permits `website@mail.kubar.tech` to send to
   `outreach@kubar.tech`.
4. Image Transformations are enabled for the zone.

## Release

Start from a clean worktree and record the current production Worker version.

```bash
npm ci --ignore-scripts
npm run release:check
npm run deploy:cf
```

`deploy:cf` deploys the queue consumer before the web Worker so that accepted
contact submissions always have an active consumer. The new consumer accepts
both message versions (1 and 2); the old consumer accepts only version 1, so
never run the new web Worker against the old consumer.

After deployment, verify:

```bash
curl -I http://kubar.tech
curl -I https://www.kubar.tech
curl -I https://kubar.tech
curl -I https://kubar.tech/opengraph-image
curl -I https://kubar.tech/media/kubar-labs-social-bd9a99c9.png
```

Expected results are an HTTP-to-HTTPS redirect, a redirect from `www` to the
apex, the staged HSTS header on HTTPS, a permanent redirect from the legacy
Open Graph URL to the social image, and an immutable PNG at the
content-versioned URL.

The eight routes return 200, and any other path returns the 404 page with
status 404:

```bash
for p in / /products/kubar-protocol /products/navdhan-sdk /how-it-works /about /contact /legal/privacy /legal/terms /no-such-page; do
  curl -s -o /dev/null -w "$p %{http_code}\n" https://kubar.tech$p
done
```

The four permanent redirects (308) from the old site's addresses:

| From | To |
|---|---|
| `/products/navdhan` | `/products/navdhan-sdk` |
| `/for-platforms` | `/products/navdhan-sdk` |
| `/team` | `/about#team` |
| `/privacy` | `/legal/privacy` |

```bash
for p in /products/navdhan /for-platforms /team /privacy; do
  curl -s -o /dev/null -w "$p %{http_code} %{redirect_url}\n" https://kubar.tech$p
done
```

Every HTML response carries `Content-Security-Policy`, `Referrer-Policy`,
`X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security`,
`Cross-Origin-Opener-Policy` and `Permissions-Policy`.

Submit one contact-form smoke test, marked as a test and written as "Something
else" so that it goes to `outreach@kubar.tech`, and verify the corresponding
`contact_submission_queued` and `contact_email_sent` events (a message routed
to partnerships@ logs `contact_email_sent_to_fallback` instead; see below).
These structured events contain identifiers and delivery state, not form
fields.

## Checking the Workers build locally

`npm run preview:cf` serves the Workers build on `http://localhost:8787`, but
`worker.mjs` redirects every plain-http request to https, so over http every
request answers 308. Serve the same build over local https instead and address
it as `kubar.tech` (the contact route accepts only that origin):

```bash
npm run build:cf
npx opennextjs-cloudflare preview --local-protocol https
curl -sk --connect-to kubar.tech:443:127.0.0.1:8787 -I https://kubar.tech/
```

In a browser test, start Chromium with
`--host-resolver-rules="MAP kubar.tech:443 127.0.0.1:8787"` and ignore the
self-signed certificate. All bindings are local: a posted form is queued
locally and no email is sent. The `www` redirect cannot be checked this way
(Wrangler rewrites the host to the first route); check it on the live site.

## HSTS rollout

The repository begins with `max-age=86400` (one day). After confirming that the
apex and every required subdomain are HTTPS-only, increase it in stages:

1. One week: `max-age=604800`
2. One month: `max-age=2592000`
3. One year: `max-age=31536000; includeSubDomains`

Only add `preload` after every subdomain is confirmed HTTPS-only and the
operational consequences of browser preload have been accepted.

## Rollback

Keep the web Worker and consumer version IDs from every release. If a release
fails, roll back the web Worker first so it stops producing incompatible queue
messages, then roll back the consumer if its message contract changed:

```bash
npx wrangler rollback <web-version-id>
npx wrangler rollback <consumer-version-id> --config workers/contact-email/wrangler.jsonc
```

If version rollback is unavailable, create a temporary worktree at the last
known-good commit, install with `npm ci --ignore-scripts`, run
`npm run release:check`, and deploy from that worktree. Do not delete either
queue during rollback; retained messages can be replayed after the consumer is
healthy.

## Contact form routing

The site routes institution, platform and investor messages to `partnerships@kubar.tech` and exporter, press and other messages to `outreach@kubar.tech`. Both are allowed destinations of the email Worker's `send_email` binding.

The account is on Workers Free, so the binding can send only to destination addresses verified under Email Routing, Destination addresses, in the Cloudflare dashboard. `outreach@kubar.tech` was verified on 15 November 2026. An unverified address fails with `E_RECIPIENT_PLAN_RESTRICTED`; a message for partnerships@ that fails is sent to outreach@ instead and logged as `contact_email_sent_to_fallback`, so nothing is lost. Delivery failures log the binding's error code and message, with addresses masked.

## Web Analytics

The content security policy allows Cloudflare Web Analytics: the beacon script from `static.cloudflareinsights.com` and its reports to `cloudflareinsights.com`.
