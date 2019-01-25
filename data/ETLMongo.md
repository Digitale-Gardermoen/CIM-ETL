#MongoDB Certified: Best Practices for ETL Tools 
Extract, Transform, and Load (ETL) tools/applications that provide support for MongoDB should conform to the following Best Practices for certification against MongoDB Enterprise.
**MongoDB Enterprise: https://www.mongodb.com/products/downloads/mongodb-enterprise**
**Document is downloaded from: https://www.mongodb.com/partners/partner-program/technology/certification/etl-best-practices**

##Security
###Authentication
- [ ] Application should support the ability to connect to a running MongoDB deployment that utilizes built-in authentication. Specifically, tools should provide the ability for users to specify a valid username and password to authenticate against MongoDB. For more information, refer to http://docs.mongodb.org/manual/core/authentication/#mongodb-cr-authentication

- [ ] Application should support the ability to connect to a running MongoDB deployment that utilizes Kerberos (external) authentication. Specifically, tools should provide the ability for users to specify their Kerberos username and password to authenticate to the external authentication provider, via MongoDB. For more information, refer to http://docs.mongodb.org/manual/core/authentication/#kerberos-authentication

###Encryption
- [ ] Application should support the ability to connect to a running MongoDB deployment that utilizes SSL to encrypt data in-transit between the application and the database. Tools should provide users the ability to connect with or without an SSL certificate. Users should be able to supply a CA or self-signed certificate and connect to the MongoDB deployment. For more information, refer to http://docs.mongodb.org/manual/tutorial/configure-ssl/

##Connections
- [ ] Application should connect to MongoDB deployments using the standard connection string URI format. Application should support the ability to connect to (i) an individual mongod process, (ii) a MongoDB replica set (using auto-discovery), or (iii) a mongos as a frontend to a sharded cluster. For more information, refer to http://docs.mongodb.org/manual/reference/connection-string/

- [ ] Upon connection construction application should expose all possible MongoDB Read Preferences to the end user. For more information, refer to http://docs.mongodb.org/manual/core/read-preference/

- [ ] Application should function as expected when authenticating as a user with read-only roles/permissions. For more information, refer to http://docs.mongodb.org/manual/reference/user-privileges/#read

##Extract, Transform
- [ ] Application should provide users the ability to easily map JSON elements within documents to downstream data structures. Specifically, application should support the ability to unwind simple arrays or represent embedded documents using appropriate data relationships (e.g. one-to-one, one-to-many, many-to-many). For more information, refer to http://docs.mongodb.org/manual/core/data-model-design/ and http://docs.mongodb.org/manual/applications/data-models-relationships/

- [ ] Application should infer schema information by examining a subset of documents within target collections. 

- [ ] Application should allow users to add fields to discovered data model that may not have been present within the subset of documents used for schema inference.

- [ ] Application should infer information about existing indexes for collections to be queried. For more information, refer to http://docs.mongodb.org/manual/tutorial/list-indexes/

- [ ] Application should prompt and/or warn users of queries that do not contain any indexed fields. Note: simple field matching is appropriate, there is no need to execute a query explain plan in the background. For more information, refer to http://docs.mongodb.org/manual/core/query-optimization/#query-optimization

- [ ] Application should support the ability to return a subset of fields from documents using query projections. For more information, refer to http://docs.mongodb.org/manual/tutorial/project-fields-from-query-results/

- [ ] For queries against MongoDB Replica Sets, application should support the ability to specify custom MongoDB Read Preferences for individual query operations. For more information, refer to http://docs.mongodb.org/manual/core/read-preference/

- [ ] Application should infer information about sharded cluster deployments and note the shard key fields for each sharded collection. For more information, refer to http://docs.mongodb.org/manual/reference/method/sh.status/

- [ ] For queries against MongoDB Sharded Clusters, application should strongly warn the user against queries that do not use proper query isolation. Broadcast queries in a sharded cluster can have a negative impact on database performance. For more information, refer to http://docs.mongodb.org/manual/core/sharding-shard-key/#querying

##Load
- [ ] Application should support the ability to write data to any MongoDB deployment whether single node, replica set or sharded cluster.

- [ ] For writes to a MongoDB sharded cluster, application should inform and/or display an error message to the user if documents do not contain a shard key. For more information, refer to http://docs.mongodb.org/manual/core/sharding-shard-key/#shard-key

- [ ] Application should allow users to set a custom WriteConcern for any and all write operations to a running MongoDB deployment. For more information, refer to http://docs.mongodb.org/manual/core/write-concern/

- [ ] For bulk loading operations, application should support writing documents in batches using the insert() method (and provide support for ordered and unordered operations with MongoDB 2.6 and above). For more information, refer to http://docs.mongodb.org/manual/core/bulk-inserts/#use-the-insert-method and http://docs.mongodb.org/manual/reference/command/insert/#insert

- [ ] For bulk update operations with MongoDB 2.6 and above, application should support the bulk update database command (which supports ordered and unordered operations). For more information, refer to http://docs.mongodb.org/manual/reference/command/update/#dbcmd.update

- [ ] For bulk loading into a MongoDB sharded deployment, application should leverage best practices for bulk inserts into a sharded collection. Specifically, this includes pre-splitting the collection’s shard key and inserting via multiple mongos processes. For more informaiton, refer to http://docs.mongodb.org/manual/core/bulk-inserts/#bulk-inserts-on-sharded-clusters