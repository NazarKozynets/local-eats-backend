-- Restore GIST spatial indexes dropped in the PostGIS migration.
-- These require the postgis extension (already enabled) to index geography columns.

CREATE INDEX IF NOT EXISTS "idx_restaurants_location_gist"
    ON "restaurants"
    USING GIST (location);

CREATE INDEX IF NOT EXISTS "idx_courier_profiles_current_location_gist"
    ON "courier_profiles"
    USING GIST (current_location);

CREATE INDEX IF NOT EXISTS "idx_customer_addresses_location_gist"
    ON "customer_addresses"
    USING GIST (location);

CREATE INDEX IF NOT EXISTS "idx_orders_delivery_location_gist"
    ON "orders"
    USING GIST (delivery_location);
