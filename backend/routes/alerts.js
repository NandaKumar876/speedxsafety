// ============================================
// SpeedxSafety - Alerts Routes
// ============================================

const express = require('express');
const router = express.Router();
const { alerts } = require('../data/seedData');

/**
 * GET /api/alerts
 * List alerts with optional filters:
 *   ?teen_id=xxx    — filter by teen
 *   ?type=speed     — filter by type (speed|geo|crash|curfew|sos)
 *   ?unread=true    — only unread alerts
 *   ?limit=10       — limit results
 */
router.get('/', (req, res) => {
  let result = [...alerts];

  if (req.query.teen_id) {
    result = result.filter(a => a.teen_id === req.query.teen_id);
  }
  if (req.query.type) {
    result = result.filter(a => a.type === req.query.type);
  }
  if (req.query.unread === 'true') {
    result = result.filter(a => !a.read);
  }

  // Sort by timestamp descending (most recent first)
  result.sort((a, b) => b.timestamp - a.timestamp);

  if (req.query.limit) {
    result = result.slice(0, parseInt(req.query.limit, 10));
  }

  const unreadCount = alerts.filter(a => !a.read).length;

  res.json({
    count: result.length,
    unread_total: unreadCount,
    alerts: result,
  });
});

/**
 * POST /api/alerts
 * Create a new alert.
 * Body: { teen_id, teen_name, type, message, lat, lng, speed_recorded?, speed_limit? }
 */
router.post('/', (req, res) => {
  const { teen_id, teen_name, type, message, lat, lng, speed_recorded, speed_limit } = req.body;

  if (!teen_id || !type || !message) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'Required fields: teen_id, type, message',
    });
  }

  const validTypes = ['speed', 'geo', 'crash', 'curfew', 'sos'];
  if (!validTypes.includes(type)) {
    return res.status(400).json({
      error: 'Validation Error',
      message: `Type must be one of: ${validTypes.join(', ')}`,
    });
  }

  const newAlert = {
    alert_id: `alert-${Date.now()}`,
    teen_id,
    teen_name: teen_name || 'Unknown',
    type,
    speed_recorded: speed_recorded || null,
    speed_limit: speed_limit || null,
    lat: lat || 0,
    lng: lng || 0,
    timestamp: Date.now(),
    message,
    read: false,
  };

  alerts.push(newAlert);

  res.status(201).json({
    message: 'Alert created',
    alert: newAlert,
  });
});

/**
 * PATCH /api/alerts/:id/read
 * Mark a single alert as read.
 */
router.patch('/:id/read', (req, res) => {
  const alert = alerts.find(a => a.alert_id === req.params.id);
  if (!alert) {
    return res.status(404).json({ error: 'Not Found', message: 'Alert not found' });
  }

  alert.read = true;

  res.json({ message: 'Alert marked as read', alert });
});

/**
 * PATCH /api/alerts/read-all
 * Mark all alerts as read.
 */
router.patch('/read-all', (_req, res) => {
  let count = 0;
  alerts.forEach(a => {
    if (!a.read) {
      a.read = true;
      count++;
    }
  });

  res.json({ message: `${count} alerts marked as read` });
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert.
 */
router.delete('/:id', (req, res) => {
  const index = alerts.findIndex(a => a.alert_id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Not Found', message: 'Alert not found' });
  }

  const deleted = alerts.splice(index, 1)[0];

  res.json({ message: 'Alert deleted', alert: deleted });
});

module.exports = router;
