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
contact submissions always have an active consumer. After deployment, verify:

```bash
curl -I http://kubar.tech
curl -I https://kubar.tech
curl -I https://kubar.tech/opengraph-image
curl -I https://kubar.tech/media/kubar-labs-og-b2add55b.png
```

Expected results are an HTTP-to-HTTPS redirect, the staged HSTS header on HTTPS,
a permanent redirect from the legacy Open Graph URL, and an immutable PNG at
the content-versioned URL. Submit one contact-form smoke test and verify the
corresponding
`contact_submission_queued` and `contact_email_sent` events. These structured
events contain identifiers and delivery state, not form fields.

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

## Contact form routing (rebuild, step 5)

The site routes institution, platform and investor messages to `partnerships@kubar.tech` and exporter, press and other messages to `outreach@kubar.tech`. The email Worker's `send_email` binding still allows only `outreach@kubar.tech` as a destination, so today a message routed to partnerships@ fails at the binding and the Worker sends the same email to the fallback, `outreach@kubar.tech` (logged as `contact_email_sent_to_fallback`). Nothing is lost and nothing waits.

To switch the routing on in production:

1. In the Cloudflare dashboard, verify `partnerships@kubar.tech` as an Email Routing destination address.
2. Add it to `allowed_destination_addresses` in `workers/contact-email/wrangler.jsonc` and deploy the consumer.

Neither step has been done; both are for Vaibhav to decide.
