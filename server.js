const express = require("express");
const WebSocket = require("ws");
const http = require("http");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// CORS 설정
app.use(
  cors({
    origin: "*", // 모든 도메인에서 접근 허용
    methods: ["GET", "POST"], // 허용할 HTTP 메서드
    allowedHeaders: ["Content-Type"], // 허용할 HTTP 헤더
  })
);

wss.on("connection", function connection(ws) {
  console.log("Client has Connected");
  // console.log("\nClients 확인",wss.clients);
  ws.on("message", function incoming(message) {
    // 프론트엔드에서 받은 Data 확인
    const data = JSON.parse(message);
    // console.log(data, "Message 받은 것 같다.");

    switch (data.type) {
      case "offer":
        console.log("\nReceived an offer:", data.offer);
        break;
      case "answer":
        console.log("Received an answer:", data.answer);
        break;
      case "candidate":
        console.log("Received an ICE candidate:", data.candidate);
        break;
      default:
        console.log("Unknown message type:", data.type);
    }

    // 메시지를 받으면 연결된 모든 클라이언트에게 전송
    wss.clients.forEach(function each(client) {
      if (client !== ws && client.readyState === WebSocket.OPEN) {
        client.send(message);
      }
    });
  });

  // 연결이 끊기는 경우 처리
  ws.on("close", () => {
    console.log("Client has disconnected");
    console.log("_______________________");
  });
});

// Express를 사용하여 웹 서버에서 정적 파일 호스팅 또는 API 라우팅을 설정
app.get("/", (req, res) => {
  res.send("Hello World! This is the WebRTC signaling server.");
});

// 서버를 지정된 포트에서 실행
const PORT = 8080;
server.listen(PORT, function () {
  console.log(`Server is running on http://localhost:${PORT}`);
});
