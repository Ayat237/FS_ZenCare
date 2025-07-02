# Configuration System

## Overview

This directory contains configuration files for various aspects of the ZenCare application. The goal is to centralize configuration settings to make them easier to manage across different environments (development, staging, production).

## Files

### api.ts

This file contains configuration for all API endpoints used in the application:

- **Main API Service**: The primary backend API for the ZenCare application
- **Chatbot Service**: The API for the chatbot functionality

The file provides helper functions to determine the current environment and select the appropriate URL based on that environment.

## Usage

### Importing Configuration

You can import the configuration in two ways:

```typescript
// Import specific functions or constants
import { getApiUrl, getChatbotUrl } from '@/config';

// Or import the default object
import apiConfig from '@/config';
```

### Getting API URLs

```typescript
// Get the main API URL for the current environment
const apiUrl = getApiUrl();

// Get the chatbot API URL for the current environment
const chatbotUrl = getChatbotUrl();
```

## Adding New Configuration

When adding new services or configuration settings:

1. Create a new configuration object in the appropriate file (or create a new file if needed)
2. Add helper functions to select the appropriate values based on the environment
3. Export the new configuration from the index.ts file

## Environment Detection

Currently, the environment is detected using the `__DEV__` global variable provided by React Native. In a production application, this could be enhanced to use environment variables or other configuration mechanisms.