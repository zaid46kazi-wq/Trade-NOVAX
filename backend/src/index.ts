import { createServer } from './server';
import { config } from './config';

const server = createServer();
const PORT = config.PORT;

server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  TradeNOVA AI Backend running on port ${PORT}`);
  console.log(`  WebSocket Server initialized successfully`);
  console.log(`=========================================`);
});
