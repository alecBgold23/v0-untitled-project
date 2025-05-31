import { getValidEbayAccessToken } from "./getValidEbayAccessToken"

export async function getEbayAccessToken(): Promise<string> {
  return await getValidEbayAccessToken()
}
