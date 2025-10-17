CREATE OR REPLACE FUNCTION get_public_unidades()
RETURNS TABLE (
    id uuid,
    group_name text,
    group_code bigint,
    store_model text,
    store_phase text,
    created_at timestamptz,
    updated_at timestamptz,
    is_active boolean,
    ai_agent_id text,
    notion_page_id text,
    phone text,
    email text,
    operation_mon text,
    operation_tue text,
    operation_wed text,
    operation_thu text,
    operation_fri text,
    operation_sat text,
    operation_sun text,
    operation_hol text,
    drive_folder_id text,
    drive_folder_link text,
    docs_folder_id text,
    docs_folder_link text,
    store_imp_phase text,
    address text,
    number_address text,
    address_complement text,
    neighborhood text,
    city text,
    state text,
    uf character(2),
    postal_code text,
    instagram_profile text,
    has_parking boolean,
    parking_spots smallint,
    has_partner_parking boolean,
    partner_parking_address text,
    purchases_active boolean,
    sales_active boolean,
    cnpj text,
    fantasy_name text,
    user_instagram text,
    id_unidade text,
    password_instagram text,
    bearer text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY SELECT * FROM public.unidades;
END;
$$;

GRANT EXECUTE ON FUNCTION get_public_unidades() TO anon, authenticated, service_role;
