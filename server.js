const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const app = express();
const griddb = require("griddb-node-api");

const PORT = 3000;
const HOST = "0.0.0.0";
const server = http.createServer(app);
const io = socketio(server);
const factory = griddb.StoreFactory.getInstance();
const store = factory.getStore({
  notificationMember: "127.0.0.1:10001",
  clusterName: "myCluster",
  username: "admin",
  password: "admin",
});

// Schema
var timeConInfo = new griddb.ContainerInfo({
  name: "Chat",
  columnInfoList: [
    ["timestamp", griddb.Type.TIMESTAMP],
    ["username", griddb.Type.STRING],
    ["message", griddb.Type.STRING],
  ],
  type: griddb.ContainerType.TIME_SERIES,
  rowKey: true,
});

// Function to handle the "chat_message" event and store the message in GridDB
async function handleChatMessage(data) {
  try {
    let time_series;
    store
      .putContainer(timeConInfo, false)
      .then((ts) => {
        time_series = ts;
        return ts.put([new Date(), data.username, data.message]);
      })
      .then(() => {
        query = time_series.query(
          "select * where timestamp > TIMESTAMPADD(HOUR, NOW(), -6)"
        );
        return query.fetch();
      })
      .then((rowset) => {
        while (rowset.hasNext()) {
          var row = rowset.next();
          console.log(
            "Time =",
            row[0],
            "User =",
            row[1].toString(),
            "Text =",
            row[2]
          );
        }
      })
      .catch((err) => {
        if (err.constructor.name == "GSException") {
          for (var i = 0; i < err.getErrorStackSize(); i++) {
            console.log("[", i, "]");
            console.log(err.getErrorCode(i));
            console.log(err.getMessage(i));
          }
        } else {
          console.log(err);
        }
      });

    console.log("Chat message stored successfully.");
  } catch (error) {
    console.error("Error storing chat message:", error);
  }
}

// Fetch all data
const FetchAll = async function () {
  const container = await store.getContainer("Chat");

  const query = container.query(
    "select * where timestamp > TIMESTAMPADD(HOUR, NOW(), -6)"
  );
  const rowSet = await query.fetch();
  let res = [];
  while (rowSet.hasNext()) {
    const row = await rowSet.next();
    console.log("Name:", row[1].toString(), "Message:", row[2]);
    res.push({ username: row[1].toString(), message: row[2] });
  }
  return res;
};

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  socket.on("user_join", (username) => {
    io.emit("user_join", username);
  });

  socket.on("chat_message", (data) => {
    io.emit("chat_message", data);
    handleChatMessage(data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.get("/api/messages", async (req, res) => {
  const response = await FetchAll();
  res.send(response);
});

app.post("/api/put", async (req, res) => {
  const { username, message } = req.query;
  let data = {
    username,
    message,
  };
  handleChatMessage(data);

  res.send("done");
});

server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
