
-- DATABASE ------------------------------------------------------------------------------------------------------------

-- Database: Immunocube
CREATE DATABASE "Immunocube" WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_GB.UTF-8'
    LC_CTYPE = 'en_GB.UTF-8'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

GRANT CONNECT ON DATABASE "Immunocube" TO immunocube;
GRANT ALL ON DATABASE "Immunocube" TO postgres;


-- TYPES ---------------------------------------------------------------------------------------------------------------


-- Type: DATASET_STATE
CREATE TYPE public."DATASET_STATE" AS ENUM ('submitted', 'hidden');
ALTER TYPE public."DATASET_STATE" OWNER TO postgres;


-- Type: EXPERIMENT
CREATE TYPE public."EXPERIMENT" AS ENUM ('Whole proteome', 'Neo N-term enrichment',
    'Phophoproteome', 'Acetylome', 'Ubiquitinome', 'Pulse-SILAC',
    'Immunoprecipitation', 'Other (Specify in Additional Info)');
ALTER TYPE public."EXPERIMENT" OWNER TO postgres;


-- Type: OI_TYPE
CREATE TYPE public."OI_TYPE" AS ENUM ('ProteinGroup', 'Protein', 'Peptide');
ALTER TYPE public."OI_TYPE" OWNER TO postgres;


-- Type: ORGANISM
CREATE TYPE public."ORGANISM" AS ENUM ('Homo sapiens (Human)', 'Mus musculus (Mouse)',
    'Rattus norvegicus (Rat)', 'Caenorhabditis elegans', 'Gut Microbiome (Specify in Additional Info)',
    'Saccharomyces cerevisiae (Baker''s Yeast)', 'Other/Multiple (Specify in Additional Info)');
ALTER TYPE public."ORGANISM" OWNER TO postgres;


-- Type: TRANSFORMATION
CREATE TYPE public."TRANSFORMATION" AS ENUM ('none', 'ln', 'log10');
ALTER TYPE public."TRANSFORMATION" OWNER TO postgres;


-- TABLES --------------------------------------------------------------------------------------------------------------


-- Table: public.uniprot_features
CREATE TABLE IF NOT EXISTS public.uniprot_features (
    entry character varying(32) COLLATE pg_catalog."default" NOT NULL,
    entry_name character varying COLLATE pg_catalog."default" NOT NULL,
    status character varying COLLATE pg_catalog."default",
    protein_names character varying COLLATE pg_catalog."default" NOT NULL,
    gene_names character varying COLLATE pg_catalog."default",
    organism character varying COLLATE pg_catalog."default" NOT NULL,
    length integer NOT NULL,
    subcellular_location character varying COLLATE pg_catalog."default",
    sequence character varying COLLATE pg_catalog."default" NOT NULL,
    function character varying COLLATE pg_catalog."default",
    go_bp character varying COLLATE pg_catalog."default",
    go_cp character varying COLLATE pg_catalog."default",
    go_mf character varying COLLATE pg_catalog."default",
    active_site character varying COLLATE pg_catalog."default",
    binding_site character varying COLLATE pg_catalog."default",
    activity_regulation character varying COLLATE pg_catalog."default",
    domain character varying COLLATE pg_catalog."default",
    cross_reference_corum character varying COLLATE pg_catalog."default",
    tissue_specificity character varying COLLATE pg_catalog."default",
    interacts_with character varying COLLATE pg_catalog."default",
    subunit_structure character varying COLLATE pg_catalog."default",
    primary_gene_names character varying COLLATE pg_catalog."default",
    mc3_list character varying COLLATE pg_catalog."default",
    mc3_evidence character varying COLLATE pg_catalog."default",
    mc3_submitolocalization character varying COLLATE pg_catalog."default",
    mc3_mitopathways character varying COLLATE pg_catalog."default",
    tissues character varying COLLATE pg_catalog."default",
    complex_name character varying COLLATE pg_catalog."default",
    complex_id character varying COLLATE pg_catalog."default",
    mitocop character varying COLLATE pg_catalog."default",
    mitocop_disease_gene character varying COLLATE pg_catalog."default",
    mitocop_disease_association character varying COLLATE pg_catalog."default",
    mitocop_functional_classification character varying COLLATE pg_catalog."default",
    halflife_hela double precision,
    halflife_hu7 double precision,
    tomm40_importomics character varying COLLATE pg_catalog."default",
    mean_log2_ratio double precision,
    mean_mitocopies_cell double precision,
    mean_copy_numbers_cell double precision,
    category character varying COLLATE pg_catalog."default",
    integral real,
    membrane_associated real,
    oi_id bigint,
    CONSTRAINT uniprot_features_pk PRIMARY KEY (entry),
    CONSTRAINT uniprot_features_entry_name_unique UNIQUE (entry_name),
    CONSTRAINT uniprot_features_oi_fk FOREIGN KEY (oi_id)
        REFERENCES public.oi (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE NO ACTION
        NOT VALID
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.uniprot_features OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.uniprot_features TO immunocube;
GRANT ALL ON TABLE public.uniprot_features TO postgres;

CREATE INDEX IF NOT EXISTS index_uniprot_features_entry_name ON public.uniprot_features
    USING btree (entry_name COLLATE pg_catalog."default" ASC NULLS LAST) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS index_uniprot_features_entry_pk ON public.uniprot_features
    USING btree (entry COLLATE pg_catalog."default" ASC NULLS LAST) TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS index_uniprot_features_oi_id ON public.uniprot_features
    USING btree (oi_id ASC NULLS LAST) TABLESPACE pg_default;


-- Table: public.oi
CREATE TABLE IF NOT EXISTS public.oi (
    id bigint NOT NULL DEFAULT 'nextval('"OI_id_seq"'::regclass)',
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    type "OI_TYPE" NOT NULL,
    CONSTRAINT oi_pk PRIMARY KEY (id),
    CONSTRAINT oi_label_unique UNIQUE (label)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.oi OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.oi TO immunocube;
GRANT ALL ON TABLE public.oi TO postgres;

CREATE INDEX IF NOT EXISTS index_oi_label ON public.oi USING hash (label COLLATE pg_catalog."default") TABLESPACE pg_default;
CREATE INDEX IF NOT EXISTS index_oi_pk ON public.oi USING btree (id ASC NULLS LAST) TABLESPACE pg_default;


-- Table: public.protocol
CREATE TABLE IF NOT EXISTS public.protocol (
    id bigint NOT NULL DEFAULT 'nextval('"Protocol_id_seq"'::regclass)',
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    url character varying COLLATE pg_catalog."default" DEFAULT 'NULL'::character varying,
    description character varying COLLATE pg_catalog."default" DEFAULT 'NULL'::character varying,
    CONSTRAINT protocol_pk PRIMARY KEY (id),
    CONSTRAINT protocol_label_unique UNIQUE (label)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.protocol OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.protocol TO immunocube;
GRANT ALL ON TABLE public.protocol TO postgres;


-- Table: public.instrument
CREATE TABLE IF NOT EXISTS public.instrument
(
    id bigint NOT NULL DEFAULT 'nextval('"Instrument_id_seq"'::regclass)',
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    description character varying COLLATE pg_catalog."default" DEFAULT 'NULL'::character varying,
    CONSTRAINT instrument_pk PRIMARY KEY (id),
    CONSTRAINT instrument_label_unique UNIQUE (label)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.instrument OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.instrument TO immunocube;
GRANT ALL ON TABLE public.instrument TO postgres;


-- Table: public.grouping
CREATE TABLE IF NOT EXISTS public."grouping" (
    id bigint NOT NULL DEFAULT 'nextval('"Grouping_id_seq"'::regclass)',
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    priority smallint DEFAULT '8000'::smallint,
    CONSTRAINT grouping_pk PRIMARY KEY (id)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public."grouping" OWNER to postgres;

GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public."grouping" TO immunocube;
GRANT ALL ON TABLE public."grouping" TO postgres;

CREATE INDEX IF NOT EXISTS index_grouping_pk
    ON public."grouping" USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.groupingitem
CREATE TABLE IF NOT EXISTS public.groupingitem (
    id bigint NOT NULL DEFAULT 'nextval('"GroupingItem_id_seq"'::regclass)',
    grouping_id bigint NOT NULL,
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT groupinglabel_pk PRIMARY KEY (id),
    CONSTRAINT groupinglabel_grouping_fk FOREIGN KEY (grouping_id)
        REFERENCES public."grouping" (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.groupingitem OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.groupingitem TO immunocube;
GRANT ALL ON TABLE public.groupingitem TO postgres;

CREATE INDEX IF NOT EXISTS index_groupingitem_grouping_fk
    ON public.groupingitem USING btree
    (grouping_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_groupingitem_pk
    ON public.groupingitem USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.dataset
CREATE TABLE IF NOT EXISTS public.dataset(
    id bigint NOT NULL DEFAULT 'nextval('"Dataset_id_seq"'::regclass)',
    project_id bigint,
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    instrument_id bigint NOT NULL,
    created_on timestamp without time zone NOT NULL,
    uploaded_on timestamp without time zone NOT NULL DEFAULT 'now()',
    state "DATASET_STATE" NOT NULL,
    experimentator character varying(255) COLLATE pg_catalog."default" NOT NULL,
    contact_email character varying(255) COLLATE pg_catalog."default" NOT NULL,
    name_group character varying(255) COLLATE pg_catalog."default" NOT NULL,
    title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    research_question text COLLATE pg_catalog."default" NOT NULL,
    protein_of_interest character varying(255) COLLATE pg_catalog."default" NOT NULL,  -- ToDo: Choose from Feature?
    organism character varying(255) COLLATE pg_catalog."default" NOT NULL,  -- ToDo: CHANGE TYPE TO "ORGANISM"
    type character varying(255) COLLATE pg_catalog."default" NOT NULL,  -- ToDo: Own Type?
    material character varying(255) COLLATE pg_catalog."default" NOT NULL,  -- ToDo: Own Type?
    research_aim text COLLATE pg_catalog."default" NOT NULL,
    research_sample_preparation text COLLATE pg_catalog."default" NOT NULL,
    research_information text COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT dataset_pk PRIMARY KEY (id),
    CONSTRAINT dataset_label_unique UNIQUE (label),
    CONSTRAINT dataset_instrument_fk FOREIGN KEY (instrument_id)
        REFERENCES public.instrument (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT dataset_project_fk FOREIGN KEY (project_id)
        REFERENCES public.project (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.dataset OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.dataset TO immunocube;
GRANT ALL ON TABLE public.dataset TO postgres;

CREATE INDEX IF NOT EXISTS index_dataset_instument_fk
    ON public.dataset USING btree
    (instrument_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_dataset_label
    ON public.dataset USING btree
    (label COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_dataset_pk
    ON public.dataset USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_dataset_project_fk
    ON public.dataset USING btree
    (project_id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.nm_dataset_protocol
CREATE TABLE IF NOT EXISTS public.nm_dataset_protocol (
    dataset_id bigint NOT NULL,
    protocol_id bigint NOT NULL,
    CONSTRAINT nm_dataset_protocl_pk PRIMARY KEY (dataset_id, protocol_id),
    CONSTRAINT nm_dataset_protocol_fk FOREIGN KEY (dataset_id)
        REFERENCES public.dataset (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT,
    CONSTRAINT nm_protocol_dataset_fk FOREIGN KEY (protocol_id)
        REFERENCES public.protocol (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.nm_dataset_protocol OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.nm_dataset_protocol TO immunocube;
GRANT ALL ON TABLE public.nm_dataset_protocol TO postgres;

CREATE INDEX IF NOT EXISTS index_nm_dataset_protocol
    ON public.nm_dataset_protocol USING btree
    (dataset_id ASC NULLS LAST)
    INCLUDE(protocol_id)
    TABLESPACE pg_default;


-- Table: public.measurement
CREATE TABLE IF NOT EXISTS public.measurement (
    id bigint NOT NULL DEFAULT 'nextval('"Measurement_id_seq"'::regclass)',
    dataset_id bigint NOT NULL,
    label character varying(255) COLLATE pg_catalog."default" NOT NULL,
    CONSTRAINT measurement_pk PRIMARY KEY (id),
    CONSTRAINT measurement_dataset_fk FOREIGN KEY (dataset_id)
        REFERENCES public.dataset (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.measurement OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.measurement TO immunocube;
GRANT ALL ON TABLE public.measurement TO postgres;

CREATE INDEX IF NOT EXISTS index_measurement_dataset_fk
    ON public.measurement USING btree
    (dataset_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_measurement_pk
    ON public.measurement USING btree
    (id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.nm_measurement_groupingitem
CREATE TABLE IF NOT EXISTS public.nm_measurement_groupingitem (
    measurement_id bigint NOT NULL,
    groupingitem_id bigint NOT NULL,
    CONSTRAINT nm_measurment_groupingitem_pk PRIMARY KEY (measurement_id, groupingitem_id),
    CONSTRAINT nm_groupingitem_measurment_fk FOREIGN KEY (groupingitem_id)
        REFERENCES public.groupingitem (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
        NOT VALID,
    CONSTRAINT nm_measurment_groupingitem_fk FOREIGN KEY (measurement_id)
        REFERENCES public.measurement (id) MATCH SIMPLE
        ON UPDATE CASCADE
        ON DELETE RESTRICT
        NOT VALID
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.nm_measurement_groupingitem OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.nm_measurement_groupingitem TO immunocube;
GRANT ALL ON TABLE public.nm_measurement_groupingitem TO postgres;


-- Table: public.measurementvalue
CREATE TABLE IF NOT EXISTS public.measurementvalue (
    measurement_id bigint NOT NULL,
    oi_id bigint NOT NULL,
    transformation "TRANSFORMATION" NOT NULL DEFAULT 'none'::"TRANSFORMATION",
    value real NOT NULL
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.measurementvalue OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.measurementvalue TO immunocube;
GRANT ALL ON TABLE public.measurementvalue TO postgres;

CREATE INDEX IF NOT EXISTS index_measurementvalue_measurement_fk
    ON public.measurementvalue USING btree
    (measurement_id ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_measurementvalue_oi_fk
    ON public.measurementvalue USING btree
    (oi_id ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.sec_tokens
CREATE TABLE IF NOT EXISTS public.sec_tokens (
    id bigint NOT NULL,
    token character varying COLLATE pg_catalog."default" NOT NULL,
    "isUserToken" boolean NOT NULL,
    "validTill" timestamp without time zone NOT NULL,
    validated boolean NOT NULL,
    "validationCode" character varying COLLATE pg_catalog."default",
    superadmin boolean NOT NULL,
    "sharedToken" boolean NOT NULL,
    CONSTRAINT sec_tokens_pkey PRIMARY KEY (id),
    CONSTRAINT sec_tokens_unique UNIQUE (token)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.sec_tokens OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.sec_tokens TO immunocube;
GRANT ALL ON TABLE public.sec_tokens TO postgres;

CREATE INDEX IF NOT EXISTS index_sec_tokens
    ON public.sec_tokens USING btree
    (token COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;


-- Table: public.sec_users
CREATE TABLE IF NOT EXISTS public.sec_users (
    id bigint NOT NULL,
    userhash character varying COLLATE pg_catalog."default" NOT NULL,
    username character varying COLLATE pg_catalog."default" NOT NULL,
    email character varying COLLATE pg_catalog."default" NOT NULL,
    salt character varying COLLATE pg_catalog."default" NOT NULL,
    password character varying COLLATE pg_catalog."default" NOT NULL,
    created_on timestamp without time zone NOT NULL,
    expires_on timestamp without time zone,
    allow_login boolean NOT NULL DEFAULT 'false',
    CONSTRAINT sec_users_pkey PRIMARY KEY (id),
    CONSTRAINT sec_users_email_unique UNIQUE (email),
    CONSTRAINT sec_users_userhash_unique UNIQUE (userhash),
    CONSTRAINT sec_users_username_unique UNIQUE (username)
) TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.sec_users OWNER to postgres;
GRANT TRIGGER, INSERT, SELECT, UPDATE, REFERENCES ON TABLE public.sec_users TO immunocube;
GRANT ALL ON TABLE public.sec_users TO postgres;

CREATE INDEX IF NOT EXISTS index_sex_users_userhash
    ON public.sec_users USING btree
    (userhash COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS index_sex_users_username
    ON public.sec_users USING btree
    (username COLLATE pg_catalog."default" ASC NULLS LAST)
    TABLESPACE pg_default;
