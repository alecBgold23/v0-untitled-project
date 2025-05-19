import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.PRICING_OPENAI_API_KEY,
})

export async function generatePriceEstimate(itemDetails: string, condition: string): Promise<string> {
  const prompt = `You are an expert pricing assistant. Given the following item details and condition, provide a price range in USD with the format "$xx-$yy" or a single price "$xx". 
  
Item Details: ${itemDetails}
Condition: ${condition}

Please respond only with the price range or single price.`

  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 30,
  })

  return completion.choices[0].message.content.trim()
}
