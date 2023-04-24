
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

CREATE TYPE public."DATASET_STATE" AS ENUM (
    'submitted',
    'hidden'
);

CREATE TYPE public."DATASET_TAG" AS ENUM (
    'de novo',
    'database search',
    'depracted',
    'crude'
);

CREATE TYPE public."EXPERIMENT" AS ENUM (
    'Whole proteome',
    'Neo N-term enrichment',
    'Phophoproteome',
    'Acetylome',
    'Ubiquitinome',
    'Pulse-SILAC',
    'Immunoprecipitation',
    'Other (Specify in Additional Info)'
);

CREATE TYPE public."METATEXT" AS ENUM (
    'research_aim',
    'sample_preparation',
    'data_analysis'
);

CREATE TYPE public."OI_TYPE" AS ENUM (
    'ProteinGroup',
    'Protein',
    'Peptide'
);

CREATE TYPE public."ORGANISM" AS ENUM (
    'Homo sapiens (Human)',
    'Mus musculus (Mouse)',
    'Rattus norvegicus (Rat)',
    'Caenorhabditis elegans',
    'Gut Microbiome (Specify in Additional Info)',
    'Saccharomyces cerevisiae (Baker''s Yeast)',
    'Other/Multiple (Specify in Additional Info)'
);

CREATE TYPE public."TRANSFORMATION" AS ENUM (
    'none',
    'ln',
    'log10'
);

-- TABLES AND SEQUENCES ------------------------------------------------------------------------------------------------

CREATE TABLE public.dataset (
    id bigint NOT NULL,
    project_id bigint,
    label character(255) NOT NULL,
    instrument_id bigint NOT NULL,
    created_on timestamp without time zone NOT NULL,
    uploaded_on timestamp without time zone DEFAULT now() NOT NULL,
    state public."DATASET_STATE" NOT NULL,
    experimentator character(255) NOT NULL,
    contact_email character(255) NOT NULL,
    name_group character(255) NOT NULL,
    title character(255) NOT NULL,
    research_question text NOT NULL,
    protein_of_interest character(255) NOT NULL,
    organism character(255) NOT NULL,
    type character(255) NOT NULL,
    material character(255) NOT NULL,
    research_aim text NOT NULL,
    research_sample_preparation text NOT NULL,
    research_information text NOT NULL
);

CREATE SEQUENCE public."Dataset_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Dataset_id_seq" OWNED BY public.dataset.id;

CREATE SEQUENCE public."GroupingItem_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE SEQUENCE public."Grouping_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public.instrument (
    id bigint NOT NULL,
    label character(255) NOT NULL,
    description character varying DEFAULT 'NULL'::character varying
);

CREATE SEQUENCE public."Instrument_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Instrument_id_seq" OWNED BY public.instrument.id;

CREATE TABLE public.measurement (
    id bigint NOT NULL,
    dataset_id bigint NOT NULL,
    label character(255) NOT NULL
);

CREATE SEQUENCE public."Measurement_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Measurement_id_seq" OWNED BY public.measurement.id;

CREATE TABLE public.oi (
    id bigint NOT NULL,
    label character(255) NOT NULL,
    type public."OI_TYPE" NOT NULL
);

CREATE SEQUENCE public."OI_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."OI_id_seq" OWNED BY public.oi.id;

CREATE TABLE public.project (
    id bigint NOT NULL,
    label character(255) NOT NULL,
    description character varying DEFAULT 'NULL'::character varying
);

CREATE SEQUENCE public."Project_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Project_id_seq" OWNED BY public.project.id;

CREATE TABLE public.protocol (
    id bigint NOT NULL,
    label character(255) NOT NULL,
    url character varying DEFAULT 'NULL'::character varying,
    description character varying DEFAULT 'NULL'::character varying,
    parent_id bigint
);

CREATE SEQUENCE public."Protocol_id_seq"
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

ALTER SEQUENCE public."Protocol_id_seq" OWNED BY public.protocol.id;

CREATE TABLE public.dataset_metatext (
    id bigint NOT NULL,
    dataset_id bigint NOT NULL,
    type public."METATEXT" NOT NULL,
    text text NOT NULL
);

CREATE TABLE public.dataset_tags (
    dataset_id bigint NOT NULL,
    tag public."DATASET_TAG" NOT NULL
);

CREATE TABLE public."grouping" (
    id bigint DEFAULT nextval('public."Grouping_id_seq"'::regclass) NOT NULL,
    label character(255) NOT NULL,
    priority smallint DEFAULT '8000'::smallint
);

CREATE TABLE public.groupingitem (
    id bigint DEFAULT nextval('public."GroupingItem_id_seq"'::regclass) NOT NULL,
    grouping_id bigint NOT NULL,
    label character(255) NOT NULL
);

CREATE TABLE public.measurementvalue (
    measurement_id bigint NOT NULL,
    oi_id bigint NOT NULL,
    transformation public."TRANSFORMATION" DEFAULT 'none'::public."TRANSFORMATION" NOT NULL,
    value real NOT NULL
);

CREATE TABLE public.nm_dataset_protocol (
    dataset_id bigint NOT NULL,
    protocol_id bigint NOT NULL
);

CREATE TABLE public.nm_measurement_groupingitem (
    measurement_id bigint NOT NULL,
    groupingitem_id bigint NOT NULL
);

CREATE TABLE public.sec_tokens (
    id bigint NOT NULL,
    token character varying NOT NULL,
    "isUserToken" boolean NOT NULL,
    "validTill" timestamp without time zone NOT NULL,
    validated boolean NOT NULL,
    "validationCode" character varying,
    superadmin boolean NOT NULL,
    "sharedToken" boolean NOT NULL
);

CREATE TABLE public.sec_users (
    id bigint NOT NULL,
    userhash character varying NOT NULL,
    username character varying NOT NULL,
    email character varying NOT NULL,
    salt character varying NOT NULL,
    password character varying NOT NULL,
    created_on timestamp without time zone NOT NULL,
    expires_on timestamp without time zone,
    allow_login boolean DEFAULT false NOT NULL
);

CREATE TABLE public.uniprot_features (
    entry character varying(32) NOT NULL,
    entry_name character varying NOT NULL,
    status character varying,
    protein_names character varying NOT NULL,
    gene_names character varying,
    organism character varying NOT NULL,
    length integer NOT NULL,
    subcellular_location character varying,
    sequence character varying NOT NULL,
    function character varying,
    go_bp character varying,
    go_cp character varying,
    go_mf character varying,
    active_site character varying,
    binding_site character varying,
    activity_regulation character varying,
    domain character varying,
    cross_reference_corum character varying,
    tissue_specificity character varying,
    interacts_with character varying,
    subunit_structure character varying,
    primary_gene_names character varying,
    mc3_list character varying,
    mc3_evidence character varying,
    mc3_submitolocalization character varying,
    mc3_mitopathways character varying,
    tissues character varying,
    complex_name character varying,
    complex_id character varying,
    mitocop character varying,
    mitocop_disease_gene character varying,
    mitocop_disease_association character varying,
    mitocop_functional_classification character varying,
    halflife_hela double precision,
    halflife_hu7 double precision,
    tomm40_importomics character varying,
    mean_log2_ratio double precision,
    mean_mitocopies_cell double precision,
    mean_copy_numbers_cell double precision,
    category character varying,
    integral real,
    membrane_associated real,
    oi_id bigint
);

ALTER TABLE ONLY public.dataset ALTER COLUMN id SET DEFAULT nextval('public."Dataset_id_seq"'::regclass);

ALTER TABLE ONLY public.instrument ALTER COLUMN id SET DEFAULT nextval('public."Instrument_id_seq"'::regclass);

ALTER TABLE ONLY public.measurement ALTER COLUMN id SET DEFAULT nextval('public."Measurement_id_seq"'::regclass);

ALTER TABLE ONLY public.oi ALTER COLUMN id SET DEFAULT nextval('public."OI_id_seq"'::regclass);

ALTER TABLE ONLY public.project ALTER COLUMN id SET DEFAULT nextval('public."Project_id_seq"'::regclass);

ALTER TABLE ONLY public.protocol ALTER COLUMN id SET DEFAULT nextval('public."Protocol_id_seq"'::regclass);


-- PRIMARY KES AND UNIQUE CONSTRAINTS ----------------------------------------------------------------------------------

ALTER TABLE ONLY public.dataset
    ADD CONSTRAINT dataset_label_unique UNIQUE (label);

ALTER TABLE ONLY public.dataset_metatext
    ADD CONSTRAINT dataset_metatext_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.dataset_metatext
    ADD CONSTRAINT dataset_metatext_type_unique UNIQUE (dataset_id, type);

ALTER TABLE ONLY public.dataset
    ADD CONSTRAINT dataset_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.dataset_tags
    ADD CONSTRAINT dataset_tag_unique UNIQUE (dataset_id, tag);

ALTER TABLE ONLY public."grouping"
    ADD CONSTRAINT grouping_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.groupingitem
    ADD CONSTRAINT groupinglabel_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_label_unique UNIQUE (label);

ALTER TABLE ONLY public.instrument
    ADD CONSTRAINT instrument_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.measurement
    ADD CONSTRAINT measurement_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.nm_dataset_protocol
    ADD CONSTRAINT nm_dataset_protocol_pk PRIMARY KEY (dataset_id, protocol_id);

ALTER TABLE ONLY public.nm_measurement_groupingitem
    ADD CONSTRAINT nm_measurment_groupingitem_pk PRIMARY KEY (measurement_id, groupingitem_id);

ALTER TABLE ONLY public.oi
    ADD CONSTRAINT oi_label_unique UNIQUE (label);

ALTER TABLE ONLY public.oi
    ADD CONSTRAINT oi_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_label_unique UNIQUE (label);

ALTER TABLE ONLY public.project
    ADD CONSTRAINT project_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.protocol
    ADD CONSTRAINT protocol_label_unique UNIQUE (label);

ALTER TABLE ONLY public.protocol
    ADD CONSTRAINT protocol_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.sec_tokens
    ADD CONSTRAINT sec_tokens_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.sec_tokens
    ADD CONSTRAINT sec_tokens_unique UNIQUE (token);

ALTER TABLE ONLY public.sec_users
    ADD CONSTRAINT sec_users_email_unique UNIQUE (email);

ALTER TABLE ONLY public.sec_users
    ADD CONSTRAINT sec_users_pk PRIMARY KEY (id);

ALTER TABLE ONLY public.sec_users
    ADD CONSTRAINT sec_users_userhash_unique UNIQUE (userhash);

ALTER TABLE ONLY public.sec_users
    ADD CONSTRAINT sec_users_username_unique UNIQUE (username);

ALTER TABLE ONLY public.uniprot_features
    ADD CONSTRAINT uniprot_features_entry_name_unique UNIQUE (entry_name);

ALTER TABLE ONLY public.uniprot_features
    ADD CONSTRAINT uniprot_features_pk PRIMARY KEY (entry);


-- INDEXS --------------------------------------------------------------------------------------------------------------

CREATE INDEX fki_protocol_parent_fk ON public.protocol USING btree (parent_id);

CREATE INDEX index_dataset_instument_fk ON public.dataset USING btree (instrument_id);

CREATE INDEX index_dataset_label ON public.dataset USING btree (label);

CREATE INDEX index_dataset_metatext_fk ON public.dataset_metatext USING btree (dataset_id);

CREATE INDEX index_dataset_metatext_pk ON public.dataset_metatext USING btree (id);

CREATE INDEX index_dataset_pk ON public.dataset USING btree (id);

CREATE INDEX index_dataset_project_fk ON public.dataset USING btree (project_id);

CREATE INDEX index_dataset_tag_fk ON public.dataset_tags USING btree (dataset_id);

CREATE INDEX index_dataset_tag_tags ON public.dataset_tags USING btree (tag);

CREATE INDEX index_grouping_pk ON public."grouping" USING btree (id);

CREATE INDEX index_groupingitem_grouping_fk ON public.groupingitem USING btree (grouping_id);

CREATE INDEX index_groupingitem_pk ON public.groupingitem USING btree (id);

CREATE INDEX index_measurement_dataset_fk ON public.measurement USING btree (dataset_id);

CREATE INDEX index_measurement_pk ON public.measurement USING btree (id);

CREATE INDEX index_measurementvalue_measurement_fk ON public.measurementvalue USING btree (measurement_id);

CREATE INDEX index_measurementvalue_oi_fk ON public.measurementvalue USING btree (oi_id);

CREATE INDEX index_nm_dataset_protocol ON public.nm_dataset_protocol USING btree (dataset_id) INCLUDE (protocol_id);

CREATE INDEX index_oi_label ON public.oi USING hash (label);

CREATE INDEX index_oi_pk ON public.oi USING btree (id);

CREATE INDEX index_sec_tokens ON public.sec_tokens USING btree (token);

CREATE INDEX index_sex_users_userhash ON public.sec_users USING btree (userhash);

CREATE INDEX index_sex_users_username ON public.sec_users USING btree (username);

CREATE INDEX index_uniprot_features_entry_name ON public.uniprot_features USING btree (entry_name);

CREATE INDEX index_uniprot_features_entry_pk ON public.uniprot_features USING btree (entry);

CREATE INDEX index_uniprot_features_oi_id ON public.uniprot_features USING btree (oi_id);


-- FOREIGN KEYS --------------------------------------------------------------------------------------------------------

ALTER TABLE ONLY public.dataset
    ADD CONSTRAINT dataset_instrument_fk FOREIGN KEY (instrument_id) REFERENCES public.instrument(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.dataset_metatext
    ADD CONSTRAINT dataset_metatext_dataset_fk FOREIGN KEY (dataset_id) REFERENCES public.dataset(id) ON UPDATE CASCADE ON DELETE RESTRICT;;

ALTER TABLE ONLY public.dataset
    ADD CONSTRAINT dataset_project_fk FOREIGN KEY (project_id) REFERENCES public.project(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.dataset_tags
    ADD CONSTRAINT dataset_tags_fk FOREIGN KEY (dataset_id) REFERENCES public.dataset(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.groupingitem
    ADD CONSTRAINT groupinglabel_grouping_fk FOREIGN KEY (grouping_id) REFERENCES public."grouping"(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.measurement
    ADD CONSTRAINT measurement_dataset_fk FOREIGN KEY (dataset_id) REFERENCES public.dataset(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.nm_dataset_protocol
    ADD CONSTRAINT nm_dataset_protocol_fk FOREIGN KEY (dataset_id) REFERENCES public.dataset(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.nm_measurement_groupingitem
    ADD CONSTRAINT nm_groupingitem_measurment_fk FOREIGN KEY (groupingitem_id) REFERENCES public.groupingitem(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public.nm_measurement_groupingitem
    ADD CONSTRAINT nm_measurment_groupingitem_fk FOREIGN KEY (measurement_id) REFERENCES public.measurement(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT VALID;

ALTER TABLE ONLY public.nm_dataset_protocol
    ADD CONSTRAINT nm_protocol_dataset_fk FOREIGN KEY (protocol_id) REFERENCES public.protocol(id) ON UPDATE CASCADE ON DELETE RESTRICT;

ALTER TABLE ONLY public.uniprot_features
    ADD CONSTRAINT uniprot_features_oi_fk FOREIGN KEY (oi_id) REFERENCES public.oi(id) ON UPDATE CASCADE NOT VALID;



