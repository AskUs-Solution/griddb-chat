## **How to build a Real-time Chat Application with Node.js and GridDB**

This tutorial will assist you in building a real-time chat application using Node.js and GridDB. It also explores using technologies like Express and Socket.io to ensure smooth connections.![](https://drive.google.com/uc?export=view&id=1tuxRlkrA9WqaEaDBNQsL-zGkJVcU-1xW)

## Introduction:

Real-time chat services have become essential in our internationally interconnected society due to the rapid growth of the digital realm. These apps act as technical portals, bridging time and space to provide quick and simple connections. Situated at the forefront of this creative age, they function as dynamic, interactive interfaces that mimic natural, in-person dialogues.

Unlike traditional channels like email or forums, real-time chat platforms guarantee fast message delivery, promoting continuous conversations. With capabilities like file transfers, multimedia sharing, and real-time collaborative document editing, their versatility extends from casual social messaging to boosting productivity in global organizations.

**Understanding the Technologies**

![](https://drive.google.com/uc?export=view&id=14eOM6_-nxub982K67PJ79kqfb13JzPKA)

**NodeJS:**

Node.js functions as a runtime environment that enables JavaScript code to operate outside the confines of a conventional web browser. Real-time application management is made easy using Node.js's non-blocking, event-driven design, which leverages the Chrome V8 JavaScript engine. Its emphasis is on efficiency and responsiveness.

**GridDB:**

GridDB is particularly effective in real-time Internet of Things applications. It guarantees dependable and quick access with minimal latency and effective data management. GridDB is a great tool for efficient data management in chat apps since it is designed for real-time processing.

**Express:**

Express is a Node.js web application framework that offers numerous features for creating mobile and web applications. It is employed to build single-page, multipage, and hybrid web applications. As an overlay on top of Node.js, Express streamlines server and route management

**Socket.io:**

A library called Socket.io is intended for real-time, event-driven web applications. It allows two-way communication between web clients and servers.

**Prerequisites:**

- It is essential to have a basic grasp of JavaScript.
- Make sure that Node and NPM are installed on your computer.

## Step-by-Step configuration:

![](https://drive.google.com/uc?export=view&id=1DDO1OyxaS21K85b5WnujP2EEtFyiT6qC)

Create a folder by using the command:

```bash
mkdir folder_name
```

Change the current working directory by using the command:

```bash
cd folder_name
```

After that, open the folder you just created in Visual Studio Code, and to launch a new project, run the command:

```bash
npm init -y
```

The output will look like this:

![](https://drive.google.com/uc?export=view&id=1rZXcTRv8fdiwVUeepr3V7HBMb5oT2Rvz)

To use the nvm 10.x, use the following command:

```bash
nvm use 10.x
```

Now, to install Express, use the command:

```bash
npm install -save express
```

Now install socket.io using the command:

```bash
npm install -save socket.io
```

## Setting Up GridDB:

<!-- ![](https://drive.google.com/uc?export=view&id=1_zOCAtzyIUjews2xtiFz-ipyrLV_VGU5) -->

Run the following commands on the system’s terminal.

To install with rpm, run the commands:

```bash
wget \
https://github.com/griddb/griddb_nosql/releases/download/v4.2.0/griddb_nosql-4.2.0-1.linux.x86_64.rpm
```

```bash
sudo rpm -Uvh griddb_nosql-4.2.0-1.linux.x86_64.rpm
```

Use the following commands to switch to the gsadm user and edit GridDB's configuration files.

```bash
sudo -su gsadm
```

```bash
vim /var/lib/gridstore/conf/gs_cluster.json
```

This gives you the gsadm user access to modify the configuration files.

**Output:**

![](https://drive.google.com/uc?export=view&id=104hUUjezRzV8d7KEcjyzxir_dVT59ijT)

Change the default password of admin by using the command:

```bash
gs_passwd admin
export GS_HOME=/var/lib/gridstore/
export GS_LOG=/var/lib/gridstore/log/
```

Due to the absence of an init script in the GridDB Community Edition, GridDB must be started manually. Establish the service's connection to other nodes after it has been started.

```bash
gs_startnode -u username/password
gs_joincluster -u admin/admin
```

![](https://drive.google.com/uc?export=view&id=1C9Je_9QAfLmvgfaF6SCzRUP7AeEq7xqN)
You can verify the status of GridDB by using the command:

```bash
gs_stat -u admin/admin
```

**Output:**

![](https://drive.google.com/uc?export=view&id=1bdCCLt1zSAkTd1vaWRFNBWS5J_irQlUW)

Then, create a file (in Visual Studio Code) called server.js that Node will use to function as the server.

![](https://lh7-us.googleusercontent.com/2Bv_R8tgZoiag8qMaW6vcLmlcGKOm0vlyng4bcgLOssSJawpYGmFxUc-KR4oLeIJOsVzllanpMF4_BVVRMFtzJZo47OFRv_QlMLmzKLOFdxymoREyE6bYH4UNASfGN9-kx0zJvETXF2cjMvklzHE6nQ)

**Add the following code to it:**

```js
const express = require("express");
const socketio = require("socket.io");
const http = require("http");
const griddb = require("griddb_node");

// Initialize Express and set port and host
const app = express();
const PORT = 3000;
const HOST = "0.0.0.0";

// Create HTTP server and bind Socket.io to it
const server = http.createServer(app);
const io = socketio(server);

// Initialize GridDB store
const factory = griddb.StoreFactory.getInstance();
const store = factory.getStore({
  notificationMember: "127.0.0.1:10001",
  clusterName: "defaultCluster",
  username: "admin",
  password: "admin",
});

// Define schema for the 'Chat' container
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

let time_series;

// Create or get the 'Chat' container and insert a sample record
store
  .putContainer(timeConInfo, false)
  .then((ts) => {
    time_series = ts;
    return ts.put([new Date(), "Nomi", "resting"]);
  })
  .then(() => {
    // Query recent messages from the time series
    let query = time_series.query(
      "select * where timestamp > TIMESTAMPADD(HOUR, NOW(), -6)"
    );
    return query.fetch();
  })
  .then((rowset) => {
    // Process and display each row in the result set
    while (rowset.hasNext()) {
      var row = rowset.next();
      console.log(
        "Time =",
        row[0],
        "Username =",
        row[1].toString(),
        "Message =",
        row[2]
      );
    }
  })
  .catch((err) => {
    // Handle errors
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

// Function to handle chat messages and store them in GridDB
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
        // Fetch messages after storing the new one
        let query = time_series.query(
          "select * where timestamp > TIMESTAMPADD(HOUR, NOW(), -6)"
        );
        return query.fetch();
      })
      .then((rowset) => {
        // Process and display each row
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
        // Handle errors
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

// Serve static files from the 'public' directory
app.use(express.static(__dirname + "/public"));

// Define the root route

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A user connected: ", socket.id);

  // Handle user joining
  socket.on("user_join", (username) => {
    io.emit("user_join", username);
  });

  // Handle incoming chat messages
  socket.on("chat_message", (data) => {
    io.emit("chat_message", data);
    handleChatMessage(data);
  });

  // Handle user disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
```

**Explanation of the code:**

The code creates a real-time chat server using Express, Socket.io, and GridDB. It connects to GridDB to store and retrieve chat messages in a time-series container with timestamp, username, and message columns. The server records user connections, disconnections, and chat messages. The `handleChatMessage` function asynchronously stores chat messages in GridDB. The server uses Express for the web interface and Socket-io for real-time communication. The code effectively integrates these technologies for a comprehensive chat server.

Let’s create an 'index.html' file by clicking 'New File.'

<!-- ![](https://github.com/AskUs-Solution/griddb-chat/blob/main/docs/img1.PNG) -->

**Add the following code to it:**

```html
<!DOCTYPE html>
<html>
  <head>
    <title>Chat App</title>
    <meta
      name="viewport"
      content="width=device-width, minimum-scale=1, initial-scale=1"
    />

    <!-- Styling for the chat application -->
    <style>
      body {
        margin: 0;
        font-family: sans-serif;
      }

      form {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        display: flex;
        box-sizing: border-box;
        padding: 0.25rem;
      }

      form input {
        border: 0;
        padding: 0.5rem;
        width: 100%;
        outline: 0;
        margin-right: 0.5rem;
        border-radius: 0.25rem;
        background: #ccc;
      }

      form button {
        width: 6rem;
        background-color: #1b8c00;
        color: white;
        border: none;
        padding: 0.5rem;
        cursor: pointer;
        border-radius: 0.25rem;
        text-transform: uppercase;
      }

      form button:hover {
        background-color: #166d01;
      }

      .messages {
        margin: 0;
        padding: 0;
        margin-bottom: 3rem;
      }

      .messages li {
        padding: 0.5rem;
      }

      .messages li:nth-child(odd) {
        background: #eee;
      }
    </style>
  </head>
  <body>
    <!-- Message list container -->
    <ul class="messages"></ul>

    <!-- Message input form -->
    <form>
      <input type="text" class="input" autocomplete="off" autofocus />
      <button>Send</button>
    </form>

    <!-- Client side JavaScript for handling socket.io and chat functionality -->
    <script src="/socket.io/socket.io.js"></script>
    <script>
      const form = document.querySelector("form");
      const input = document.querySelector(".input");
      const messages = document.querySelector(".messages");
      const username = prompt("Please Enter Your Name");
      const socket = io();

      // Event listener for the form submission
      form.addEventListener(
        "submit",
        function (event) {
          event.preventDefault();
          socket.emit("chat_message", {
            username: username,
            message: input.value,
          });
          input.value = "";
          return false;
        },
        false
      );

      // Socket event listeners
      socket.on("chat_message", function (data) {
        addMessage(data.username + ": " + data.message);
      });

      socket.on("user_join", function (data) {
        addMessage(data + " Has Joined");
      });

      socket.on("user_leave", function (data) {
        addMessage(data + " Has Left");
      });

      socket.on("disconnect", function () {
        addMessage("You Have Disconnected");
      });

      // Function to add a message to the chat
      function addMessage(message) {
        const li = document.createElement("li");
        li.innerHTML = message;
        messages.appendChild(li);
        window.scrollTo(0, document.body.scrollHeight);
      }

      // Notify the chat about the new user
      addMessage("You Have Joined As " + username);
      socket.emit("user_join", username);
    </script>
  </body>
</html>
```

**Explanation of the code:**

This code represents the client-side part of a real-time chat program. Using a <style> section to incorporate styling, the structure is conventional HTML5. An unordered list of chat messages is included in the body, along with a fixed form with an input field and a 'Send' button at the bottom for message entry. Real-time communication is made possible by the embedded JavaScript connecting to the server using the Socket.io framework. Login requires user input, and some activities, such as submitting a form, cause the server to receive Socket.io events. Additionally, the script updates the user interface dynamically by listening to different server-sent events.

Now, export the load library by using the command on Visual Studio Code’s terminal:

```bash
export LD_LIBRARY_PATH=${LD_LIBRARY_PATH}:/usr/griddb_c_client-4.2.0/lib/
```

Then, run the application by running the following command:

```bash
node server.js
```

**Output:**

![](https://drive.google.com/uc?export=view&id=1bi9nYpJXNeoWJ0a9Q2_NxjuwEXXMBnYG)

![](https://drive.google.com/uc?export=view&id=113H12Nr5a4VM8lmzNGilwc0qqJqOtr02)

![](https://drive.google.com/uc?export=view&id=16WbXb3fB01SARTCIBSsVTgxTbG2afK3G)

## Conclusion:

This article explains how to create a real-time chat application using GridDB and Node.js. The main technologies include Socket.io for real-time communication, Express as the web application framework, GridDB for effective data processing, and Node.js for server-side functionality. Installation of Node.js/NPM and a basic grasp of JavaScript are prerequisites. GridDB setup, server configuration, and project start-up are all included in the systematic configuration procedure. The article concludes with instructions that are easy to follow for launching the application, showcasing how various technologies are seamlessly integrated to enable immediate communication.
