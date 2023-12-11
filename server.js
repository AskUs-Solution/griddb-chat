const express = require("express");
const socketIo = require("socket.io");
const http = require("http");
const db = require("./db");
const app = express();
const griddb = require("griddb_node");

const PORT = 3000;
const HOST = "0.0.0.0";
const server = http.createServer(app);
const io = socketIo(server);
const factory = griddb.StoreFactory.getInstance();
const store = factory.getStore({
  // host: "127.0.0.1",
  // port: 10010,
  notificationMember: "127.0.0.1:10001",
  clusterName: "defaultCluster",
  username: "admin",
  password: "admin",
});

const colConInfo = new griddb.ContainerInfo({
  name: "Person",
  columnInfoList: [
    ["name", griddb.Type.STRING],
    ["age", griddb.Type.INTEGER],
  ],
  type: griddb.ContainerType.COLLECTION,
  rowKey: true,
});

var timeConInfo = new griddb.ContainerInfo({
  name: "HeartRate",
  columnInfoList: [
    ["timestamp", griddb.Type.TIMESTAMP],
    ["heartRate", griddb.Type.INTEGER],
    ["activity", griddb.Type.STRING],
  ],
  type: griddb.ContainerType.TIME_SERIES,
  rowKey: true,
});

let time_series;
store
  .putContainer(timeConInfo, false)
  .then((ts) => {
    time_series = ts;
    return ts.put([new Date(), 60, "resting"]);
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
        "Heart Rate =",
        row[1].toString(),
        "Activity =",
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

// Function to handle the "chat_message" event and store the message in GridDB
async function handleChatMessage(data) {
  try {
    let time_series;
    store
      .putContainer(timeConInfo, false)
      .then((ts) => {
        time_series = ts;
        return ts.put([new Date(), 70, data.txt]);
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

app.use(express.static(__dirname + "/public"));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", (socket) => {
  console.log("A user connected");

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

  getLastNChatMessages(10).then((messages) => {
    console.log("Last 10 chat messages:", messages);
  });
});

app.get("/", (req, res) => {
  res.send("Hello, World");
});

app.post("/api/put", async (req, res) => {
  const { user, txt } = req.query;
  let data = {
    user,
    txt,
  };
  handleChatMessage(data);
  // const putRow = await db.putRow(value);
  res.send("done");
});

app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
