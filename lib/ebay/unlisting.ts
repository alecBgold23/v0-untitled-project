import { getValidEbayAccessToken } from "./getValidEbayAccessToken"

export async function unlistItemFromEbay(offerId: string): Promise<boolean> {
  try {
    console.log(`🔄 Starting eBay unlisting process for offer ID: ${offerId}`)

    const accessToken = await getValidEbayAccessToken()

    // First, try to withdraw the offer (unpublish it)
    const withdrawResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}/withdraw`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Content-Language": "en-US",
        "Accept-Language": "en-US",
      },
    })

    const withdrawText = await withdrawResponse.text()
    console.log("📩 Raw withdraw response:", withdrawText)

    if (!withdrawResponse.ok) {
      console.error("❌ Failed to withdraw offer:", {
        status: withdrawResponse.status,
        statusText: withdrawResponse.statusText,
        response: withdrawText,
      })

      // If withdraw fails, try to delete the offer entirely
      console.log("🔄 Attempting to delete offer instead...")

      const deleteResponse = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Language": "en-US",
          "Accept-Language": "en-US",
        },
      })

      const deleteText = await deleteResponse.text()
      console.log("📩 Raw delete response:", deleteText)

      if (!deleteResponse.ok) {
        console.error("❌ Failed to delete offer:", {
          status: deleteResponse.status,
          statusText: deleteResponse.statusText,
          response: deleteText,
        })
        throw new Error(`Failed to unlist item: ${deleteResponse.statusText}`)
      }

      console.log("✅ Offer deleted successfully")
      return true
    }

    console.log("✅ Offer withdrawn successfully")
    return true
  } catch (error) {
    console.error("❌ Error unlisting item from eBay:", error)
    throw error
  }
}

export async function getOfferStatus(offerId: string): Promise<string | null> {
  try {
    const accessToken = await getValidEbayAccessToken()

    const response = await fetch(`https://api.ebay.com/sell/inventory/v1/offer/${offerId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Language": "en-US",
        "Accept-Language": "en-US",
      },
    })

    if (!response.ok) {
      console.error("❌ Failed to get offer status:", response.statusText)
      return null
    }

    const offerData = await response.json()
    return offerData.status || null
  } catch (error) {
    console.error("❌ Error getting offer status:", error)
    return null
  }
}
