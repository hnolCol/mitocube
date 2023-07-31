--
-- PostgreSQL database xxxxxxxxxxxxxx
--
-- Dumped from database version 12.14 (Ubuntu 12.14-1.pgdg22.04+1)
-- Dumped by pg_dump version 12.14 (Ubuntu 12.14-1.pgdg22.04+1)

-- DATABASE ------------------------------------------------------------------------------------------------------------

-- Database: Immunocube
CREATE DATABASE "ImmunoCube"
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'en_GB.UTF-8'
    LC_CTYPE = 'en_GB.UTF-8'
    CONNECTION LIMIT = -1
    IS_TEMPLATE = False;

GRANT TEMPORARY, CONNECT ON DATABASE "ImmunoCube" TO PUBLIC;
GRANT CONNECT ON DATABASE "ImmunoCube" TO immunocube;
GRANT ALL ON DATABASE "ImmunoCube" TO postgres;


-- SCHEMA: public ------------------------------------------------------------------------------------------------------

CREATE SCHEMA IF NOT EXISTS public AUTHORIZATION postgres;

-- COMMENT ON SCHEMA public IS 'standard public schema';

GRANT ALL ON SCHEMA public TO PUBLIC;
GRANT ALL ON SCHEMA public TO postgres;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
    GRANT INSERT, SELECT, UPDATE, REFERENCES, TRIGGER ON TABLES TO immunocube;


-- TYPES ---------------------------------------------------------------------------------------------------------------

CREATE TYPE dataset_state AS ENUM (
    'submitted',
    'initiated',
    'draft',
    'hidden'
);

CREATE TYPE oi_type AS ENUM (
    'proteingroup',
    'protein',
    'peptide'
);


-- TABLES AND SEQUENCES ------------------------------------------------------------------------------------------------

-- Table: Ois
CREATE TABLE oi (
    id bigserial NOT NULL,
    label character varying(255) NOT NULL,
    type public.oi_type NOT NULL,
    CONSTRAINT oi_pk PRIMARY KEY (id),
    CONSTRAINT oi_label_unique UNIQUE (label)
);

CREATE INDEX index_oi_pk ON oi USING btree (id);
CREATE INDEX index_oi_label ON oi USING HASH (label);

-- Table: instruments
CREATE TABLE instruments (
    id serial NOT NULL,
    label character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    description character varying,
    CONSTRAINT instruments_pk PRIMARY KEY (id),
    CONSTRAINT instruments_label_unique UNIQUE (label)
);

CREATE INDEX index_instruments_pk ON instruments USING btree (id);
CREATE INDEX index_instruments_label ON instruments USING HASH (label);

-- Table: datasets
CREATE TABLE datasets (
    id serial NOT NULL,
    label character varying(255) NOT NULL,
    instrument_id integer,
    created_on timestamp without time zone NOT NULL,
    uploaded_on timestamp without time zone DEFAULT now() NOT NULL,
    state public.dataset_state NOT NULL,
    experimentator character varying(255) NOT NULL,
    contact_email character varying(255) NOT NULL,
    name_group character varying(255) NOT NULL,
    title character varying(255) NOT NULL,
    CONSTRAINT datasets_pk PRIMARY KEY (id),
    CONSTRAINT datasets_label_unique UNIQUE (label),
    CONSTRAINT datasets_instruments_fk FOREIGN KEY (instrument_id) REFERENCES instruments(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_datasets_pk ON datasets USING btree (id);
CREATE INDEX index_datasets_label ON datasets USING HASH (label);

-- Table: measurements
CREATE TABLE measurements (
    id bigserial NOT NULL,
    dataset_id integer NOT NULL,
    label character varying(255) NOT NULL,
    CONSTRAINT measurements_pk PRIMARY KEY (id),
    CONSTRAINT measurements_datasets_fk FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_measurements_pk ON measurements USING btree (id);
CREATE INDEX index_measurements_dataset_id ON measurements USING btree (dataset_id);
CREATE INDEX index_measurements_label ON measurements USING HASH (label);

-- Table: measurement_values
CREATE TABLE measurement_values (
    dataset_id integer NOT NULL,
    measurement_id bigint NOT NULL,
    oi_id bigint NOT NULL,
    value real NOT NULL,
    CONSTRAINT measurement_values_datasets_fk FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT measurement_values_measurements_fk FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_measurement_values_oi_id ON measurement_values USING btree (oi_id);
CREATE INDEX index_measurement_values_dataset_id ON measurement_values USING btree (dataset_id);
CREATE INDEX index_measurement_values_measurement_id ON measurement_values USING btree (measurement_id);

-- Table: replicates
--CREATE TABLE public.replicates (
--    dataset_id bigint NOT NULL,
--    measurement_id bigint NOT NULL,
--    id integer NOT NULL,
--    CONSTRAINT replicate_pkey PRIMARY KEY (dataset_id, measurement_id),
--    CONSTRAINT replicates_datasets_fk FOREIGN KEY (dataset_id) REFERENCES public.datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
--    CONSTRAINT replicates_measurements_fk FOREIGN KEY (measurement_id) REFERENCES public.measurements(id) ON UPDATE CASCADE ON DELETE RESTRICT
--);

-- Table: metatexts
CREATE TABLE public.metatexts (
    id serial NOT NULL,
    dataset_id integer NOT NULL,
    tag character varying(255),
    title character varying(255) NOT NULL,
    text text NOT NULL,
    CONSTRAINT metatexts_pk PRIMARY KEY (id),
    CONSTRAINT metatexts_datasets_fk FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_metatexts_pk ON metatexts USING btree (id);
CREATE INDEX index_metatexts_dataset_id ON metatexts USING btree (dataset_id);
CREATE INDEX index_metatexts_label ON metatexts USING HASH (tag);

-- Table: urls
CREATE TABLE urls (
    id bigserial NOT NULL,
    dataset_id bigint NOT NULL,
    url character varying(255) NOT NULL,
    CONSTRAINT urls_pkey PRIMARY KEY (id),
    CONSTRAINT urls_datasets_fk FOREIGN KEY (dataset_id)
        REFERENCES datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_urls_pk ON urls USING btree (id);
CREATE INDEX index_urls_dataset_id ON urls USING btree (dataset_id);

-- Table: replicates
CREATE TABLE replicates (
    id bigserial NOT NULL,
    measurement_id bigint NOT NULL,
    label character varying NOT NULL,
    CONSTRAINT replicates_pkey PRIMARY KEY (id),
    CONSTRAINT replicates_measurements_fk FOREIGN KEY (measurement_id)
        REFERENCES measurements(id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);

CREATE INDEX index_replicates_pk ON replicates USING btree (id);
CREATE INDEX index_replicates_measurements_id ON replicates USING btree (measurement_id);

-- Table: attributes
CREATE TABLE attributes (
    id serial NOT NULL,
    parent_id integer,
    tag character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    priority smallint DEFAULT 1000,
    allow_as_filter boolean DEFAULT false,
    allow_for_dataset boolean DEFAULT false,
    allow_for_measurement boolean DEFAULT false,
    allow_for_users boolean DEFAULT false,
    allow_for_qc boolean DEFAULT false,
    CONSTRAINT attribute_pkey PRIMARY KEY (id),
    CONSTRAINT attribute_tag_unique UNIQUE (tag),
    CONSTRAINT attribute_attribute_fk FOREIGN KEY (parent_id) REFERENCES attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_attributes_pk ON attributes USING btree (id);
CREATE INDEX index_attributes_parent_id ON attributes USING btree (parent_id);
CREATE INDEX index_attributes_tag ON attributes USING HASH (tag);

-- Table: attribute_values
CREATE TABLE attribute_values (
    id serial NOT NULL,
    attribute_id integer,
    tag character varying(255) NOT NULL,
    name character varying(255) NOT NULL,
    details text,
    CONSTRAINT attribute_values_pkey PRIMARY KEY (id),
    CONSTRAINT attribute_values_tag_unique UNIQUE (tag),
    CONSTRAINT attribute_values_attribute_fk FOREIGN KEY (attribute_id) REFERENCES attributes(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_attribute_values_pk ON attribute_values USING btree (id);
CREATE INDEX index_attribute_values_attribute_id ON attribute_values USING btree (attribute_id);
CREATE INDEX index_attribute_values_tag ON attribute_values USING HASH (tag);

-- Table: sec_tokens
CREATE TABLE public.sec_tokens (
    token character varying NOT NULL,
    is_user_token boolean NOT NULL,
    valid_till timestamp without time zone NOT NULL,
    validated boolean NOT NULL,
    validation_code character varying,
    superadmin boolean NOT NULL,
    shared_token boolean NOT NULL,
    CONSTRAINT sec_tokens_unique UNIQUE (token)
);

CREATE INDEX index_sec_tokens_token ON public.sec_tokens USING HASH (token);

-- Table: sec_users
CREATE TABLE public.sec_users (
    user_id bigint NOT NULL,
    user_hash character varying,
    user_name character varying,
    user_firstname character varying,
    user_surname character varying,
    email character varying,
    salt character varying,
    password character varying,
    created_on timestamp without time zone[],
    expires_after timestamp without time zone,
    allow_login boolean DEFAULT false,
    CONSTRAINT sec_user_pkey PRIMARY KEY (user_id),
    CONSTRAINT sec_user_user_name_unique UNIQUE (user_name),
    CONSTRAINT sec_user_email_unique UNIQUE (email)
);

CREATE INDEX index_sec_users_pk ON public.sec_users USING btree (user_id);
CREATE INDEX index_sec_users_user_name ON public.sec_users USING HASH (user_name);
CREATE INDEX index_sec_users_email ON public.sec_users USING HASH (email);
CREATE INDEX index_sec_users_hash ON public.sec_users USING HASH (user_hash);

-- Tables: Attribute Value nm relations
CREATE TABLE nm_dataset_attribute_value (
    attribute_value_id integer NOT NULL,
    dataset_id integer NOT NULL,
    CONSTRAINT attribute_value_dataset_pkey PRIMARY KEY (attribute_value_id, dataset_id),
    CONSTRAINT nm_datasets_attribute_values_fk FOREIGN KEY (dataset_id) REFERENCES datasets(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT nm_attribute_values_datasets_fk FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_nm_dataset_attribute_value_pk ON nm_dataset_attribute_value USING btree (attribute_value_id, dataset_id);

CREATE TABLE nm_measurement_attribute_value (
    attribute_value_id integer NOT NULL,
    measurement_id bigint NOT NULL,
    CONSTRAINT attribute_value_measurement_pkey PRIMARY KEY (attribute_value_id, measurement_id),
    CONSTRAINT nm_measurements_attribute_values_fk FOREIGN KEY (measurement_id) REFERENCES measurements(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT nm_attribute_values_measurements_fk FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_nm_measurement_attribute_value_pk ON nm_measurement_attribute_value USING btree (attribute_value_id, measurement_id);

CREATE TABLE nm_users_attribute_value (
    attribute_value_id integer NOT NULL,
    user_id integer NOT NULL,
    CONSTRAINT attribute_value_users_pkey PRIMARY KEY (attribute_value_id, user_id),
    CONSTRAINT nm_users_attribute_values_fk FOREIGN KEY (user_id) REFERENCES sec_users(user_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT nm_attribute_values_users_fk FOREIGN KEY (attribute_value_id) REFERENCES attribute_values(id) ON UPDATE CASCADE ON DELETE RESTRICT
);

CREATE INDEX index_nm_users_attribute_value_pk ON nm_users_attribute_value USING btree (attribute_value_id, user_id);



-- Final Permissions and wrapping everything up ------------------------------------------------------------------------

GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO immunocube;
