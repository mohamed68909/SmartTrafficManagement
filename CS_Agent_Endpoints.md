# CS-Agent Endpoints Documentation

This document lists all the available endpoints for the Customer Service Agent (CS-Agent) in the Smart Traffic Management API.

## 1. Driver Management & Agent Status (`CsController` - `api/cs`)
*All endpoints require the `CSAgent` role.*

### Search Drivers
- **URL**: `GET /api/cs/drivers/search?q={searchTerm}`
- **Description**: Search for drivers by their name or email address.
- **Response**: `200 OK` (Returns a list of drivers matching the search term).

### Get Driver Context
- **URL**: `GET /api/cs/drivers/{id}`
- **Description**: Get the full context for a specific driver, including their profile, registered vehicles, recent SOS requests, and open support tickets.
- **Response**: `200 OK` (Driver details) | `404 Not Found`

### Block Driver
- **URL**: `POST /api/cs/drivers/{id}/block`
- **Description**: Block or deactivate a driver's account.
- **Response**: `200 OK` | `404 Not Found`

### Set Agent Online Status
- **URL**: `POST /api/cs/agent/status`
- **Description**: Toggle the CS Agent's own online status (Online/Offline).
- **Body**: 
```json
{
  "online": true
}
```
- **Response**: `200 OK`

---

## 2. Ticket & Support Management (`SupportController` - `api/support`)
*All endpoints require the `CSAgent` (or `Admin`) role.*

### Get Ticket Statistics
- **URL**: `GET /api/support/tickets/stats`
- **Description**: Get summary statistics including the number of open, closed, pending tickets, and the average response time in hours.
- **Response**: `200 OK`

### Get Ticket Details
- **URL**: `GET /api/support/tickets/{id}`
- **Description**: Get full details of a specific ticket, including all chat messages history.
- **Response**: `200 OK` | `404 Not Found`

### Escalate Ticket
- **URL**: `POST /api/support/tickets/{id}/escalate`
- **Description**: Escalate a ticket by changing its priority to `Urgent` and status to `InProgress`.
- **Response**: `200 OK` | `404 Not Found`

### Close Ticket
- **URL**: `PATCH /api/support/close/{id}`
- **Description**: Mark a ticket as resolved and closed.
- **Response**: `200 OK` | `403 Forbidden` | `404 Not Found`

---

## 3. Real-time Chat & Messages (`ChatController` - `api/chat`)
*All endpoints require the `CSAgent` (or `Client`) role.*

### Get Chat History
- **URL**: `GET /api/chat/history/{ticketId}`
- **Description**: Retrieve the entire chat history for a specific ticket.
- **Response**: `200 OK` | `403 Forbidden` | `404 Not Found`

### Send Message
- **URL**: `POST /api/chat/send`
- **Description**: Send a new chat message inside a ticket.
- **Body**:
```json
{
  "ticketId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "message": "Hello, how can I help you today?",
  "type": 0  // 0 = Text message
}
```
- **Response**: `200 OK` | `400 Bad Request` | `403 Forbidden` | `404 Not Found`
