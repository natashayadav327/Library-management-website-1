# Start the development server with OpenSSL legacy provider
# This fixes MongoDB Atlas SSL/TLS connection issues on older Node.js versions

$env:NODE_OPTIONS="--openssl-legacy-provider"
npm run dev
