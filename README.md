# CIM-ETL
This is an export tool meant to extract data from AD, transform the data based on what an API wants and then store it in a mongodb.
With this data, a HTTPS client will send that data to an API.

It is solely meant as a "sync" between AD and another system.

**This app will not transform ANY data in AD, it only needs permission to read.**

## Dependencies
- [node-gyp](https://github.com/nodejs/node-gyp)
- [activedirectory2](https://www.npmjs.com/package/activedirectory2)
- [dotenv](https://www.npmjs.com/package/dotenv)
- [mongoose](https://www.npmjs.com/package/mongoose)
- [mongoDB](https://www.mongodb.com/)
- [node-cron](https://www.npmjs.com/package/node-cron)