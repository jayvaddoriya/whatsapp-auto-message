const Schedule = require('../models/Schedule');
const whatsappService = require('../services/whatsapp');
const { calculateNextRun } = require('../services/scheduler');

// GET /api/schedules
const list = async (req, res) => {
  const { search } = req.query;

  try {
    let query = { admin_id: req.user.id };
    if (search) {
      query.$or = [
        { broadcast_name: { $regex: search, $options: 'i' } },
        { broadcast_jid: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
      // Combine admin_id filter with search
      query = { admin_id: req.user.id, ...query };
    }

    const schedulesList = await Schedule.find(query).sort({ _id: -1 });
    res.json(schedulesList);
  } catch (err) {
    console.error('Get schedules error:', err);
    res.status(500).json({ error: 'Failed to retrieve schedules.' });
  }
};

// POST /api/schedules
const create = async (req, res) => {
  const { broadcast_jid, broadcast_name, message, schedule_date, schedule_time, period, media } = req.body;

  if (!broadcast_jid || !broadcast_name || !message || !schedule_date || !schedule_time || !period) {
    return res.status(400).json({ error: 'All schedule details are required.' });
  }

  try {
    // Compute next_run_at timestamp
    let nextRunAtISO;
    if (req.body.next_run_at) {
      nextRunAtISO = req.body.next_run_at;
    } else {
      const localDateTime = new Date(`${schedule_date}T${schedule_time}`);
      if (isNaN(localDateTime.getTime())) {
        return res.status(400).json({ error: 'Invalid schedule date or time format.' });
      }
      nextRunAtISO = localDateTime.toISOString();
    }

    const newSchedule = await Schedule.create({
      admin_id: req.user.id,
      broadcast_jid,
      broadcast_name,
      message,
      schedule_date,
      schedule_time,
      period,
      status: 'pending',
      next_run_at: nextRunAtISO,
      media: media || { data: null, contentType: null, filename: null }
    });

    res.status(201).json({
      message: 'Schedule created successfully.',
      id: newSchedule.id,
      next_run_at: nextRunAtISO
    });
  } catch (err) {
    console.error('Create schedule error:', err);
    res.status(500).json({ error: 'Failed to create schedule.' });
  }
};

// PUT /api/schedules/:id
const update = async (req, res) => {
  const scheduleId = req.params.id;
  const { broadcast_jid, broadcast_name, message, schedule_date, schedule_time, period, media } = req.body;

  if (!broadcast_jid || !broadcast_name || !message || !schedule_date || !schedule_time || !period) {
    return res.status(400).json({ error: 'All schedule details (broadcast list, message, date, time, period) are required.' });
  }

  try {
    const schedule = await Schedule.findOne({ _id: scheduleId, admin_id: req.user.id });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    // Recompute next_run_at
    let nextRunAtISO;
    if (req.body.next_run_at) {
      nextRunAtISO = req.body.next_run_at;
    } else {
      const localDateTime = new Date(`${schedule_date}T${schedule_time}`);
      if (isNaN(localDateTime.getTime())) {
        return res.status(400).json({ error: 'Invalid date or time format.' });
      }
      nextRunAtISO = localDateTime.toISOString();
    }

    await Schedule.findByIdAndUpdate(scheduleId, {
      broadcast_jid,
      broadcast_name,
      message,
      schedule_date,
      schedule_time,
      period,
      status: 'pending',
      next_run_at: nextRunAtISO,
      error_message: null,
      media: media || { data: null, contentType: null, filename: null }
    });

    res.json({ message: 'Schedule updated successfully.', next_run_at: nextRunAtISO });
  } catch (err) {
    console.error('Update schedule error:', err);
    res.status(500).json({ error: 'Failed to update schedule.' });
  }
};

// DELETE /api/schedules/:id
const remove = async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const result = await Schedule.findOneAndDelete({ _id: scheduleId, admin_id: req.user.id });
    if (!result) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }
    res.json({ message: 'Schedule deleted successfully.' });
  } catch (err) {
    console.error('Delete schedule error:', err);
    res.status(500).json({ error: 'Failed to delete schedule.' });
  }
};

// POST /api/schedules/:id/send-now
const sendNow = async (req, res) => {
  const scheduleId = req.params.id;

  try {
    const schedule = await Schedule.findOne({ _id: scheduleId, admin_id: req.user.id });
    if (!schedule) {
      return res.status(404).json({ error: 'Schedule not found.' });
    }

    console.log(`[Send-Now] Triggering immediate send for schedule ${scheduleId}`);

    // Call WhatsApp sender directly with media
    await whatsappService.sendMessage(req.user.id, schedule.broadcast_jid, schedule.message, schedule.media);

    const nowISO = new Date().toISOString();

    if (schedule.period === 'once') {
      await Schedule.findByIdAndUpdate(scheduleId, {
        status: 'sent',
        last_run_at: nowISO,
        next_run_at: null,
        error_message: null
      });
    } else {
      // Push next run forward
      const nextRun = calculateNextRun(new Date().toISOString(), schedule.period);
      await Schedule.findByIdAndUpdate(scheduleId, {
        status: 'active',
        last_run_at: nowISO,
        next_run_at: nextRun ? nextRun.toISOString() : null,
        error_message: null
      });
    }

    res.json({ message: 'Message sent immediately.' });
  } catch (err) {
    console.error('Send now error:', err);
    res.status(500).json({ error: err.message || 'Failed to send immediately. Verify WhatsApp connection.' });
  }
};

module.exports = { list, create, update, remove, sendNow };
