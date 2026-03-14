export default function ApiHealthCheck() {
  return Response.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    message: 'CoreInventory API is running'
  });
}
