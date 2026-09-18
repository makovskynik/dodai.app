-- Freemium listing tier + passport fields (local/Neon).
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS listing_tier varchar(20) NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS extra_links jsonb NOT NULL DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS creator_name varchar(120),
  ADD COLUMN IF NOT EXISTS creator_linkedin_url text,
  ADD COLUMN IF NOT EXISTS promo_code varchar(40),
  ADD COLUMN IF NOT EXISTS promo_url text,
  ADD COLUMN IF NOT EXISTS related_slugs text[] NOT NULL DEFAULT '{}';
