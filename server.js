const express = require('express')
const app = express()
const port = 3000
const bcrypt = require('bcrypt')
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const { request } = require('http');
const {MongoClient} = require('mongodb');

app.use(express.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.set("views", __dirname + "/views"); 

const uri = "mongodb+srv://textUser:notestime@cluster0.laaax.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
//const users = []
var curuser = {}


// Page with hyperlinks for different stuff
app.get('/', (req, res) => {
    fs.readFile(__dirname + "/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})


// Displays login page
app.get('/login', (req, res) => {
    // var str = ''
    // str += req.body.fname
    // str += ' '
    // str += req.body.psw
    // res.send(`Full name is:${req.body.fname} ${req.body.psw}.`);
    fs.readFile(__dirname + "/login.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

// Returns list of users
// app.get('/users', (req, res) => {
//     res.json(users)
//     //res.send('Hello world')
// })

// Stores the username and password in users array
app.post('/users', async (req, res) => {
    try{
        const salt = await bcrypt.genSalt()
        const hashedPassword = await bcrypt.hash(req.body.psw, salt)
        //console.log(salt)
        //console.log(hashedPassword)
        const user = {name: req.body.fname, password: hashedPassword, text: ""}
        const client = new MongoClient(uri, { useUnifiedTopology:true })
        try{
            await client.connect()
            const dbuser = await client.db("users").collection("information").findOne({ name: user.name });
            if (dbuser) {
                res.status(400).send("Username already taken, please enter another username")
            } else {
                try{
                    const result = await client.db("users").collection("information").insertOne(user)
                    console.log(`New listing created with the following id: ${result.insertedId}`)
                    fs.readFile(__dirname + "/index.html")
                        .then(contents => {
                            res.setHeader("Content-Type", "text/html");
                            res.writeHead(200);
                            res.end(contents);
                        })
                        .catch(err => {
                            res.writeHead(500);
                            res.end(err);
                            return;
                        });
                } catch(e){
                    console.error(e)
                }
            }
        } catch(e){
            console.error(e)
        } finally{
            await client.close()
        }


      
        //users.push(user)
        
    } catch {
        res.status(500).send()
    }
})

// Page to create a user
app.get('/user_creation', (req, res) => {
    fs.readFile(__dirname + "/user_creation.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

// Page to find a user
app.get('/find', (req, res) => {
    fs.readFile(__dirname + "/find.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

// Code to actually check login input (currently only accepts distinct usernames)
app.post('/login_check', async (req, res) => {
    var reques = req.body.fname
    var user = {};
    const client = new MongoClient(uri, { useUnifiedTopology:true })
    try {
        await client.connect()
        const user = await client.db("users").collection("information").findOne({ name: reques });

        if (user) {
            console.log(`Found a user in the collection with the name '${reques}':`);
            console.log(user);
            try{
                if(await bcrypt.compare(req.body.psw, user.password)){
                    //res.send("Success")
                    curuser = {name: user.name}
                    fs.readFile(__dirname + "/textpage.html")
                        .then(contents => {
                            res.setHeader("Content-Type", "text/html");
                            res.writeHead(200);
                            res.end(contents);
                        })
                        .catch(err => {
                            res.writeHead(500);
                            res.end(err);
                            return;
                        });
                }
                else{
                    res.send("Please check username and password and try again")
                }
            } catch {
                res.status(500).send()
            }
        } else {
            console.log(`No users found with the name '${reques}'`);
        }
    } catch(e){
        console.error(e)
    } finally{
        await client.close()
    }
    //var user = users.find(user => user.name == reques)
    // if(user == null){
    //     res.status(400).send("Unable to find user")
    // }
    
})


// Code to actually check if user exists
app.post('/user_exists_check', async (req, res) => {
    var reques = req.body.name
    //var user = users.find(user => user.name == reques)
    const client = new MongoClient(uri, { useUnifiedTopology:true })
    try {
        await client.connect()
        const user = await client.db("users").collection("information").findOne({ name: reques });

        if (user) {
            console.log(`Found a user in the collection with the name '${reques}':`);
            console.log(user);
            res.status(201).send("User exists!")
        } else {
            console.log(`No users found with the name '${reques}'`);
            res.status(400).send("Unable to find user")
        }
    } catch(e){
        console.error(e)
    } finally{
        await client.close()
    }

    

    // if(user == null){
    //     res.status(400).send("Unable to find user")
    // }
    // else{
    //     res.status(201).send("User exists!")
    // }
})


// Cool looking page
app.get('/coolpage', (req, res) => {
    fs.readFile(__dirname + "/mainpage.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

// Stores user text in users array
app.post('/process_stuff', async (req, res) => {
    // var user = users.find(user => user.name == curuser.name)
    // user.text = req.body.notes
    const client = new MongoClient(uri, { useUnifiedTopology:true })
    try{
        await client.connect()
        const result = await client.db("users").collection("information")
        .updateOne({ name: curuser.name }, { $set: {text: req.body.notes} });
        console.log(`${result.matchedCount} document(s) matched the query criteria.`);
        console.log(`${result.modifiedCount} document(s) was/were updated.`);
    } catch(e){
        console.error(e)
    } finally{
        await client.close()
    }

    fs.readFile(__dirname + "/index.html")
        .then(contents => {
            res.setHeader("Content-Type", "text/html");
            res.writeHead(200);
            res.end(contents);
        })
        .catch(err => {
            res.writeHead(500);
            res.end(err);
            return;
        });
})

// Returns curuser
app.get('/data', async (req, res) => {
    const client = new MongoClient(uri, { useUnifiedTopology:true })
    try{
        await client.connect()
        const user = await client.db("users").collection("information").findOne({ name: curuser.name });
        if (user) {
            console.log(user)
            res.send(user.text)
        } else {
            console.log(`No users found with the name '${reques}'`);
            res.status(400).send("Unable to find user")
        }
    } catch(e){
        console.error(e)
    } finally{
        await client.close()
    }

    
    //res.send('Hello world')
})

app.get('/delete', async (req, res) => {
    const client = new MongoClient(uri, { useUnifiedTopology:true })
    try{
        await client.connect()
        const user = await client.db("users").collection("information").deleteMany({});
    } catch(e){
        console.error(e)
    } finally{
        await client.close()
    }
    
    res.status(201).send("Database cleared")
})




// Needed to specify which localhost port
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})