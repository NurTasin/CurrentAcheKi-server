const mongoose = require("mongoose");

const interuptDataSchema = mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    interuptData:[
        {
            start: {
                type: Number
            },
            end:{
                type: Number
            }
        }
    ]
});

module.exports = interuptDataSchema;