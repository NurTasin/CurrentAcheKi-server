const express = require("express")
const bodyParser = require("body-parser")

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.text())
app.post("/api/v1/device/reportInterupt", async (req,res)=>{
    console.log(`[POWERCUT] on ${req.body.deviceID} from "${new Date(parseInt(req.body.lastTimeEpoch)*1000).toLocaleString("en-US",{timeZone:"Asia/Dhaka"})}" to "${new Date().toLocaleString("en-US",{timeZone:"Asia/Dhaka"})}"`);
    res.status(200).send("OK");
})
app.post("/api/v1/device/ping", async (req,res)=>{
    console.log(`[PING] by ${req.body.deviceID} at "${new Date(parseInt(req.body.lastTimeEpoch)*1000).toLocaleString("en-US",{timeZone:"Asia/Dhaka"})}"`)
    res.status(200).send("OK")
})
app.listen(3000,()=>{
    console.log("Server Started!!");
})