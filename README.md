# azure-cosmos-odm
This is an ODM for azure cosmos db, to help devs to connect to database and get data using abstracted queries

This is a 0.5v of an ODM to elp to get data from Azure Cosmos DB.


# How to use

There are simple methods to use, and one of them is .query
This query method allow you to use somenthing similar to mongoose syntax.

At file user.service, there is an query example. 
To configure, you should add the connection variables at cosmo-db, adding the right values to endpoint and key of your cosmos db.
