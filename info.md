📦 Full command list you can copy‑paste
# -----------------------------------------------------------------
# 0️⃣  Verify tools (already done)
# -----------------------------------------------------------------
node -v                     # → v25.5.0
pnpm -v                     # → should print a version
# -----------------------------------------------------------------
# 1️⃣  Install / build (you already ran these, just keep for reference)
# -----------------------------------------------------------------
pnpm install
pnpm run build               # runs “next build && npx @cloudflare/next-on-pages”
# Remove the huge cache folder that breaks Cloudflare’s 25 MiB limit
rm -rf .next/cache
# -----------------------------------------------------------------
# 2️⃣  Add the real Resend API key as a secret (you already did)
# -----------------------------------------------------------------
wrangler pages secret put RESEND_API_KEY
# → paste the key when prompted
# -----------------------------------------------------------------
# 3️⃣  Deploy the site (you already deployed, this repeats if needed)
# -----------------------------------------------------------------
wrangler pages deploy . --project-name space-labs-page
# -----------------------------------------------------------------
# 4️⃣  (Optional) Bind your custom domain – **must be done in the Cloudflare UI**
# -----------------------------------------------------------------
# 1. Log in to Cloudflare → Pages → “space‑labs‑page”
# 2. Settings → Custom Domains → Add Domain
#    • Add `space‑labs.pro`
#    • Add `www.space‑labs.pro` (optional) and set the redirect to the apex.
# 3. Cloudflare will automatically show the required DNS records.
#    Because you already pointed the domain’s **nameservers** to Cloudflare
#    (via Hostinger), the records will be created automatically.
# 4. Ensure the records are **proxied** (orange cloud) – this enables SSL.
# 5. Cloudflare will issue a free TLS certificate (HTTPS) for you.
# 6. Wait a few minutes for DNS propagation, then test:
# Verify DNS resolves to Cloudflare IPs
dig +short space-labs.pro
dig +short www.space-labs.pro
# Verify HTTPS works
curl -I https://space-labs.pro   # should return “200 OK” with a valid cert
---
## 📌 What to do next
1. **Future code changes** – just commit & push:
   ```bash
   git add .
   git commit -m "Your message"
   git push origin master   # (or main – Cloudflare auto‑deploys)
   ```
   Cloudflare Pages will rebuild automatically, using the secret you stored.
2. **Update the Resend key** later (if it ever rotates) by re‑running:
   ```bash
   wrangler pages secret put RESEND_API_KEY
   ```
3. **Monitor** the site in the Cloudflare dashboard (Analytics, Edge Config, etc.) and adjust any Cloudflare performance settings (caching, page‑rules, etc.) as needed.
4. **If you ever need to change the build output directory** (e.g., switch to another adapter), just edit `wrangler.toml`:
   ```toml
   pages_build_output_dir = "dist"   # or whatever folder you generate
   ```
---
✅ All done!