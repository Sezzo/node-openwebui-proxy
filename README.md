# Node OpenWebUI Proxy

A lightweight Node.js proxy server that forwards API requests to a target server with automatic Authorization header injection. Perfect for adding API key authentication to services that don't natively support it, particularly useful with OpenWebUI.

## Features

- 🔐 Automatic Authorization header injection with Bearer token
- 🔄 Proxy all `/api/*` requests to a target server
- 🏥 Built-in health check endpoint
- 📝 Request logging
- 🐳 Docker support with health checks
- 🔒 Runs as non-root user in Docker
- ⚙️ Environment-based configuration

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- (Optional) Docker for containerized deployment

## Installation

### Local Installation

1. Clone the repository:
```bash
git clone https://github.com/Sezzo/node-openwebui-proxy.git
cd node-openwebui-proxy
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables (see [Configuration](#configuration))

4. Start the server:
```bash
npm start
```

### Docker Installation

1. Build the Docker image:
```bash
docker build -t node-openwebui-proxy .
```

2. Run the container:
```bash
docker run -d \
  -p 3000:3000 \
  -e API_KEY="your-api-key-here" \
  -e TARGET="https://your-target-api.com" \
  --name openwebui-proxy \
  node-openwebui-proxy
```

## Configuration

The application uses environment variables for configuration. Create a `.env` file in the root directory:

```env
API_KEY=your-api-key-here
TARGET=https://your-target-api.com
```

### Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `API_KEY` | The API key to inject in the Authorization header | Yes | `""` |
| `TARGET` | The target API server URL | Yes | `""` |

**Note:** You can use `.copy.env` as a template for your `.env` file.

## Usage

Once the server is running, it will be available at `http://0.0.0.0:3000`.

### Endpoints

#### Health Check
```
GET /
```

Returns the proxy status and information.

**Response:**
```json
{
  "status": "Proxy is running",
  "api": "http://0.0.0.0:3000/api/models",
  "message": "All /api requests are forwarded with API key."
}
```

#### API Proxy
```
GET/POST/PUT/DELETE /api/*
```

All requests to `/api/*` are forwarded to `{TARGET}/api/*` with the Authorization header set to `Bearer {API_KEY}`.

**Example:**
```bash
# Request to proxy
curl http://localhost:3000/api/models

# Forwarded to
# {TARGET}/api/models
# with header: Authorization: Bearer {API_KEY}
```

## Docker Deployment

### Using Docker Compose

Create a `docker-compose.yml` file:

```yaml
version: '3.8'

services:
  proxy:
    build: .
    ports:
      - "3000:3000"
    environment:
      - API_KEY=your-api-key-here
      - TARGET=https://your-target-api.com
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "curl", "-f", "http://0.0.0.0:3000/"]
      interval: 30s
      timeout: 3s
      start_period: 5s
      retries: 3
```

Run with:
```bash
docker-compose up -d
```

### Health Checks

The Docker container includes a health check that pings the root endpoint every 30 seconds. The container is considered unhealthy if it fails 3 consecutive checks.

## Development

### Project Structure

```
.
├── server.js           # Main application file
├── package.json        # Node.js dependencies and scripts
├── Dockerfile         # Docker configuration
├── .copy.env          # Environment variables template
├── .gitignore         # Git ignore rules
└── README.md          # This file
```

### Key Features in Code

- **TLS Certificate Validation Disabled**: The proxy disables TLS certificate validation (`NODE_TLS_REJECT_UNAUTHORIZED = '0'`), useful for development or self-signed certificates.
- **Request Logging**: All requests are logged with method and path.
- **Host Header Override**: The proxy sets the Host header to match the target server.
- **Error Handling**: Includes error handling for unreachable targets.

## Use Cases

- Adding API key authentication to OpenWebUI or other services
- Proxying requests to APIs that require authentication
- Development and testing with APIs
- Bridging authentication mechanisms

## Security Notes

⚠️ **Important Security Considerations:**

- This proxy disables TLS certificate validation. Only use this in development or trusted networks.
- Store your `API_KEY` securely and never commit it to version control.
- The `.env` file is gitignored by default.
- Consider using secrets management in production (e.g., Docker secrets, Kubernetes secrets).

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the [GitHub Issues](https://github.com/Sezzo/node-openwebui-proxy/issues) page.
