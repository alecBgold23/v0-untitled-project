-- Create car_pricing table if it doesn't exist
CREATE TABLE IF NOT EXISTS car_pricing (
  id SERIAL PRIMARY KEY,
  make TEXT NOT NULL,
  model TEXT NOT NULL,
  year INTEGER,
  trim TEXT,
  average_price NUMERIC NOT NULL,
  min_price NUMERIC NOT NULL,
  max_price NUMERIC NOT NULL,
  data_source TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX IF NOT EXISTS car_pricing_make_model_idx ON car_pricing (make, model);
CREATE INDEX IF NOT EXISTS car_pricing_make_model_year_idx ON car_pricing (make, model, year);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create a trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_car_pricing_updated_at ON car_pricing;
CREATE TRIGGER update_car_pricing_updated_at
BEFORE UPDATE ON car_pricing
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
