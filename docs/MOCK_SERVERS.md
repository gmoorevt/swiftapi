# Mock Servers

SwiftAPI includes a powerful built-in mock server feature that allows you to create and run local HTTP servers for testing, prototyping, and development.

## Overview

Mock servers allow you to:
- Create custom API endpoints with configurable responses
- Test frontend applications without a backend
- Prototype APIs before implementing them
- Simulate different response scenarios (success, errors, delays)
- Track incoming requests in real-time

## Getting Started

### Creating a Mock Server

1. Click the **"Mock Servers"** tab in the main toolbar
2. Click **"+ New Server"**
3. Enter a name and port number (e.g., `3001`)
4. Click **"Create Server"**

### Adding Endpoints

1. Select a server from the sidebar
2. Click **"+ Add Endpoint"**
3. Configure your endpoint:
   - **Path**: The URL path (e.g., `/users`, `/api/data`)
   - **Method**: HTTP method (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
   - **Status Code**: Response status (200, 404, 500, etc.)
   - **Response Body**: The content to return
   - **Headers**: Custom response headers
   - **Delay**: Optional artificial delay in milliseconds
   - **Description**: Optional notes about the endpoint

### Starting the Server

1. Select your configured server
2. Click the **"Start"** button
3. The server will start on the configured port
4. Send requests to `http://localhost:<port>/<path>`

## Features

### Path Parameters

Mock servers support dynamic path parameters using the `:param` syntax:

```
/users/:id
/posts/:postId/comments/:commentId
```

These will match any value in that position:
- `GET /users/123` → matches `/users/:id`
- `GET /users/abc` → matches `/users/:id`
- `GET /posts/1/comments/5` → matches `/posts/:postId/comments/:commentId`

### Custom Headers

You can add custom response headers to any endpoint:

```
Content-Type: application/json
X-Custom-Header: my-value
Cache-Control: no-cache
```

Headers can be enabled/disabled individually without deleting them.

### Response Delays

Add artificial delays to simulate slow network conditions or long-running operations:

- Set delay in milliseconds (e.g., `1000` for 1 second)
- Useful for testing loading states
- Great for simulating real-world API latency

### CORS Support

All mock servers automatically include CORS headers:
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Methods: GET, POST, PUT, DELETE, PATCH, OPTIONS
Access-Control-Allow-Headers: *
```

This makes them perfect for frontend development without CORS issues.

### Request Logging

Every request to your mock server is logged with:
- HTTP method and path
- Request headers and body
- Response status code
- Response time in milliseconds
- Timestamp

View logs in real-time in the **Request Log** section below your endpoints.

## Example Use Cases

### 1. REST API Mock

```json
// GET /users
{
  "users": [
    {"id": 1, "name": "Alice"},
    {"id": 2, "name": "Bob"}
  ]
}

// GET /users/:id
{
  "id": 1,
  "name": "Alice",
  "email": "alice@example.com"
}

// POST /users (201 Created)
{
  "id": 3,
  "name": "Charlie",
  "created": true
}
```

### 2. Error Testing

```json
// GET /users/999 (404 Not Found)
{
  "error": "User not found",
  "code": "USER_NOT_FOUND"
}

// POST /users (500 Internal Server Error)
{
  "error": "Database connection failed",
  "code": "DB_ERROR"
}
```

### 3. Delayed Responses

Create an endpoint with a 2000ms delay to test loading states:

```
Path: /slow-api
Method: GET
Status: 200
Delay: 2000
Body: {"data": "Finally loaded!"}
```

### 4. GraphQL Mock

```json
// POST /graphql
{
  "data": {
    "user": {
      "id": "1",
      "name": "Alice",
      "posts": [
        {"id": "1", "title": "Hello World"}
      ]
    }
  }
}
```

## Best Practices

### Port Selection

- **Avoid common ports**: 80, 443, 3000, 5000, 8080
- **Use high ports**: 3001-9999 are generally safe
- **Check availability**: SwiftAPI will error if the port is in use

### Endpoint Organization

- Use clear, RESTful paths (`/users`, `/posts/:id`)
- Group related endpoints under the same server
- Use descriptive names for servers (e.g., "User API Mock", "Payment Service")

### Response Bodies

- Use valid JSON for API endpoints
- Include realistic data structures
- Test both success and error cases
- Use appropriate status codes

### Headers

- Always include `Content-Type` header
- Use `application/json` for JSON APIs
- Add custom headers for testing auth, caching, etc.

## Technical Details

### Implementation

- **HTTP Server**: Built on Node.js native `http` module
- **Process**: Runs in Electron main process for true HTTP serving
- **IPC**: Communicates with renderer via IPC for start/stop/logs
- **Storage**: Configurations persist to localStorage
- **Logs**: Stored in memory (cleared on app restart)

### Limitations

- Maximum 100 log entries per server (oldest are removed)
- Request logs are not persisted (cleared on restart)
- Cannot bind to privileged ports (<1024) without elevated permissions
- One server per port (cannot have multiple servers on same port)

### Security

Mock servers are designed for **local development only**:
- ⚠️ **Do not expose mock servers to the internet**
- ⚠️ **Do not use for production**
- ⚠️ **No authentication or authorization**
- ⚠️ **All endpoints are public**

## Troubleshooting

### Server Won't Start

**Error**: "Port 3001 is already in use"

**Solution**:
- Another application is using that port
- Try a different port number
- Check running processes: `lsof -i :3001`

### No Requests Appearing in Log

**Issue**: Requests not showing in the log viewer

**Checks**:
- Is the server started (green "Stop" button)?
- Are you requesting the correct port?
- Check the browser console for network errors
- Try the endpoint in SwiftAPI's main API client tab

### Endpoint Returns 404

**Issue**: All requests return 404 Not Found

**Checks**:
- Is the endpoint enabled? (not disabled)
- Does the path match exactly?
- Is the HTTP method correct?
- Are path parameters formatted correctly?

### CORS Errors

**Issue**: Browser shows CORS error

**Note**: This shouldn't happen as CORS is enabled by default
- Try restarting the mock server
- Check browser console for the actual error
- Ensure you're using `http://localhost` not `http://127.0.0.1`

## Keyboard Shortcuts

- `Cmd/Ctrl + Click` on server → Quick start/stop
- `Delete` on selected endpoint → Delete endpoint
- `Cmd/Ctrl + N` → New server (when in Mock Servers view)

## API Reference

### MockServer Interface

```typescript
interface MockServer {
  id: string;
  name: string;
  port: number;
  enabled: boolean;
  endpoints: MockEndpoint[];
  requestLog: MockRequestLog[];
  createdAt: string;
  updatedAt: string;
}
```

### MockEndpoint Interface

```typescript
interface MockEndpoint {
  id: string;
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  statusCode: number;
  responseBody: string;
  responseHeaders: Header[];
  delay?: number;
  enabled: boolean;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### MockRequestLog Interface

```typescript
interface MockRequestLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  headers: Record<string, string>;
  body?: string;
  responseStatus: number;
  responseTime: number;
}
```

## Future Enhancements

Planned features for future releases:
- [ ] Import/export server configurations
- [ ] Request matching with regex patterns
- [ ] Request/response templates
- [ ] Dynamic response generation (JavaScript/templates)
- [ ] Request assertions and validation
- [ ] Persistent logs with export
- [ ] Multiple response scenarios per endpoint
- [ ] Webhook forwarding
- [ ] Proxy mode to real APIs
- [ ] SSL/HTTPS support

## Contributing

Found a bug or have a feature request? Please open an issue on GitHub!

---

**Last Updated**: 2025-11-12
**Version**: 0.1.0-beta
