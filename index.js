const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { Caption, Player, Bitting } = require('./schemas');

// const { MongoClient } = require('mongodb');
// const uri = "mongodb://localhost:27017/";
// const client = new MongoClient(uri);

// This tells the app: Use the Cloud DB if available, otherwise use Local
const dbURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/football';

mongoose.connect(dbURI)
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

const app = express();
const PORT = 3000;
app.use(bodyParser.json({ limit: "500mb" }));

// Serve static files from the "public" directory
app.use(express.static(path.join(__dirname, 'public')));

// Default route (optional, if you want to serve index.html explicitly)
// app.get('/', (req, res) => {
//     res.sendFile(path.join(__dirname, 'public', 'index.html'));
// });


// --------------------------Caption---
app.post('/captain', async (req, res) => {
    try {
        const item = new Caption(req.body);
        await item.save();
        res.status(201).send(item);
    } catch (err) {
        console.log(err)
        res.status(400).send(err);
    }
});
app.get('/captains', async (req, res) => {
    const items = await Caption.find();
    res.send(items);
});

app.get('/captain/:id', async (req, res) => {
    const item = await Caption.findById(req.params.id);
    res.send(item);
});

app.put('/captain/:id', async (req, res) => {
    try {
        const item = await Caption.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
        res.send(item);
    } catch (err) {
        res.status(400).send(err);
    }
});


// -----------------------------Player
app.post('/player', async (req, res) => {
    try {
        const item = new Player(req.body);
        await item.save();
        res.status(201).send(item);
    } catch (err) {
        res.status(400).send(err);
    }
});
app.get('/players', async (req, res) => {
    const items = await Player.find();
    res.send(items);
});

// Get single item by ID
app.get('/player/:id', async (req, res) => {
    const item = await Player.findById(req.params.id);
    res.send(item);
});

app.put('/player/:id', async (req, res) => {
    try {
        const item = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(item);
    } catch (err) {
        res.status(400).send(err);
    }
});

app.post("/buy", async (req, res) => {
    try {
        const { amount } = req.body
        const player = await Player.findByIdAndUpdate(req.body.player,
            { $inc: { score: amount }, sold: true },
            { returnDocument: 'after' });
        const captain = await Caption.findByIdAndUpdate(req.body.captain,
            { $inc: { score: -(amount) } },
            { returnDocument: 'after' });
        const item = new Bitting(req.body);
        await item.save();


        // const item = await Player.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.send(item);
    } catch (err) {
        res.status(400).send(err);
    }
})
app.get("/bitting", async (req, res) => {
    const result = await Bitting.aggregate([
        {
            $addFields: {
                playerID: { $toObjectId: "$player" },
                captainID: { $toObjectId: "$captain" }
            }
        },
        {
            $lookup: {
                from: "players",
                localField: "playerID",
                foreignField: "_id",
                as: "playerDetails"
            }
        },
        {
            $lookup: {
                from: "captions",
                localField: "captainID",
                foreignField: "_id",
                as: "captionDetails"
            }
        },
        { $unwind: "$playerDetails" },
        { $unwind: "$captionDetails" }
    ])
    res.status(200).send(result)
})

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});




