# MitoCube

Welcome to the MitoCube repository, *feature-data* fork. **MitoCube** (/myto'cube/) is a Python Online database tool for proteomic lovers 
of mass spectrometry–based quantitative experiments .

> Current fork is not ready for productive system. 

## Installation

Please visit the (Installation help website)[https://app.mitocube.com/help/installation] to install MitoCube. The 
following documentation highlights deviations for the configuration / installation of the master version only.

### .env environment file

An `.env` file from the python-decouple package is used to handles credential for the installation. `.env` files are 
not pushed to the repository and one should not save credentials in any other file. First create the file by ...

```Shell
sudo nano .env
```

... and entering the following configurations.

```INI
email-admin=aliquis@aliquo.eu
pw-admin=quispiam
email-pw=quispiam
mitocube-pw=quispiam
global-pw=quispiam
```

Next one requires to define the data handler (`db-handler`) in `.env`. The `db-handler=pandafiles` is based on the 
legacy implementation and requires the variables `db-datadir` and `db-featurefile` to define the path of the datasets 
and the feature database file.

```INI
db-handler=pandafiles
db-datadir=~/mitocube/backend/data/static/datasets
db-featurefile=~/mitocube/backend/data/static/dbs/uniprot/features.txt
```

Alternatively, the `db-handler=postgresql` is available to store all data in the PostgreSQL  database 
(https://www.postgresql.org). The variables `db-ip`, `ddb-name`, `db-user` and `db-pw` are required.

```INI
db-handler=postgresql
db-ip=127.0.0.1
db-name=MitoCube
db-user=quispiam
db-pw=quispiam
```

### PostgreSQL database 

The database can be setup using the SQL statements in `setup_empty_postgresql_20230418.sql` found in the 
`/backend/resources/data/setup/` directory. `/backend/resources/data/` will include scripts to create the initial data
structure, but also to import existing data saved in the `/backend/data/` directories into the database.

### Apache

Apache is configured as forward proxy for the FLASK backend `http://0.0.0.0/api/`. The build of the frontend is served 
via *DocumentRoot*. 

```INI
<Directory /srv/httpd/mitocube>
   Options Indexes FollowSymLinks
   AllowOverride None
   Require all granted
</Directory>
```

For the forward proxy, these four modules needs to be enabled in Ubuntu.

```bash
sudo a2enmod proxy proxy_http proxy_balancer lbmethod_byrequests
```

On Windows system, modules are enabled by uncommenting the following lines in the `httpd.conf`.

```INI
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_module modules/mod_proxy_http.so
LoadModule proxy_module modules/mode_proxy_connect.so
LoadModule proxy_module modules/mod_ssl.so
LoadModule proxy_module modules/mod_xml2enc.so
LoadModule proxy_module modules/mod_proxy_html.so
LoadModule proxy_module modules/mod_proxy_http2.so
```

The forward proxy is configured as Virtual host in the configuration file. Only use IP addresses to minimise 
response times.

```INI
<VirtualHost *:80>
   ServerAdmin aliquis@aliquo.eu
   DocumentRoot /srv/httpd/mitocube

   ErrorLog ${APACHE_LOG_DIR}/error.log
   CustomLog ${APACHE_LOG_DIR}/access.log combined

   ProxyPreserveHost On
   ProxyPass /api http://127.0.0.1:5000/api
   ProxyPassReverse /api http://127.0.0.1:5000/api
</VirtualHost>
```

### Software Versions

The fork runs currently on the following development system. MitoCube may run on different versions / software. 

Server OS
: Ubuntu 22.04

Apache
: Apache 2.4.52 amd42 configured as forward proxy

PostgreSQL
: PostgreSQL 12.14-1 with pgAdmin4 6.19

Python3
: 3.8.16

Python Flask
: 2.0.2

Python psycopg2-binary
: 2.9.5

Node.js
: 19.5.0

npm
: 9.5.1

## Changelog *feature-data* fork

The goal for the *feature-data* fork is to upgrade the backend to support additional data management systems such as
PostgreSQL.


### version 2022-04-24

The current *preliminary* (!) implementation is proof-of-concept and allows to switch MitoCube between the 
legacy system and an PostgreSQL DBMS, but it is limited to a fixed number of datasets and does not implement the master 
version to 100% yet

#### Changes compared to master (2022-04-24)
* Created new `/backend/lib/` directory for logic content
* Moved `/backend/resources/` to `/backend/lib/oldresources/`
* Using `/backend/resources/` for resources such as setup, data import and automation scripts
* Added Data `Old*` prefix to classes in `Data.py` (e.g. *OldData*, *OldDataset*, ...)
* Added `JSONSerializable` Interface (*ABC*) in `/backend/lib/DesignPatterns.py`
* Added `SingletonABCMeta` Class (*ABCMeta*) in `/backend/lib/DesignPatterns.py`
* Added `SingletonMeta` Class () in `/backend/lib/DesignPatterns.py`
* Added abstract `MitoCubeDatabase(SingletonABCMeta)` as new `Data` Handler in `/backend/lib/DataHandling.py`
* Added abstract `MitoCubeDataCollection()` as new `DatasetCollection` in `/backend/lib/DataHandling.py`
* Added abstract `MitoCubeDataset()` as new `Dataset` in `/backend/lib/DataHandling.py`
* Added abstract `MitoCubeAbundanceTable(JSONSerializable)` as new class to handle abundance data of a `Dataset` in `/backend/lib/DataHandling.py`
* Added abstract `MitoCubeMetaInformation(JSONSerializable)` as new class to handle meta information of a `Dataset`  in `/backend/lib/DataHandling.py`
* Added abstract `MitoCubeFeatures()` implementation of `DBFeatures` in `/backend/lib/DataHandling.py`
* Added abstract `SQLConnection(SingletonABCMeta)`
* Implemented legacy file support in `/backend/lib/data/PandaFileHandly.py` by implementing abstract classes in `DataHandling.py`
* Implemented PostgreSQL support in `/backend/lib/data/PostgreSQLHandly.py` by implementing abstract classes in `DataHandling.py`
* Added UML diagrams in `/backend/config/docs/diagrams/`

#### Currently missing implementation (2022-04-24)

* Added `Token`, `PandaFileToken`, `PostgreSQLTocken` Classes in `/backend/lib/security/Token.py`
* *PTM* not implemented in Data classes yet
* Implementations of `DataHandling.py` classes are currently integrated in the old classes (*OldData*, *OldDataset*, etc.), and are hold in memory on start of the application. Currently not more than 42 datasets are loaded from the PostgreSQL database.

##### Upcoming Changes (2022-04-24)
* Swap data access via old `Data.py` classes to new `DataHandling.py` classes.
* Implement `Token` classes to support new data handler
* Implement Cache function for `PandaFileDatabase` in `PandaFileHandly.py`
* Implement Data Upload support
* Implement QC support
* Add import scripts for version migration and automation.
* Change current database structure to include tags and more meta text for data support information.
* Implement new User handling with File and PostgreSQL support.
* Create new `/lib/data/stat` directory for statistics
* Outsource statistical routines in `Data.py` and others to new statistic classes
* Streamline existing data processing routines 
* Streamline data submission forms
* Import metadata at upload from file names or other files (such as from instruments / other software)

## License
hnolCol/mitocube is licensed under the **MIT License**:

Copyright (c) 2023, Hendrik Nolte

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated
documentation files (the "Software"), to deal in the Software without restriction, including without limitation the
rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit
persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR
COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
