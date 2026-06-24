// ============================================
// SpeedxSafety - Alerts Routes
// ============================================

const express = require('express');
const router = express.Router();

/**
 * GET /api/alerts
 * List alerts with optional filters:
 *   ?teen_id=xxx    — filter by teen
 *   ?type=speed     — filter by type (speed|geo|crash|curfew|sos)
 *   ?unread=true    — only unread alerts
 *   ?limit=10       — limit results
 */
router.get('/', async (req, res) => {
  try {
    let query = req.supabase.from('alerts').select('*');

    if (req.query.teen_id) {
      query = query.eq('teen_id', req.query.teen_id);
    }
    if (req.query.type) {
      query = query.eq('type', req.query.type);
    }
    if (req.query.unread === 'true') {
      query = query.eq('read', false);
    }

    query = query.order('timestamp', { ascending: false });

    if (req.query.limit) {
      query = query.limit(parseInt(req.query.limit, 10));
    }

    const { data: alertsList, error } = await query;
    if (error) throw error;

    // Fetch total unread count for the context
    const { count: unreadCount, error: countError } = await req.supabase
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    if (countError) throw countError;

    res.json({
      count: alertsList.length,
      unread_total: unreadCount || 0,
      alerts: alertsList,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Fetch Failed',
      message: error.message || 'An error occurred fetching alerts',
    });
  }
});

/**
 * POST /api/alerts
 * Create a new alert.
 * Body: { teen_id, teen_name, type, message, lat, lng, speed_recorded?, speed_limit? }
 */
router.post('/', async (req, res) => {
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

  try {
    const { data: newAlert, error } = await req.supabase
      .from('alerts')
      .insert({
        teen_id,
        teen_name: teen_name || 'Unknown',
        type,
        message,
        lat: lat || 0,
        lng: lng || 0,
        speed_recorded: speed_recorded || null,
        speed_limit: speed_limit || null,
        timestamp: Date.now(),
        read: false,
      })
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      message: 'Alert created',
      alert: newAlert,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Insert Failed',
      message: error.message || 'An error occurred creating the alert',
    });
  }
});

/**
 * PATCH /api/alerts/:id/read
 * Mark a single alert as read.
 */
router.patch('/:id/read', async (req, res) => {
  try {
    const { data: alert, error } = await req.supabase
      .from('alerts')
      .update({ read: true })
      .eq('alert_id', req.params.id)
      .select()
      .single();

    if (error || !alert) {
      return res.status(404).json({ error: 'Not Found', message: 'Alert not found' });
    }

    res.json({ message: 'Alert marked as read', alert });
  } catch (error) {
    res.status(500).json({
      error: 'Update Failed',
      message: error.message || 'An error occurred updating the alert status',
    });
  }
});

/**
 * PATCH /api/alerts/read-all
 * Mark all alerts as read.
 */
router.patch('/read-all', async (req, res) => {
  try {
    const { data: results, error } = await req.supabase
      .from('alerts')
      .update({ read: true })
      .eq('read', false)
      .select();

    if (error) throw error;

    res.json({ message: `${results ? results.length : 0} alerts marked as read` });
  } catch (error) {
    res.status(500).json({
      error: 'Update Failed',
      message: error.message || 'An error occurred marking alerts as read',
    });
  }
});

/**
 * DELETE /api/alerts/:id
 * Delete an alert.
 */
router.delete('/:id', async (req, res) => {
  try {
    const { data: deletedAlert, error } = await req.supabase
      .from('alerts')
      .delete()
      .eq('alert_id', req.params.id)
      .select()
      .single();

    if (error || !deletedAlert) {
      return res.status(404).json({ error: 'Not Found', message: 'Alert not found' });
    }

    res.json({ message: 'Alert deleted', alert: deletedAlert });
  } catch (error) {
    res.status(500).json({
      error: 'Delete Failed',
      message: error.message || 'An error occurred deleting the alert',
    });
  }
});

module.exports = router;
