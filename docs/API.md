# API Documentation

## Overview

The Playwright Test Dashboard backend provides a RESTful API for managing test execution and retrieving test results.

**Base URL:** `http://localhost:3001`

## Endpoints

### Test Execution

#### Run All Tests

Execute all Playwright tests in the project.

**Endpoint:** `POST /api/run-all-tests`

**Request:**
```http
POST /api/run-all-tests HTTP/1.1
Host: localhost:3001
Content-Type: application/json
```

**Response:**
```json
{
  "message": "Test run started",
  "status": "running"
}
```

**Status Codes:**
- `200` - Test run started successfully
- `500` - Server error

---

#### Rerun Specific Test

Rerun a single test by file and title.

**Endpoint:** `POST /api/rerun-test`

**Request:**
```http
POST /api/rerun-test HTTP/1.1
Host: localhost:3001
Content-Type: application/json

{
  "file": "tests/example.spec.ts",
  "title": "should login successfully"
}
```

**Request Body:**
| Field | Type | Required | Description |
|-------|------|----------|-------------|
| file | string | Yes | Path to test file |
| title | string | Yes | Test title/name |

**Response:**
```json
{
  "message": "Test rerun started",
  "file": "tests/example.spec.ts",
  "title": "should login successfully"
}
```

**Status Codes:**
- `200` - Test rerun started
- `400` - Missing required fields
- `500` - Server error

---

#### Stop Test Run

Stop the currently running test execution.

**Endpoint:** `POST /api/stop-run`

**Request:**
```http
POST /api/stop-run HTTP/1.1
Host: localhost:3001
```

**Response:**
```json
{
  "message": "Test run stopped"
}
```

**Status Codes:**
- `200` - Stop signal sent
- `500` - Server error

---

### Data Retrieval

#### Get All Test Runs

Retrieve all test run results.

**Endpoint:** `GET /api/runs`

**Request:**
```http
GET /api/runs HTTP/1.1
Host: localhost:3001
```

**Response:**
```json
[
  {
    "id": "run-123",
    "startedAt": "2026-01-30T10:00:00.000Z",
    "tests": [
      {
        "file": "tests/example.spec.ts",
        "line": 10,
        "title": "should login successfully",
        "duration": 1500,
        "status": "passed",
        "error": null,
        "stack": null,
        "attachments": []
      }
    ]
  }
]
```

**Response Fields:**

**TestRun:**
| Field | Type | Description |
|-------|------|-------------|
| id | string | Unique run identifier |
| startedAt | string | ISO 8601 timestamp |
| tests | Test[] | Array of test results |

**Test:**
| Field | Type | Description |
|-------|------|-------------|
| file | string | Test file path |
| line | number | Line number in file |
| title | string | Test name |
| duration | number | Duration in milliseconds |
| status | string | 'passed', 'failed', 'skipped', 'interrupted' |
| error | string \| null | Error message if failed |
| stack | string \| null | Stack trace if failed |
| attachments | Attachment[] | Screenshots/videos |

**Status Codes:**
- `200` - Success
- `500` - Server error

---

#### Live Test Updates (SSE)

Stream real-time test execution updates using Server-Sent Events.

**Endpoint:** `GET /api/live-tests`

**Request:**
```http
GET /api/live-tests HTTP/1.1
Host: localhost:3001
Accept: text/event-stream
```

**Response Stream:**

The server sends events in the following format:

```
event: test-start
data: {"file":"tests/example.spec.ts","title":"should login"}

event: test-end
data: {"file":"tests/example.spec.ts","title":"should login","status":"passed","duration":1500}

event: run-complete
data: {"total":10,"passed":8,"failed":2}
```

**Event Types:**

| Event | Data | Description |
|-------|------|-------------|
| test-start | {file, title} | Test started |
| test-end | {file, title, status, duration} | Test completed |
| run-complete | {total, passed, failed, skipped} | All tests finished |

**Client Example:**
```javascript
const eventSource = new EventSource('http://localhost:3001/api/live-tests');

eventSource.addEventListener('test-start', (e) => {
  const data = JSON.parse(e.data);
  console.log('Test started:', data.title);
});

eventSource.addEventListener('test-end', (e) => {
  const data = JSON.parse(e.data);
  console.log('Test ended:', data.status);
});

eventSource.addEventListener('run-complete', (e) => {
  const data = JSON.parse(e.data);
  console.log('Run complete:', data);
  eventSource.close();
});
```

---

## Error Handling

All endpoints return errors in the following format:

```json
{
  "error": "Error message description",
  "code": "ERROR_CODE",
  "details": {}
}
```

**Common Error Codes:**
- `MISSING_FIELDS` - Required fields not provided
- `TEST_NOT_FOUND` - Specified test doesn't exist
- `EXECUTION_FAILED` - Test execution failed to start
- `INTERNAL_ERROR` - Server error

---

## Rate Limiting

Currently, no rate limiting is implemented. For production use, consider implementing rate limiting to prevent abuse.

---

## CORS

The server allows CORS from all origins in development. For production, configure specific allowed origins:

```javascript
app.use(cors({
  origin: 'https://your-dashboard-domain.com'
}));
```

---

## Authentication

Currently, no authentication is required. For production deployment, implement authentication:

**Recommended approaches:**
1. API Key authentication
2. JWT tokens
3. OAuth 2.0

**Example with API Key:**
```javascript
// Middleware
const authenticateApiKey = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

app.use('/api', authenticateApiKey);
```

---

## Webhooks (Future)

Planned webhook support for external integrations:

```http
POST /api/webhooks/register
{
  "url": "https://your-service.com/webhook",
  "events": ["test-failed", "run-complete"]
}
```

---

## SDK Examples

### JavaScript/TypeScript

```typescript
class PlaywrightDashboardClient {
  constructor(private baseUrl: string) {}

  async runAllTests() {
    const response = await fetch(`${this.baseUrl}/api/run-all-tests`, {
      method: 'POST'
    });
    return response.json();
  }

  async rerunTest(file: string, title: string) {
    const response = await fetch(`${this.baseUrl}/api/rerun-test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file, title })
    });
    return response.json();
  }

  async getRuns() {
    const response = await fetch(`${this.baseUrl}/api/runs`);
    return response.json();
  }

  subscribeLiveTests(callbacks: {
    onTestStart?: (data: any) => void;
    onTestEnd?: (data: any) => void;
    onRunComplete?: (data: any) => void;
  }) {
    const eventSource = new EventSource(`${this.baseUrl}/api/live-tests`);
    
    if (callbacks.onTestStart) {
      eventSource.addEventListener('test-start', (e) => {
        callbacks.onTestStart(JSON.parse(e.data));
      });
    }
    
    if (callbacks.onTestEnd) {
      eventSource.addEventListener('test-end', (e) => {
        callbacks.onTestEnd(JSON.parse(e.data));
      });
    }
    
    if (callbacks.onRunComplete) {
      eventSource.addEventListener('run-complete', (e) => {
        callbacks.onRunComplete(JSON.parse(e.data));
        eventSource.close();
      });
    }
    
    return eventSource;
  }
}

// Usage
const client = new PlaywrightDashboardClient('http://localhost:3001');

// Run all tests
await client.runAllTests();

// Rerun specific test
await client.rerunTest('tests/login.spec.ts', 'should login');

// Get all runs
const runs = await client.getRuns();

// Subscribe to live updates
const eventSource = client.subscribeLiveTests({
  onTestStart: (data) => console.log('Started:', data.title),
  onTestEnd: (data) => console.log('Ended:', data.status),
  onRunComplete: (data) => console.log('Complete:', data)
});
```

### Python

```python
import requests
import json
from sseclient import SSEClient

class PlaywrightDashboardClient:
    def __init__(self, base_url):
        self.base_url = base_url
    
    def run_all_tests(self):
        response = requests.post(f"{self.base_url}/api/run-all-tests")
        return response.json()
    
    def rerun_test(self, file, title):
        response = requests.post(
            f"{self.base_url}/api/rerun-test",
            json={"file": file, "title": title}
        )
        return response.json()
    
    def get_runs(self):
        response = requests.get(f"{self.base_url}/api/runs")
        return response.json()
    
    def subscribe_live_tests(self, callbacks):
        messages = SSEClient(f"{self.base_url}/api/live-tests")
        for msg in messages:
            if msg.event == 'test-start' and 'on_test_start' in callbacks:
                callbacks['on_test_start'](json.loads(msg.data))
            elif msg.event == 'test-end' and 'on_test_end' in callbacks:
                callbacks['on_test_end'](json.loads(msg.data))
            elif msg.event == 'run-complete' and 'on_run_complete' in callbacks:
                callbacks['on_run_complete'](json.loads(msg.data))
                break

# Usage
client = PlaywrightDashboardClient('http://localhost:3001')

# Run all tests
client.run_all_tests()

# Get runs
runs = client.get_runs()
```

---

## Testing the API

### Using cURL

```bash
# Run all tests
curl -X POST http://localhost:3001/api/run-all-tests

# Rerun specific test
curl -X POST http://localhost:3001/api/rerun-test \
  -H "Content-Type: application/json" \
  -d '{"file":"tests/example.spec.ts","title":"should pass"}'

# Get all runs
curl http://localhost:3001/api/runs

# Stop test run
curl -X POST http://localhost:3001/api/stop-run

# Subscribe to live tests (SSE)
curl -N http://localhost:3001/api/live-tests
```

### Using Postman

1. Import the collection (create a new collection)
2. Add requests for each endpoint
3. Set environment variables for base URL
4. Test each endpoint

---

## Performance Considerations

1. **Polling Interval:** The frontend polls `/api/runs` every 5 seconds. Adjust based on needs.
2. **SSE Connections:** Limit concurrent SSE connections to prevent memory issues.
3. **Data Size:** Large test runs may cause slow responses. Consider pagination.
4. **Caching:** Implement caching for frequently accessed data.

---

## Security Best Practices

1. **Use HTTPS** in production
2. **Implement authentication** for all endpoints
3. **Validate input** to prevent injection attacks
4. **Rate limit** API calls
5. **Sanitize error messages** to avoid leaking sensitive info
6. **Use environment variables** for sensitive configuration

---

## Changelog

### v0.1.0 (Current)
- Initial API implementation
- Basic CRUD operations
- SSE support for live updates
- No authentication (development only)
