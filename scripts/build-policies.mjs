import { readFile, writeFile } from "node:fs/promises";

const policies = [
  {
    source: "policies/shipping.txt",
    output: "shipping.html",
    slug: "shipping",
    label: "Shipping & Payment",
    headings: [
      "Order Processing Time", "Shipping Origin", "Shipping Options", "Supported Shipping Zones",
      "Shipping Costs", "Delivery Times", "Shipping Delays", "Address Accuracy", "Lost Packages",
      "Damaged Packages", "Returns", "Exchanges", "Cancellations", "Refunds and Partial Refunds",
      "Repairs and Replacements", "90 Day Limited Warranty", "Battery and Power Supply Notice",
      "DIY Kit Responsibility", "Payment Options", "Payment Requirements", "Payment Security",
      "Sales Tax", "Customs, Duties, and Import Fees", "Contact Information"
    ]
  },
  {
    source: "policies/privacy.txt",
    output: "privacy.html",
    slug: "privacy",
    label: "Privacy Policy",
    headings: [
      "Business Information", "Information We Collect", "Payment Information", "How We Use Your Information",
      "Custom Requests and User-Submitted Content", "Third-Party Platforms and Services", "Shipping Information",
      "Email and Customer Communication", "Cookies, Analytics, and Website Tracking", "Data Sharing", "Data Security",
      "Data Retention", "Children’s Privacy", "Your Privacy Choices", "Utah Privacy Notice",
      "California, Colorado, and Other State Privacy Rights", "International Users", "Links to Other Websites",
      "Changes to This Privacy Policy", "Contact Information"
    ]
  },
  {
    source: "policies/returns.txt",
    output: "returns.html",
    slug: "returns",
    label: "Return Policy",
    headings: [
      "All Sales Are Final", "Handmade and Small-Batch Products", "Non-Returnable Items", "Damages and Issues",
      "Repairs and Replacements", "Exchanges", "Refunds and Partial Refunds", "90 Day Limited Warranty",
      "DIY Kit Responsibility", "Battery and Power Supply Issues", "Fitment Issues", "Buyer Modifications and Alterations",
      "How to Report an Issue", "Contact Information"
    ]
  }
];

const escapeHtml = (value) => value
  .replaceAll("&", "&amp;")
  .replaceAll("<", "&lt;")
  .replaceAll(">", "&gt;")
  .replaceAll('"', "&quot;");

function linkContactDetails(value) {
  return escapeHtml(value)
    .replaceAll("www.ghostworkslab.com", '<a href="https://ghostworkslab.com/">www.ghostworkslab.com</a>')
    .replaceAll("Charlie@ghostworkslab.com", '<a href="mailto:charlie@ghostworkslab.com">Charlie@ghostworkslab.com</a>');
}

function isListItem(block, currentHeading) {
  if (currentHeading === "Contact Information" || currentHeading === "Business Information") return false;
  return block.length < 100 && !/[.!?:]$/.test(block);
}

function renderPolicy(config, text) {
  const normalizedText = config.headings.reduce(
    (value, heading) => value.replaceAll(`\n${heading}\n`, `\n\n${heading}\n\n`),
    text.replaceAll("\r\n", "\n")
  );
  const blocks = normalizedText.trim().split(/\n\s*\n/).map((block) => block.trim());
  const [title, updated, ...content] = blocks;
  const headingSet = new Set(config.headings);
  let currentHeading = "";
  const body = content.map((block) => {
    if (headingSet.has(block)) {
      currentHeading = block;
      return `<h2>${escapeHtml(block)}</h2>`;
    }
    const className = isListItem(block, currentHeading) ? ' class="policy-point"' : "";
    return `<p${className}>${linkContactDetails(block)}</p>`;
  }).join("\n        ");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="description" content="${escapeHtml(config.label)} for GhostWorks Lab orders and website visitors.">
  <title>${escapeHtml(config.label)} | GhostWorks Lab</title>
  <link rel="canonical" href="https://ghostworkslab.com/${config.output}">
  <link rel="icon" type="image/png" href="logo.png">
  <link rel="apple-touch-icon" href="logo.png">
  <link rel="stylesheet" href="policy.css">
</head>
<body>
  <header class="policy-header">
    <nav class="policy-nav" aria-label="Policy navigation">
      <a class="policy-brand" href="index.html"><img src="logo.png" alt=""><span>GhostWorks Lab</span></a>
      <a class="back-link" href="index.html#shop">Back to the shop</a>
    </nav>
  </header>
  <main class="policy-shell">
    <article class="policy-document">
      <p class="eyebrow">GhostWorks Lab policies</p>
      <h1>${escapeHtml(title)}</h1>
      <p class="last-updated">${escapeHtml(updated)}</p>
      ${body}
    </article>
  </main>
  <footer class="policy-footer">
    <div class="policy-footer-inner">
      <span>GhostWorks Lab · Salt Lake City, Utah</span>
      <span><a href="about.html">About</a> · <a href="shipping.html">Shipping &amp; Payment</a> · <a href="returns.html">Returns</a> · <a href="privacy.html">Privacy</a></span>
    </div>
  </footer>
</body>
</html>
`;
}

for (const policy of policies) {
  const text = await readFile(policy.source, "utf8");
  await writeFile(policy.output, renderPolicy(policy, text));
}
