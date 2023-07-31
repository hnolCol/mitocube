--
-- PostgreSQL database xxxxxxxxxxxxxx
--
-- Dumped from database version 12.14 (Ubuntu 12.14-1.pgdg22.04+1)
-- Dumped by pg_dump version 12.14 (Ubuntu 12.14-1.pgdg22.04+1)

-- Instruments ---------------------------------------------------------------------------------------------------------
-- ToDo: These Instruments are only examples, please change to your requirements!

INSERT INTO public.instruments(
	label, name, description)
	VALUES ('ignarus', 'not known (yet)', 'We are each our own devil, and we make this world our hell.');

INSERT INTO public.instruments(
	label, name, description)
	VALUES ('E1', 'Doris', 'Thermo Scientific, Orbitrap Exploris 480 Mass Spectrometer.');

INSERT INTO public.instruments(
	label, name, description)
	VALUES ('E2', 'Boris', 'Thermo Scientific, Orbitrap Exploris 480 Mass Spectrometer.');

INSERT INTO public.instruments(
	label, name, description)
	VALUES ('T', 'ChriTof', 'Bruker, timsTOF Pro 2.');



-- Attributes and Attribute Values: Data -------------------------------------------------------------------------------

-- Mock-Attributes
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'Mockup', 'att_mockup', 0,
			false, false,
			true, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_mockup'),
			'Random', 'att_mockup:random', 'Mock category that may was randomly assigned.');

INSERT INTO public.attribute_values(
	attribute_id, name, tag details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_mockup'),
			'Arbitrary', 'att_mockup:arbitrary', 'Mock category that may was randomly assigned.');


-- Organisms
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'Organism', 'att_organism', 500,
			true, true,
			true, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Other/Multiple', 'att_organism:other', 'Other/Multiple (Specify in Additional Info)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Homo sapiens', 'att_organism:human', 'Homo sapiens (Human)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Mus musculus', 'att_organism:mouse', 'Mus musculus (Mouse)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Rattus norvegicus', 'att_organism:rat', 'Rattus norvegicus (Rat)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Caenorhabditis elegans', 'att_organism:elegans', 'Caenorhabditis elegans');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Gut Microbiom', 'att_organism:gut_biom','Gut Microbiomm (Specify in Additional Info)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_organism'),
			'Saccharomyces cerevisiae', 'att_organism:yeast', 'Saccharomyces cerevisiae (Baker''s Yeast)');


-- Attributes and Attribute Values: Technical --------------------------------------------------------------------------
-- Experiment Types
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'Type of Experiment', 'att_experiment', 0,
			true, true,
			false, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Whole proteome', 'att_experiment:whole_prot', 'Whole proteome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Phosphoproteome', 'att_experiment:phosphoproteome', 'Phosphoproteome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Acetylome', 'att_experiment:acetylome', 'Acetylome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Ubiquitinome', 'att_experiment:ubiquitinome', 'Ubiquitinome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Interaction Proteome', 'att_experiment:interaction_prot', 'Interaction Proteome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Spatial Proteome', 'att_experiment:spatial_prot', 'Spatial Proteome');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Neo N-term enrichment', 'att_experiment:nterm_enrichment', 'Neo N-term enrichment');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_experiment'),
			'Other', 'att_experiment:other', 'Other (specify in additional info)');


-- Dataset Types
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'Type of Dataset', 'att_dataset', 0,
			true, true,
			false, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_dataset'),
			'de novo', 'att_dataset:de_novo', 'de novo');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_dataset'),
			'database search', 'att_dataset:db_search', 'database search');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_dataset'),
			'depracted', 'att_dataset:depracted', 'depracted');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_dataset'),
			'crude', 'att_dataset:crude', 'crude');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_dataset'),
			'Other', 'att_dataset:other', 'Other (specify in additional info)');


-- LCs
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'LC', 'att_lc', 0,
			true, true,
			false, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_lc'),
			'EasyLC1', 'att_lc:easy_lc1', 'Other (specify in additional info)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_lc'),
			'EasyLC2', 'att_lc:easy_lc2', 'Other (specify in additional info)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_lc'),
			'Evosep1', 'att_lc:evosep1', 'Other (specify in additional info)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_lc'),
			'VanquishNeo1', 'att_lc:vanquish_neo1', 'VanquishNeo1');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_lc'),
			'Other', 'att_lc:other', 'Other (specify in additional info)');


-- Quantification
INSERT INTO public.attributes(
	parent_id, name, tag, priority,
	allow_as_filter, allow_for_dataset,
	allow_for_measurement, allow_for_users,
	allow_for_qc)
	VALUES (NULL, 'Quantification', 'att_quantification', 0,
			true, true,
			false, false,
			false);

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_quantification'),
			'label-free', 'att_quantification:label_free', 'label-free');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_quantification'),
			'SILAC', 'att_quantification:silac', 'SILAC');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_quantification'),
			'isobaric', 'att_quantification:isobaric', 'isobaric (TMT)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_quantification'),
			'istopic', 'att_quantification:istopic', 'istopic (PlexDIA)');

INSERT INTO public.attribute_values(
	attribute_id, name, tag, details)
	VALUES ((SELECT id FROM attributes WHERE tag = 'att_quantification'),
			'Other', 'att_quantification:other', 'Other (specify in additional info)');