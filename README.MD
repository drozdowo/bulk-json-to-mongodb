# Bulk JSON to MongoDB
## Quickly add large amounts of data in JSON format to your MongoDB Database

### How to use:
First, clone the repository in a new directory:
`git clone https://github.com/drozdowo/bulk-json-to-mongodb.git`
Then, navigate to the directory and run:
`npm install`
To install the dependencies. Then, delete the "DELETEME.json" file in the ./json directory and 
replace it with your json files. Finally, set up the config in 'config.js' to match your Database
configuration and run:
`node index.js <add/dropadd/drop>`
#### add
Will add every .json file in a collection that matches the name of the file.
#### dropadd
Will **DROP EVERY COLLECTION IN THE DB (BESIDES SYSTEM COLLECTIONS) AND THEN RUN THE ADD FUNCTION ABOVE**.
This is useful if you have a db that will only contain the json data, so you can re-run this at a scheduled
interval to get the new .json data into your mongodb database.
#### drop
Will **DROP EVERY COLLECTION IN THE DB (BESIDES SYSTEM COLLECTIONS)**. You can then run add manually