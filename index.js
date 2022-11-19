const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
const app = express();
const ObjectId = require("mongodb").ObjectId;
const port = process.env.PORT || 5000;

// using middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://dbuser1:CaGoRSw2kcclwfya@cluster0.eekknml.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

async function run() {
  try {
    await client.connect();
    const userCollection = client.db("foodExpress").collection("user");
    const user = { name: "Mahiya mahi", email: "mahi@gmail.com" };
    // const result = await userCollection.insertOne(user);
    const postCollection = client.db("generalPosts").collection("userPost");
    const reportedPostCollection = client
      .db("generalPosts")
      .collection("reportedUserPost");
    // posting data on database
    app.post("/posts", async (req, res) => {
      const post = req.body;
      console.log(post);
      const result = await postCollection.insertOne(post);
      console.log(`Data posted at ${result.insertedId}`);
      res.send(result);
    });
    // getting data from user
    app.get("/posts", async (req, res) => {
      const query = {};
      const cursor = await postCollection.find(query);
      const posts = await cursor.toArray();
      res.send(posts);
    });
    // Getting only single post
    app.get("/post/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };

      const result = await postCollection.findOne(query, {});
      res.send(result);
    });

    // posting reported posts in mongodb
    app.post("/posts/reported", async (req, res) => {
      const post = req.body;
      console.log(post);
      const result = await reportedPostCollection.insertOne(post);
      res.send(result);
    });

    // updating comments for individual posts

    app.put("/posts/:id", async (req, res) => {
      const id = req.params.id;
      // console.log("put command id : ", id);
      const updatedComment = req.body;
      // console.log(updatedComment);
      const filter = { _id: ObjectId(id) };
      const options = { upsert: true };
      const postObj = await postCollection.findOne(filter, {});
      const oldComment = postObj.comment;
      const newUpdatedComment = [...oldComment, updatedComment];

      // console.log(newUpdatedComment);
      const updatedPost = {
        $set: {
          comment: newUpdatedComment,
        },
      };
      const result = await postCollection.updateOne(
        filter,
        updatedPost,
        options
      );
      // console.log("comment updated".red);
      res.send(result);
    });

    // getting reported posts in mongodb

    app.get("/posts/reported", async (req, res) => {
      const query = {};
      const cursor = await reportedPostCollection.find(query);
      const posts = await cursor.toArray();
      res.send(posts);
    });

    // Deleteing user based on their id
    app.delete("/posts/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await postCollection.deleteOne(query);
      res.send(result);
    });
    // console.log(`User inserted with id ${result.insertedId}`);
  } finally {
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hello from server");
});
app.listen(port, (req, res) => {
  console.log(`Server is on at ${port}`);
});
