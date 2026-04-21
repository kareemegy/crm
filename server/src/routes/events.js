import { Router } from 'express';
import { bus } from '../events/eventBus.js';

const router = Router();

// GET /api/events  — Server-Sent Events stream of all CRUD broadcasts.
// EventSource-compatible; clients reconnect automatically on drop.
router.get('/events', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    // Disable proxy buffering (Render/Nginx) so events flush immediately.
    'X-Accel-Buffering': 'no'
  });
  res.flushHeaders();

  res.write('event: connected\ndata: {}\n\n');

  const onEvent = (event) => {
    res.write(`event: ${event.type}\n`);
    res.write(`data: ${JSON.stringify({ ...event.payload, at: event.at })}\n\n`);
  };
  bus.on('broadcast', onEvent);

  // Heartbeat keeps intermediaries from timing out idle connections.
  const heartbeat = setInterval(() => res.write(': ping\n\n'), 25000);

  req.on('close', () => {
    clearInterval(heartbeat);
    bus.off('broadcast', onEvent);
  });
});

export default router;
