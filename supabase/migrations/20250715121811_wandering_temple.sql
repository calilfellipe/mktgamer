/*
  # Add highlighted field to products table

  1. Changes
    - Add `highlighted` boolean field to products table
    - Set default value to false
    - Update existing products based on commission_rate

  2. Security
    - Maintains existing RLS policies
*/

-- Add highlighted field to products table
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS highlighted BOOLEAN DEFAULT false;

-- Update existing products to set highlighted based on commission_rate
UPDATE products 
SET highlighted = true 
WHERE commission_rate >= 20 AND status = 'active';

-- Create index for better performance on highlighted products
CREATE INDEX IF NOT EXISTS idx_products_highlighted ON products(highlighted) WHERE highlighted = true;

-- Create index for commission_rate ordering
CREATE INDEX IF NOT EXISTS idx_products_commission_rate ON products(commission_rate DESC);