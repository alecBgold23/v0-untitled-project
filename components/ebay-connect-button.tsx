"use client"

export default function EbayConnectButton() {
  const EBAY_AUTH_URL =
    `https://auth.ebay.com/oauth2/authorize?` +
    new URLSearchParams({
      client_id: process.env.NEXT_PUBLIC_EBAY_CLIENT_ID!,
      response_type: "code",
      redirect_uri: "BluBerry-BluBerry-ItemPr-pzocll", // <- your RuName here
      scope: [
        "https://api.ebay.com/oauth/api_scope",
        "https://api.ebay.com/oauth/api_scope/sell.inventory",
        "https://api.ebay.com/oauth/api_scope/sell.account",
        "https://api.ebay.com/oauth/api_scope/sell.fulfillment",
      ].join(" "),
    })

  return (
    <a href={EBAY_AUTH_URL}>
      <button className="px-4 py-2 bg-blue-600 text-white rounded">Connect with eBay</button>
    </a>
  )
}
