const mongoose = require("mongoose");
const express = require("express");
const bodyParser = require("body-parser");
const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const CONNECT_STRING = process.env.CONNECTION_STRING;
//Connecting to the server
async function connectDB() {
  try {
    await mongoose.connect(CONNECT_STRING);
    console.log("Database Connected!");
  } catch (err) {
    console.log(err);
  }
}
//Creating the Models to interract with db
const Device = mongoose.model('Device', require('./Schemas/device'));
const InteruptData = mongoose.model("InteruptData", require("./Schemas/interuptData"));

app.post("/api/v1/device/ping", async (req, res) => {
  const deviceId = req.body.deviceId;
  const timeStamp = parseInt(req.body.lastTimeEpoch);
  if (!deviceId || !timeStamp) {
    res.status(400).send("Bad Request. No device ID or timeStamp provided");
    return;
  }
  console.log(`Receieved Ping From ${deviceId} at ${timeStamp}`)
  let device_data = await Device.findOne({ deviceId: deviceId }).select({ _id: 0, __v: 0, password: 0 }).exec();
  if (device_data) {
    await Device.updateOne({ deviceId: deviceId }, { lastPinged: timeStamp });
    res.status(200).send("OK");
  } else {
    res.status(400).send("Device is not registered.");
  }
})

app.post("/api/v1/device/reportInterupt", async (req, res) => {
  const deviceId = req.body.deviceId;
  const powercutTime = parseInt(req.body.lastTimeEpoch);
  if (!deviceId || !powercutTime) {
    res.status(400).send("Bad Request. No device ID or timeStamp provided");
    return;
  }
  console.log(`Processing interupt report from ${deviceId}. start = ${powercutTime}`);
  let device_data = await Device.findOne({ deviceId: deviceId });
  if (device_data) {
    let interuptData = await InteruptData.findOne({ deviceId: device_data.deviceId });
    interuptData.interuptData.push({
      start: powercutTime,
      end: Math.floor(new Date().getTime() / 1000)
    });
    await interuptData.save();
    res.status(200).send("OK");
  } else {
    res.status(400).send("Device is not registered.");
  }
})

app.post("/api/v1/device/create", async (req, res) => {
  try {
    let device_data = await Device.findOne(req.body).select({ _id: 0, __v: 0, password: 0 }).exec();
    if (device_data) {
      res.status(400).json({
        error: true,
        msg: "This device is already registered",
        data: device_data
      })
    } else {
      const new_data = new Device(req.body);
      await new_data.save();
      const new_inter_data = new InteruptData({ deviceId: req.body.deviceId, interuptData: [] });
      await new_inter_data.save();
      res.status(200).json({
        error: false,
        msg: "Device created successfully!"
      })
    }
  } catch (error) {
    console.log(error);
    res.status(400).json({
      error: true,
      msg: error.message
    })
  }
})

app.get("/api/v1/device/get/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;
  const device_data = await Device.findOne({ deviceId: deviceId }).select({
    _id: 0,
    __v: 0,
    password: 0
  }).exec();
  if (device_data) {
    res.status(200).json({
      error: false,
      data: device_data,
      msg: "Device found!"
    })
  } else {
    res.status(404).json({
      error: true,
      msg: "No Device Found"
    })
  }
})

app.get("/api/v1/device/interupt/get/:deviceId", async (req, res) => {
  const deviceId = req.params.deviceId;
  const device_inter_data = await InteruptData.findOne({ deviceId: deviceId }).select({_id:0,__v:0}).exec();
  if (device_inter_data) {
    res.status(200).json({
      error: false,
      data: device_inter_data,
      msg: "Device found!"
    })
  } else {
    res.status(404).json({
      error: true,
      msg: "No Device Found"
    })
  }
})


app.post("/api/v1/device/remove", async (req, res) => {
  const deviceId = req.body.deviceId;
  const password = req.body.password;
  if (!deviceId || !password) {
    res.status(400).json({
      error: true,
      msg: "No device ID or Password was sent."
    })
  } else {
    const device_data = await Device.findOne({ deviceId: deviceId, password: password });
    if (device_data) {
      await Device.deleteOne({ deviceId: deviceId, password: password });
      await InteruptData.deleteOne({deviceId:deviceId});
      res.status(200).json({
        error: false,
        msg: "Device was removed."
      })
    } else {
      res.status(404).json({
        error: false,
        msg: "No device found with that id and password"
      })
    }
  }
})

app.post("/api/v1/device/interupt/clear", async (req,res)=>{
  const deviceId = req.body.deviceId;
  if (!deviceId) {
    res.status(400).json({
      error: false,
      msg: "No device ID was provided."
    });
    return;
  }
  let device_data = await Device.findOne({ deviceId: deviceId });
  if (device_data) {
    let interuptData = await InteruptData.findOne({ deviceId: device_data.deviceId });
    interuptData.interuptData=[];
    await interuptData.save();
    res.status(200).json({
      error: false,
      msg: "Interupt data was cleared."
    });
  } else {
    res.status(400).json({
      error: true,
      msg: "Device was not found with that ID."
    });
  }
})


app.listen(process.env.PORT || 3000, async () => {
  await connectDB();
  console.log("Server Started");
})