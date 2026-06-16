2026-06-12 16:17:00,131 INFO sqlalchemy.engine.Engine select pg_catalog.version()
2026-06-12 16:17:00,132 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-06-12 16:17:00,133 INFO sqlalchemy.engine.Engine select current_schema()
2026-06-12 16:17:00,133 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-06-12 16:17:00,134 INFO sqlalchemy.engine.Engine show standard_conforming_strings
2026-06-12 16:17:00,134 INFO sqlalchemy.engine.Engine [raw sql] ()
2026-06-12 16:17:00,136 INFO sqlalchemy.engine.Engine BEGIN (implicit)
2026-06-12 16:17:00,136 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,136 INFO sqlalchemy.engine.Engine [generated in 0.00030s] ('employees_old', 'employees')
CREATE TABLE IF NOT EXISTS hr.employees_old (
    employee_number character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    department character varying(64) NOT NULL,
    "position" character varying(64) NOT NULL,
    phone character varying(32),
    email character varying(128),
    status character varying(16) NOT NULL DEFAULT '待审批'::character varying,
    hire_date date NOT NULL,
    id_card character varying(18),
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false,
    education character varying(16),
    emergency_contact_name character varying(64),
    emergency_contact_phone character varying(32),
    contract_start_date date,
    contract_end_date date,
    domain_account character varying(64),
    team character varying(64),
    job_category character varying(32),
    level character varying(32),
    qualifications json,
    qualification_type character varying(32),
    gender character varying(8),
    native_place character varying(64),
    political_status character varying(32),
    marital_status character varying(16),
    household_type character varying(16),
    status_category character varying(32),
    birth_year integer,
    birth_month integer,
    birth_day integer,
    age integer,
    work_start_date date,
    factory_entry_date date,
    livo_entry_date date,
    graduation_date date,
    work_years integer,
    factory_tenure character varying(32),
    company_tenure character varying(32),
    classification character varying(16),
    school character varying(128),
    major character varying(64),
    id_card_expiry character varying(32),
    id_card_address text,
    current_address text,
    contract_type character varying(32),
    contract_start_2 date,
    contract_end_2 date,
    contract_start_3 date,
    contract_end_3 date,
    contract_start_4 date,
    contract_end_4 date,
    emergency_contact_relation character varying(32),
    bank_account character varying(32),
    training_id character varying(32),
    transfer_history text,
    remarks json,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    feishu_open_id character varying(64)
);

ALTER TABLE hr.employees_old ADD PRIMARY KEY (id);

2026-06-12 16:17:00,146 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,146 INFO sqlalchemy.engine.Engine [cached since 0.01069s ago] ('employees_new', 'employees')
CREATE TABLE IF NOT EXISTS hr.employees_new (
    employee_number character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    department character varying(64) NOT NULL,
    "position" character varying(64) NOT NULL,
    phone character varying(32),
    email character varying(128),
    status character varying(16) NOT NULL DEFAULT '待审批'::character varying,
    hire_date date NOT NULL,
    id_card character varying(18),
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false,
    education character varying(16),
    emergency_contact_name character varying(64),
    emergency_contact_phone character varying(32),
    contract_start_date date,
    contract_end_date date,
    domain_account character varying(64),
    team character varying(64),
    job_category character varying(32),
    level character varying(32),
    qualifications json,
    qualification_type character varying(32),
    gender character varying(8),
    native_place character varying(64),
    political_status character varying(32),
    marital_status character varying(16),
    household_type character varying(16),
    status_category character varying(32),
    birth_year integer,
    birth_month integer,
    birth_day integer,
    age integer,
    work_start_date date,
    factory_entry_date date,
    livo_entry_date date,
    graduation_date date,
    work_years integer,
    factory_tenure character varying(32),
    company_tenure character varying(32),
    classification character varying(16),
    school character varying(128),
    major character varying(64),
    id_card_expiry character varying(32),
    id_card_address text,
    current_address text,
    contract_type character varying(32),
    contract_start_2 date,
    contract_end_2 date,
    contract_start_3 date,
    contract_end_3 date,
    contract_start_4 date,
    contract_end_4 date,
    emergency_contact_relation character varying(32),
    bank_account character varying(32),
    training_id character varying(32),
    transfer_history text,
    remarks json,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    feishu_open_id character varying(64)
);

ALTER TABLE hr.employees_new ADD PRIMARY KEY (id);

2026-06-12 16:17:00,150 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,150 INFO sqlalchemy.engine.Engine [cached since 0.01459s ago] ('onboarding_records_old', 'onboarding_records')
CREATE TABLE IF NOT EXISTS hr.onboarding_records_old (
    seq_number integer,
    employee_number character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    domain_account character varying(64),
    department character varying(64) NOT NULL,
    team character varying(64),
    "position" character varying(64) NOT NULL,
    job_category character varying(32),
    status_category character varying(32),
    is_employed character varying(8),
    hire_date date NOT NULL,
    factory_entry_date date,
    livo_entry_date date,
    work_start_date date,
    graduation_date date,
    birth_month integer,
    birth_day integer,
    contract_type character varying(32),
    contract_start_date date,
    contract_end_date date,
    contract_start_2 date,
    contract_end_2 date,
    contract_start_3 date,
    contract_end_3 date,
    contract_start_4 date,
    contract_end_4 date,
    age integer,
    work_years integer,
    factory_tenure character varying(32),
    company_tenure character varying(32),
    hire_month character varying(16),
    school character varying(128),
    education character varying(16),
    major character varying(64),
    classification character varying(16),
    id_card character varying(18),
    id_card_expiry character varying(32),
    id_card_address text,
    current_address text,
    marital_status character varying(16),
    household_type character varying(16),
    political_status character varying(32),
    phone character varying(32),
    email character varying(128),
    emergency_contact_phone character varying(32),
    emergency_contact_relation character varying(32),
    bank_account character varying(32),
    bank_account_location character varying(32),
    training_id character varying(32),
    transfer_history text,
    remarks json,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false
);

ALTER TABLE hr.onboarding_records_old ADD PRIMARY KEY (id);

2026-06-12 16:17:00,154 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,154 INFO sqlalchemy.engine.Engine [cached since 0.01836s ago] ('onboarding_records_new', 'onboarding_records')
CREATE TABLE IF NOT EXISTS hr.onboarding_records_new (
    seq_number integer,
    employee_number character varying(32) NOT NULL,
    name character varying(64) NOT NULL,
    domain_account character varying(64),
    department character varying(64) NOT NULL,
    team character varying(64),
    "position" character varying(64) NOT NULL,
    job_category character varying(32),
    status_category character varying(32),
    is_employed character varying(8),
    hire_date date NOT NULL,
    factory_entry_date date,
    livo_entry_date date,
    work_start_date date,
    graduation_date date,
    birth_month integer,
    birth_day integer,
    contract_type character varying(32),
    contract_start_date date,
    contract_end_date date,
    contract_start_2 date,
    contract_end_2 date,
    contract_start_3 date,
    contract_end_3 date,
    contract_start_4 date,
    contract_end_4 date,
    age integer,
    work_years integer,
    factory_tenure character varying(32),
    company_tenure character varying(32),
    hire_month character varying(16),
    school character varying(128),
    education character varying(16),
    major character varying(64),
    classification character varying(16),
    id_card character varying(18),
    id_card_expiry character varying(32),
    id_card_address text,
    current_address text,
    marital_status character varying(16),
    household_type character varying(16),
    political_status character varying(32),
    phone character varying(32),
    email character varying(128),
    emergency_contact_phone character varying(32),
    emergency_contact_relation character varying(32),
    bank_account character varying(32),
    bank_account_location character varying(32),
    training_id character varying(32),
    transfer_history text,
    remarks json,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false
);

ALTER TABLE hr.onboarding_records_new ADD PRIMARY KEY (id);

2026-06-12 16:17:00,158 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,158 INFO sqlalchemy.engine.Engine [cached since 0.0221s ago] ('departure_records_old', 'departure_records')
CREATE TABLE IF NOT EXISTS hr.departure_records_old (
    name character varying(64) NOT NULL,
    department character varying(64) NOT NULL,
    team character varying(64),
    "position" character varying(64) NOT NULL,
    job_category character varying(64),
    gender character varying(8),
    status_category character varying(64),
    livo_entry_date date,
    factory_entry_date date,
    work_start_date date,
    offboarding_date date,
    company_tenure_at_leave character varying(64),
    education character varying(16),
    school character varying(128),
    major character varying(64),
    classification character varying(16),
    id_card character varying(18),
    native_place character varying(64),
    household_type character varying(128),
    marital_status character varying(32),
    political_status character varying(64),
    phone character varying(32),
    emergency_contact_phone character varying(32),
    emergency_contact_relation character varying(64),
    bank_account character varying(128),
    contract_type character varying(64),
    transfer_history text,
    offboarding_type character varying(16) NOT NULL DEFAULT '辞职'::character varying,
    offboarding_reason json,
    offboarding_reason_2 json,
    offboarding_remarks json,
    remarks text,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false
);

ALTER TABLE hr.departure_records_old ADD PRIMARY KEY (id);

2026-06-12 16:17:00,163 INFO sqlalchemy.engine.Engine 
                SELECT 
                    'CREATE TABLE IF NOT EXISTS hr.' || $1 || ' (' || E'
' ||
                    string_agg(
                        '    ' || quote_ident(column_name) || ' ' || 
                        CASE 
                            WHEN data_type = 'character varying' THEN 'character varying(' || COALESCE(character_maximum_length::text, '255') || ')'
                            WHEN data_type = 'numeric' THEN 'numeric(' || COALESCE(numeric_precision::text, '10') || ',' || COALESCE(numeric_scale::text, '0') || ')'
                            ELSE data_type
                        END ||
                        CASE WHEN is_nullable = 'NO' THEN ' NOT NULL' ELSE '' END ||
                        CASE WHEN column_default IS NOT NULL THEN ' DEFAULT ' || column_default ELSE '' END,
                        ',' || E'
' ORDER BY ordinal_position
                    ) || E'
);'
                FROM information_schema.columns
                WHERE table_schema = 'hr' AND table_name = $2
                GROUP BY table_name
            
2026-06-12 16:17:00,163 INFO sqlalchemy.engine.Engine [cached since 0.02685s ago] ('departure_records_new', 'departure_records')
CREATE TABLE IF NOT EXISTS hr.departure_records_new (
    name character varying(64) NOT NULL,
    department character varying(64) NOT NULL,
    team character varying(64),
    "position" character varying(64) NOT NULL,
    job_category character varying(64),
    gender character varying(8),
    status_category character varying(64),
    livo_entry_date date,
    factory_entry_date date,
    work_start_date date,
    offboarding_date date,
    company_tenure_at_leave character varying(64),
    education character varying(16),
    school character varying(128),
    major character varying(64),
    classification character varying(16),
    id_card character varying(18),
    native_place character varying(64),
    household_type character varying(128),
    marital_status character varying(32),
    political_status character varying(64),
    phone character varying(32),
    emergency_contact_phone character varying(32),
    emergency_contact_relation character varying(64),
    bank_account character varying(128),
    contract_type character varying(64),
    transfer_history text,
    offboarding_type character varying(16) NOT NULL DEFAULT '辞职'::character varying,
    offboarding_reason json,
    offboarding_reason_2 json,
    offboarding_remarks json,
    remarks text,
    feishu_record_id character varying(32),
    feishu_synced_at date,
    id uuid NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    created_by uuid,
    updated_by uuid,
    is_deleted boolean NOT NULL DEFAULT false
);

ALTER TABLE hr.departure_records_new ADD PRIMARY KEY (id);

2026-06-12 16:17:00,166 INFO sqlalchemy.engine.Engine ROLLBACK
