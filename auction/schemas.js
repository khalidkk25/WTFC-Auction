const mongoose = require('mongoose');

const CaptionSchema = new mongoose.Schema({
    name: String,
    designation: String,
    score: Number,
    image: String
});
const PlayerSchema = new mongoose.Schema({
    name: String,
    designation: String,
    score: Number,
    sold: Boolean,
    image: String
});

const bittingSchema = new mongoose.Schema({
    captain: String,
    player: String,
    amount: Number
});

const Caption = mongoose.model('Caption', CaptionSchema);
const Player = mongoose.model('Player', PlayerSchema);
const Bitting = mongoose.model('Bitting', bittingSchema);
module.exports = {
    Caption, Player, Bitting
}