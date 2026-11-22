-- Restrict backend-only and financial/identity data to trusted server code.
-- These tables had no RLS and blanket grants to anon/authenticated.
DO $migration$
DECLARE
    table_name text;
BEGIN
    FOREACH table_name IN ARRAY ARRAY[
        'anti_leak_registry',
        'assisted_closings',
        'audit_logs',
        'billing_events',
        'builder_agreements',
        'builder_wallets',
        'lead_pricing_config',
        'loan_attachments',
        'site_visits',
        'builders',
        'builder_projects',
        'project_inventory'
    ]
    LOOP
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', table_name);
        EXECUTE format('REVOKE ALL PRIVILEGES ON TABLE public.%I FROM PUBLIC, anon, authenticated', table_name);
    END LOOP;
END;
$migration$;

-- Keep bid history readable without exposing bidder identity, and route writes
-- through the validated RPCs below.
REVOKE ALL PRIVILEGES ON TABLE public.bids FROM PUBLIC, anon, authenticated;
GRANT SELECT (id, property_id, amount, status, created_at) ON TABLE public.bids TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.place_bid(p_property_id uuid, p_amount numeric)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public, auth
AS $function$
DECLARE
    current_price numeric;
    property_status text;
    property_owner uuid;
BEGIN
    IF (SELECT auth.uid()) IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    SELECT p.price, p.status, p.owner_id
      INTO current_price, property_status, property_owner
      FROM public.properties AS p
     WHERE p.id = p_property_id
     FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Property not found';
    END IF;
    IF property_status <> 'active' THEN
        RAISE EXCEPTION 'Property is not open for bidding';
    END IF;
    IF property_owner = (SELECT auth.uid()) THEN
        RAISE EXCEPTION 'Owners cannot bid on their own property' USING ERRCODE = '42501';
    END IF;
    IF p_amount IS NULL OR p_amount <= 0 OR p_amount <= current_price THEN
        RAISE EXCEPTION 'Bid must be positive and higher than the current price';
    END IF;

    INSERT INTO public.bids (property_id, bidder_id, amount)
    VALUES (p_property_id, (SELECT auth.uid()), p_amount);

    UPDATE public.properties
       SET price = p_amount
     WHERE id = p_property_id;
END;
$function$;

CREATE OR REPLACE FUNCTION public.accept_bid(p_bid_id uuid, p_property_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO pg_catalog, public, auth
AS $function$
DECLARE
    property_owner uuid;
    property_status text;
    accepted_count integer;
BEGIN
    IF (SELECT auth.uid()) IS NULL THEN
        RAISE EXCEPTION 'Authentication required' USING ERRCODE = '42501';
    END IF;

    SELECT p.owner_id, p.status
      INTO property_owner, property_status
      FROM public.properties AS p
     WHERE p.id = p_property_id
     FOR UPDATE;

    IF NOT FOUND OR property_owner IS DISTINCT FROM (SELECT auth.uid()) THEN
        RAISE EXCEPTION 'Only the property owner can accept a bid' USING ERRCODE = '42501';
    END IF;
    IF property_status <> 'active' THEN
        RAISE EXCEPTION 'Property is not open for bid acceptance';
    END IF;

    UPDATE public.bids
       SET status = 'accepted'
     WHERE id = p_bid_id
       AND property_id = p_property_id
       AND status = 'placed';
    GET DIAGNOSTICS accepted_count = ROW_COUNT;

    IF accepted_count <> 1 THEN
        RAISE EXCEPTION 'Bid is missing, belongs to another property, or is no longer available';
    END IF;

    UPDATE public.bids
       SET status = 'rejected'
     WHERE property_id = p_property_id
       AND id <> p_bid_id
       AND status = 'placed';

    UPDATE public.properties
       SET status = 'sold'
     WHERE id = p_property_id;
END;
$function$;

-- These SECURITY DEFINER routines must not be callable through the public RPC API.
REVOKE ALL PRIVILEGES ON FUNCTION public.place_bid(uuid, numeric) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.place_bid(uuid, numeric) TO authenticated;
REVOKE ALL PRIVILEGES ON FUNCTION public.accept_bid(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.accept_bid(uuid, uuid) TO authenticated;

-- The audit routine is trigger-only; pin its search path and remove direct RPC access.
ALTER FUNCTION public.log_audit_event() SET search_path TO pg_catalog, public, auth;
REVOKE ALL PRIVILEGES ON FUNCTION public.log_audit_event() FROM PUBLIC, anon, authenticated;

-- Pin search paths on the remaining audited functions to prevent object shadowing.
DO $migration$
DECLARE
    function_oid oid;
BEGIN
    FOR function_oid IN
        SELECT p.oid
          FROM pg_catalog.pg_proc AS p
          JOIN pg_catalog.pg_namespace AS n ON n.oid = p.pronamespace
         WHERE n.nspname = 'public'
           AND p.proname IN (
               'update_updated_at_column',
               'calculate_lead_score',
               'handle_lead_monetization',
               'create_audit_trigger_if_not_exists'
           )
    LOOP
        EXECUTE format(
            'ALTER FUNCTION %s SET search_path TO pg_catalog, public, auth',
            function_oid::regprocedure
        );
    END LOOP;
END;
$migration$;
