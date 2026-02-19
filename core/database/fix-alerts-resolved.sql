-- Add resolved_at column to alerts if it doesn't exist
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS resolved_at TIMESTAMPTZ;

-- Also add item_id column if not present (needed for alert resolution by item)
ALTER TABLE alerts
ADD COLUMN IF NOT EXISTS item_id UUID REFERENCES items(id);

-- Update any existing unresolved alerts that belong to items with enough stock
UPDATE alerts a
SET resolved = true, resolved_at = NOW()
FROM items i
WHERE a.item_id = i.id
  AND a.type = 'stock_low'
  AND a.resolved = false
  AND i.stock > 3;
