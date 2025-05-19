/**
 * Tests if the OpenAI API key is valid by making a simple request
 */
export async function testOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    // Make a simple request to the OpenAI API
    const response = await fetch("https://api.openai.com/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    // If the response is successful, the key is valid
    return response.ok
  } catch (error) {
    console.error("Error testing OpenAI API key:", error)
    return false
  }
}
