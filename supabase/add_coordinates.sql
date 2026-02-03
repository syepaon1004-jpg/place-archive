-- Add latitude and longitude columns to places table if they don't exist
-- This script is safe to run multiple times

-- Add latitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'places' AND column_name = 'latitude'
  ) THEN
    ALTER TABLE places ADD COLUMN latitude DECIMAL(10, 8);
  END IF;
END $$;

-- Add longitude column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'places' AND column_name = 'longitude'
  ) THEN
    ALTER TABLE places ADD COLUMN longitude DECIMAL(11, 8);
  END IF;
END $$;

-- Create index for location queries if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_places_location ON places(latitude, longitude);

-- Verify columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'places'
AND column_name IN ('latitude', 'longitude');
