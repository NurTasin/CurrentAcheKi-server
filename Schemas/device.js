const mongoose = require("mongoose");
const deviceSchema = mongoose.Schema({
    deviceId:{
        type:String,
        required: true
    },
    lastPinged:{
        type: Number
    },
    owner:{
        type: String,
        default: "N/D"
    },
    location:{
        lat:{
            type: Number
        },
        lon:{
            type: Number
        }
    },
    password:{
        type:String,
        required: true
    }
});

module.exports = deviceSchema;