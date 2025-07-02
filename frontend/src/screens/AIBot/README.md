# ZenCare AI Bot Chat Feature

## Overview
The ZenCare AI Bot is a conversational interface that allows users to interact with a virtual healthcare assistant. The bot can provide medical advice, answer health-related questions, and help users schedule appointments with healthcare providers.

## Components

### Screens
- **AIBotScreen**: The main screen for the chat interface.

### UI Components
- **ChatHeader**: Header component with back navigation and title.
- **MessageBubble**: Component for displaying individual chat messages with styling for both user and bot messages.
- **ChatInput**: Input component for typing and sending messages, with loading state handling.

### State Management
- **chatSlice**: Redux slice for managing chat state, including messages, loading states, and error handling.
- **useChat**: Custom hook that encapsulates chat functionality for easier reuse.

### API Services
- **chat.ts**: API service for sending and receiving messages from the backend.

## Usage

```jsx
import { AIBotScreen } from '@/screens/AIBot';

// In your navigation
<Stack.Screen name="AIBot" component={AIBotScreen} />
```

## Features
- Real-time messaging with the AI bot
- Message history persistence
- Loading indicators during message processing
- Auto-scrolling to the latest message
- Keyboard handling for better UX on mobile devices
- Timestamp display for messages

## Future Improvements
- Add typing indicators
- Implement message reactions
- Add support for image and file attachments
- Implement voice input for messages
- Add message search functionality