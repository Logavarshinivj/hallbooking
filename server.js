import express from "express";
import { MongoClient } from "mongodb";
import * as dotenv from "dotenv";
dotenv.config();

const app = express();

const PORT = process.env.PORT;

const MONGO_URL = process.env.MONGO_URL;
const client = new MongoClient(MONGO_URL); // dial
// Top level await
await client.connect(); // call
console.log("Mongo is connected !!!  ");

app.get("/", function (request, response) {
  response.send("🙋‍♂️ Welcome to Hall Booking API");
});

app.post("/create-room", express.json(), function (request, response) {
  const { roomname,maxcount,rentperday,roomId} = request.body;
  const result = client.db("hallbooking").collection("rooms").insertOne({
   roomname:roomname,
   maxcount:maxcount,
   rentperday:rentperday,
   roomId: roomId,
  });

  result
    ? response.send({ message: "room created successfully" })
    : response.status(404).send({ message: "not found" });
});

app.get("/get-rooms",express.json(),async function(req, res){
    const result=await  client.db("hallbooking").collection("rooms").find({}).toArray();
    res.send(result);
})

// Room booking
app.post("/booking", express.json(),async function (req, res) {
    const {cusname,roomname,date,roomId} = req.body;
  
    const customerDb = await getRoomId(roomId, date);
    console.log(customerDb);
    if (customerDb) {
      res.send({ message: "Room was already booked" });
    } 
    else {
      const result = client.db("hallbooking").collection("bookedrooms").insertOne({
        cusname: cusname,
        roomname:roomname,
        date: date,
        roomId: roomId,
        status: "booked",
      });
      result
        ? res.send({ message: "Room successfully booked" })
        : res.status(401).send({ message: "error occured" });
    }
  });
  
  async function getRoomId(roomId, date) {
    return await client
      .db("hallbooking")
      .collection("bookedrooms")
      .findOne({ roomId: roomId, date: date });
  }


//list all rooms with booked data

app.get("/bookedrooms", async function (request, response) {
  const result = await client
    .db("hallbooking")
    .collection("bookedrooms")
    .find({})
    .toArray();

  response.send(result);
});

//list all customers with booked data

app.get("/customers", async function (request, response) {
  const result = await client
    .db("hallbooking")
    .collection("bookedrooms")
    .find({}, {status: 0 })
    .toArray();
  console.log(result);
  response.send(result);
});
app.listen(PORT, () => console.log(`The server started in: ${PORT} ✨✨`));