# Streaming Chatbot Integration

This document describes the implementation of the streaming chatbot API integration in the ZenCare frontend.

## Overview

The AIBot module has been updated to use a direct streaming connection to the deployed chatbot API at `http://4.204.10.63:8000/chat/stream` instead of going through the backend.

## Architecture

### Components Updated

1. **AIBotScreen** (`src/screens/AIBot/AIBotScreen.tsx`)

   - Updated to use streaming hooks
   - Added streaming status indicators
   - Improved loading states

2. **useChat Hook** (`src/hooks/useChat.ts`)

   - Modified to use `sendStreamingMessage` instead of `sendChatMessage`
   - Added streaming state management
   - Automatic scroll to bottom during streaming

3. **MessageBubble** (`src/components/ui/chat/MessageBubble.tsx`)

   - Added `isStreaming` prop
   - Animated typing indicator for streaming messages
   - Real-time message updates during streaming

4. **ChatSlice** (`src/store/chat/chatSlice.ts`)

   - Added streaming state management
   - New actions: `startStreaming`, `updateStreamingMessage`, `completeStreaming`
   - New thunk: `sendStreamingMessage`

5. **StreamingChatService** (`src/services/streamingChat.ts`)
   - Handles direct API communication
   - Supports multiple streaming formats (SSE, plain text)
   - Error handling and connection management

## Features

### Real-time Streaming

- Messages appear character by character as they're generated
- Animated typing indicator shows when bot is responding
- Smooth scrolling keeps latest content visible

### Error Handling

- Connection failures are gracefully handled
- Fallback error messages for users
- API connection testing utility

### Performance

- Efficient state updates during streaming
- Minimal re-renders
- Background processing

## API Format Support

The streaming service supports the correct API format for the deployed chatbot:

### Request Format

```javascript
{
  "messages": ["user message here"],
  "reasoning": false,
  "chatId": "optional-chat-id-for-continuation" // Only sent after first response
}
```

### Response Format

The API returns a streaming response that may include:

1. **Chat ID** (first response only): Used for conversation continuity
2. **Streaming Content**: The actual bot response
3. **Completion Signal**: Indicates when streaming is done

### Chat Session Management

- First message: Sent without `chatId`, API returns a new `chatId`
- Subsequent messages: Include the `chatId` to continue the conversation
- Chat ID is automatically managed by the Redux store
- Clearing messages also clears the chat ID (starts new conversation)

## Usage

The integration is seamless - users can:

1. Type a message in the chat input
2. See their message appear immediately
3. Watch the bot's response stream in real-time
4. Interact continuously without waiting

## Testing

A test utility is provided at `src/utils/testStreamingAPI.ts` for:

- API connection testing
- Response format debugging
- Performance monitoring

## Configuration

The API URL is configured in `StreamingChatService`:

```typescript
private static readonly API_URL = 'http://4.204.10.63:8000/chat/stream';
```

To change the endpoint, update this constant.

## Error Scenarios Handled

1. **Network Connection Issues**

   - Displays connection error message
   - Allows retry functionality

2. **API Server Errors**

   - Shows fallback response
   - Logs errors for debugging

3. **Streaming Interruption**

   - Completes partial messages
   - Maintains chat state

4. **Invalid Response Format**
   - Handles malformed data gracefully
   - Continues operation with fallbacks

## Performance Considerations

- Uses React Native's `requestAnimationFrame` for smooth updates
- Efficient string concatenation during streaming
- Minimal DOM/component updates
- Proper cleanup of streaming connections

## Future Enhancements

1. **Retry Logic**: Automatic retry for failed connections
2. **Offline Support**: Queue messages when offline
3. **Message History**: Persist chat history locally
4. **Typing Indicators**: Show when user is typing
5. **File Attachments**: Support for image/document uploads
