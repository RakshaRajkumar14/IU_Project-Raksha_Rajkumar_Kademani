# Chat/Messaging Functionality

## Overview
The Smart Damage Detection system now includes a chat/messaging feature that allows users to add notes and comments to packages. This enables better communication between warehouse staff, inspectors, and other stakeholders regarding package damage.

## Backend API

### Get Messages
**Endpoint:** `GET /api/packages/{package_id}/messages`

**Description:** Retrieve all messages for a specific package, ordered by timestamp (oldest first).

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "author": "John Doe",
      "message": "Package shows signs of water damage on the bottom",
      "timestamp": "2024-01-15T10:30:00"
    }
  ]
}
```

### Add Message
**Endpoint:** `POST /api/packages/{package_id}/messages`

**Description:** Add a new message/comment to a package.

**Request Body:**
```json
{
  "author": "Jane Smith",
  "message": "Contacted customer about the damage. Awaiting response."
}
```

**Response:**
```json
{
  "id": 2,
  "package_id": 1,
  "author": "Jane Smith",
  "message": "Contacted customer about the damage. Awaiting response.",
  "timestamp": "2024-01-15T14:45:00"
}
```

## Database Schema

A new `messages` table has been added:

```sql
CREATE TABLE IF NOT EXISTS messages (
  id SERIAL PRIMARY KEY,
  package_id INTEGER REFERENCES packages(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  message TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT now()
);
```

## Frontend Components

### MessageService
Location: `frontend/angular-app/src/app/services/message.service.ts`

Service for communicating with the message API endpoints.

### PackageChatComponent
Location: `frontend/angular-app/src/app/components/package-chat/package-chat.component.ts`

A standalone Angular component that displays messages and allows users to add new ones. Features:
- Real-time message display with timestamps
- Formatted relative timestamps (e.g., "5m ago", "2h ago")
- Author name input field
- Message text area
- Loading states and error handling
- Responsive design

### Integration
The chat component has been integrated into the Package Detail page, allowing users to view and add messages when inspecting package details.

## Usage Example

1. Navigate to a package detail page (e.g., `/package/1`)
2. Scroll to the "Messages & Notes" section
3. Enter your name in the "Your name" field
4. Type your message in the message text area
5. Click "Send" or press Enter to submit
6. Messages will appear in chronological order

## Requirements

- PostgreSQL database must be configured (via `POSTGRES_DSN` environment variable)
- If the database is not configured, the API will return a 503 Service Unavailable error
- The frontend will display an appropriate error message

## Future Enhancements

Potential improvements for the messaging feature:
- User authentication and authorization
- Message editing and deletion
- File attachments
- Real-time updates using WebSockets
- Message threading/replies
- Notifications when new messages are added
- Search and filtering of messages
