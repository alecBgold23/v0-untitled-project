-- Add columns to track eBay unlisting
ALTER TABLE sell_items 
ADD COLUMN IF NOT EXISTS unlisted_date TIMESTAMP,
ADD COLUMN IF NOT EXISTS unlisting_error TEXT;

-- Add index for better performance on eBay offer lookups
CREATE INDEX IF NOT EXISTS idx_sell_items_ebay_offer_id ON sell_items(ebay_offer_id);

-- Add index for status queries
CREATE INDEX IF NOT EXISTS idx_sell_items_status ON sell_items(status);
