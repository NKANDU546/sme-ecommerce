# Step 08: Launch Hardening

This step prepares the storefront backend and frontend for real merchants and
customers.

## Goal

Make the storefront system reliable, secure, observable, and ready for production
traffic.

After this step, the team should have:

- Strong permission checks.
- Stable validation.
- Safe payment handling.
- Useful logs and monitoring.
- Seed/migration confidence.
- Production-ready error handling.
- A launch checklist.

## Scope

### Included

- Security review.
- API validation review.
- Payment verification review.
- Logging and monitoring.
- Rate limiting.
- Backup and migration checks.
- Test coverage.
- Production launch checklist.

### Not Included

- New storefront features.
- New templates.
- Major redesigns.

## Security Checklist

### Authentication

- Merchant APIs require auth.
- Public APIs do not expose draft data.
- Expired/invalid tokens are rejected.
- Logout invalidates refresh/session tokens where applicable.
- Consider moving long-lived auth out of browser local storage.

### Authorization

Every merchant endpoint must verify:

- User owns or belongs to the business.
- Business owns the workspace.
- Workspace owns storefront/products/media/orders.

Never trust `workspaceId` from the client without checking ownership.

### Public Data Exposure

Public APIs may expose:

- Published storefront config.
- Active products.
- Public media URLs.
- Public page content.

Public APIs must not expose:

- Draft storefront config.
- Merchant private account data.
- Internal IDs where not needed.
- Payment provider secrets.
- Customer private data from other orders.

## Validation Checklist

Validate:

- Storefront config shape.
- Template ID and template version.
- Section types.
- Page slugs.
- Product status and prices.
- Media ownership.
- Cart quantities.
- Checkout customer fields.
- Payment webhook signatures.

## Payment Hardening

Payment must be treated as untrusted until verified.

Rules:

- Do not mark orders paid from frontend redirect alone.
- Verify provider webhook signatures.
- Verify payment reference with provider when needed.
- Store provider reference uniquely.
- Make webhook handling idempotent.
- Ignore duplicate paid events safely.
- Log failed webhook verification attempts.

## Rate Limiting

Recommended rate limits:

- Auth endpoints.
- Media upload URL creation.
- Checkout creation.
- Payment initialization.
- Public cart item mutation.

Public storefront read APIs can have higher limits and caching.

## Logging

Log important lifecycle events:

- Storefront draft updated.
- Storefront published.
- Storefront unpublished.
- Product activated/archived.
- Media uploaded/deleted.
- Cart converted to order.
- Payment initialized.
- Payment succeeded/failed.
- Webhook verification failed.

Avoid logging:

- Passwords.
- Full tokens.
- Full payment secrets.
- Sensitive customer data beyond operational need.

## Monitoring

Track:

- API error rates.
- Publish failures.
- Checkout failures.
- Payment initialization failures.
- Payment webhook failures.
- Public storefront latency.
- Media upload failures.

Recommended alerts:

- Payment webhook failure spike.
- Public storefront 5xx spike.
- Checkout 5xx spike.
- Database migration failure.

## Database And Backup Checklist

- Migrations are reversible or have tested rollback plans.
- Production database backups are enabled.
- Published snapshots are immutable.
- Deleting products/media does not break old orders.
- Order item snapshots preserve product title/SKU/price.
- Payment records preserve provider references.

## Test Coverage

Minimum backend tests:

- Workspace ownership checks.
- Storefront draft save validation.
- Publish snapshot creation.
- Public API returns published data only.
- Product CRUD ownership and SKU uniqueness.
- Media ownership checks.
- Cart total calculation.
- Checkout order creation.
- Payment webhook verification and idempotency.

Minimum frontend checks:

- Storefront editor load/save.
- Go Live success and validation failure.
- Public storefront route render.
- Product list/detail render.
- Cart add/update/remove.
- Checkout creates order.

## Performance And Caching

Recommended:

- Cache public storefront responses by `storeSlug` and snapshot ID.
- Paginate product lists.
- Paginate media library.
- Avoid returning full publish history snapshot JSON in list responses.
- Use image CDN/object storage URLs.

## Production Configuration

Confirm environment variables for:

- Backend API base URL.
- Database connection.
- Object storage credentials.
- Public CDN/storage base URL.
- Payment provider keys.
- Payment webhook secret.
- Frontend public base URL.

Secrets must not be committed.

## Launch Checklist

Before launch:

- Step 01 through Step 07 acceptance criteria are complete.
- Production database migrations have run.
- `classic-boutique` template is seeded.
- A test merchant can create/edit a storefront.
- A test merchant can publish a storefront.
- A public live URL renders published data.
- A customer can complete checkout in test mode.
- Payment webhook is verified in test mode.
- Error monitoring is enabled.
- Backups are enabled.
- Rollback plan is documented.

## Acceptance Criteria

Step 08 is complete when:

- Critical security checks are implemented.
- Payment webhook handling is verified and idempotent.
- Public APIs are cached or performance-reviewed.
- Monitoring and logs exist for critical flows.
- Required tests pass.
- Production environment variables are documented.
- Launch checklist is complete.

## After Launch

Good follow-up features:

- Custom domains.
- More templates.
- Inventory tracking.
- Product variants.
- Merchant order dashboard.
- Shipping integrations.
- Discounts/coupons.
- Analytics.
