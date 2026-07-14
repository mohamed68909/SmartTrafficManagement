import { HubConnectionBuilder, LogLevel } from "@microsoft/signalr";
import { API_CONFIG } from "../config";

class SignalRService {
  constructor() {
    this.connection = null;
    this.listeners = new Map();
  }

  async startConnection() {
    if (this.connection) return this.connection;

    const token = localStorage.getItem("token");
    // Swap /api with /hubs/traffic
    const hubUrl = API_CONFIG.BASE_URL.replace("/api", "/hubs/traffic");

    this.connection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token || "",
      })
      .withAutomaticReconnect([0, 2000, 5000, 10000, 30000]) // Custom backoff retry intervals
      .configureLogging(LogLevel.Warning)
      .build();

    this.connection.onclose((error) => {
      console.warn("SignalR: Connection closed.", error);
    });

    this.connection.onreconnecting((error) => {
      console.warn("SignalR: Connection lost. Reconnecting...", error);
    });

    this.connection.onreconstructed((connectionId) => {
      console.info("SignalR: Connection re-established. Connection ID:", connectionId);
    });

    try {
      await this.connection.start();
      console.info("SignalR: Connected successfully!");
    } catch (err) {
      console.error("SignalR: Error establishing connection.", err);
      // Retry in 5 seconds
      setTimeout(() => this.startConnection(), 5000);
    }

    return this.connection;
  }

  async stopConnection() {
    if (!this.connection) return;
    try {
      await this.connection.stop();
      this.connection = null;
      console.info("SignalR: Connection stopped.");
    } catch (err) {
      console.error("SignalR: Error stopping connection.", err);
    }
  }

  async joinTicketRoom(ticketId) {
    const conn = await this.startConnection();
    if (conn.state === "Connected") {
      try {
        await conn.invoke("JoinTicketRoom", ticketId);
        console.info(`SignalR: Joined chat room ${ticketId}`);
      } catch (err) {
        console.error("SignalR: Error joining ticket room.", err);
      }
    }
  }

  registerMessageListener(onMessageReceived) {
    if (!this.connection) return;
    this.connection.on("ReceiveMessage", onMessageReceived);
  }

  unregisterMessageListener(onMessageReceived) {
    if (!this.connection) return;
    this.connection.off("ReceiveMessage", onMessageReceived);
  }
}

const signalrService = new SignalRService();
export default signalrService;
