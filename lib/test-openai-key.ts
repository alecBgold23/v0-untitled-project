/**
 * Tests if an OpenAI API key is valid
 * @param apiKey The OpenAI API key to test
 * @returns Boolean indicating if the key is valid
 */
export async function testOpenAIKey(apiKey: string): Promise<boolean> {
  try {
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error testing OpenAI API key:", error)
    return false
  }
}
