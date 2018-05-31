var mongoose = require('mongoose');
var fs = require('fs');
var CONFIG = require('./config');
var options = {
    keepAlive: 1, connectTimeoutMS: 30000
};

var jsonFilesToPush = fs.readdirSync('./json/');
var collectionNames = [];

var mi = require('mongoimport');

console.log('Attempting to connect to MongoDB...');
mongoose.connect('mongodb://' + CONFIG.dbUser  + ':' + CONFIG.dbPass + '@' + CONFIG.dbLoc  + ':' + CONFIG.dbPort + '/' + CONFIG.dbName, options);
console.log('Connected to MongoDB');


mongoose.connection.on('error', () => {
    console.log('Error establishing connection to MongoDB.');
})

mongoose.connection.once('open', () => {
    console.log('Connection open...');

    if (process.argv.slice(2,3)[0] === 'add'){
        console.log(jsonFilesToPush);
        jsonFilesToPush.forEach((fileName) => {
            addToDb(fileName);
        });
    }

    if (process.argv.slice(2,3)[0] === 'dropadd'){
        try{
            var a = mongoose.connection.db.listCollections().toArray((err, names) => {
                names.forEach((name) =>{
                    if (name instanceof Object){
                        if (!name.name.includes('system')){
                            mongoose.connection.db.dropCollection(name.name)
                            .then((a)=>{
                                console.log('Dropped collection name: ' + name.name);
                                addToDb(name.name+'.json');
                            }, (a) =>{
                                console.log('Error dropping collection name: ' + name.name, a);
                                process.exit(1);
                            });
                        } 
                    } else {
                        mongoose.connection.db.dropCollection(name)
                        .then((a)=>{
                            console.log('Dropped collection name: ' + name);
                            addToDb(name+'.json');
                        }, (a) =>{
                            console.log('Error dropping collection name: ' + name, a);
                            process.exit(1);
                        });
                    }
                })
            });
    
        } catch (e) {
            console.log('error', e);
        }
    }

    if (process.argv.slice(2,3)[0] === 'drop'){
        try{
            var a = mongoose.connection.db.listCollections().toArray((err, names) => {
                names.forEach((name) =>{
                    if (name instanceof Object){
                        if (!name.name.includes('system')){
                            mongoose.connection.db.dropCollection(name.name)
                            .then((a)=>{
                                console.log('Dropped collection name: ' + name.name);
                            }, (a) =>{
                                console.log('Error dropping collection name: ' + name.name, a);
                                process.exit(1);
                            });
                        } 
                    } else {
                        mongoose.connection.db.dropCollection(name)
                        .then((a)=>{
                            console.log('Dropped collection name: ' + name);
                        }, (a) =>{
                            console.log('Error dropping collection name: ' + name, a);
                            process.exit(1);
                        });
                    }
                })
            }); 
        } catch (e) {
            console.log('error', e);
        }
    }

})


function addToDb(fileName){
    try{
        var file = fs.readFileSync('./json/'+fileName, {encoding: 'utf-8'});
        var collectionName = fileName.replace('.json', '');
        if (file[0] !== '['){
            file = '[' + file + ']';
        }
        if (file.length > 16777216){
            //Have to use MongoImport here
            console.log('Collection: ' + collectionName + ' is too large! Attempting to use MongoImport...');
            var config = {
                fields: JSON.parse(removeAsianCharacters(file)),
                db: CONFIG.dbName,
                collection: collectionName,

                host: CONFIG.dbLoc+':'+CONFIG.dbPort,
                username: CONFIG.dbName,
                password: CONFIG.dbPass,
                callback: (err, db) => {
                    if (err){
                        console.log(err);
                        process.exit(1);
                    }
                }
            }
            mi(config);
            console.log('Oversided Collection ' + collectionName + ' Added!');
        } else {
            mongoose.connection.db.createCollection(collectionName)
            .then((a) => {
                console.log('Created ' + collectionName +' Successfully!');
                mongoose.connection.db.collection(collectionName).insertMany(JSON.parse(file))
                .then((a)=>{
                    console.log('Insert '+ collectionName +' Successfully!');
                }, (a)=>{
                    console.log('CollectionName: ' + collectionName + ' Insert Rejected!', a);
                    process.exit(1);
                });
            }, (a) =>{
                console.log('Error creating Collection Name: '+ collectionName , a);
                process.exit(1);
            });
        }
    } catch (e){
        console.log('Error!', e);
    }
}