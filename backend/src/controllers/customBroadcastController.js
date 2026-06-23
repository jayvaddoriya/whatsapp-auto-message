const CustomBroadcast = require('../models/CustomBroadcast');
const CustomBroadcastNumber = require('../models/CustomBroadcastNumber');

// GET /api/custom-broadcasts
const list = async (req, res) => {
  const { search } = req.query;

  try {
    let query = { admin_id: req.user.id };
    if (search) {
      query.name = { $regex: search, $options: 'i' };
    }

    const lists = await CustomBroadcast.find(query).sort({ _id: -1 });

    // Enrich each list with its phone numbers and recipient count
    const enrichedLists = [];
    for (const list of lists) {
      const numbers = await CustomBroadcastNumber.find({ broadcast_id: list._id });
      const listObj = list.toJSON();
      listObj.recipient_count = numbers.length;
      listObj.numbers = numbers.map(n => n.phone_number);
      enrichedLists.push(listObj);
    }

    res.json(enrichedLists);
  } catch (err) {
    console.error('Fetch custom broadcasts error:', err);
    res.status(500).json({ error: 'Failed to fetch custom broadcasts.' });
  }
};

// POST /api/custom-broadcasts
const create = async (req, res) => {
  const { name, numbers } = req.body;

  if (!name || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Name and numbers array are required.' });
  }

  try {
    // 1. Create the custom broadcast entry
    const broadcast = await CustomBroadcast.create({
      admin_id: req.user.id,
      name
    });

    // 2. Insert phone numbers
    for (const number of numbers) {
      const cleanNum = number.replace(/\D/g, '');
      if (cleanNum) {
        await CustomBroadcastNumber.create({
          broadcast_id: broadcast._id,
          phone_number: cleanNum
        });
      }
    }

    res.status(201).json({
      message: 'Custom broadcast list created successfully.',
      id: broadcast.id
    });
  } catch (err) {
    console.error('Create custom broadcast error:', err);
    res.status(500).json({ error: 'Failed to create custom broadcast list.' });
  }
};

// PUT /api/custom-broadcasts/:id
const update = async (req, res) => {
  const listId = req.params.id;
  const { name, numbers } = req.body;

  if (!name || !numbers || !Array.isArray(numbers)) {
    return res.status(400).json({ error: 'Name and numbers array are required.' });
  }

  try {
    // 1. Verify ownership
    const broadcast = await CustomBroadcast.findOne({ _id: listId, admin_id: req.user.id });
    if (!broadcast) {
      return res.status(404).json({ error: 'Custom list not found.' });
    }

    // 2. Update name
    await CustomBroadcast.findByIdAndUpdate(listId, { name });

    // 3. Clear old numbers
    await CustomBroadcastNumber.deleteMany({ broadcast_id: listId });

    // 4. Insert new numbers
    for (const number of numbers) {
      const cleanNum = number.replace(/\D/g, '');
      if (cleanNum) {
        await CustomBroadcastNumber.create({
          broadcast_id: listId,
          phone_number: cleanNum
        });
      }
    }

    res.json({ message: 'Custom broadcast list updated successfully.' });
  } catch (err) {
    console.error('Update custom broadcast error:', err);
    res.status(500).json({ error: 'Failed to update custom broadcast list.' });
  }
};

// DELETE /api/custom-broadcasts/:id
const remove = async (req, res) => {
  const listId = req.params.id;

  try {
    const result = await CustomBroadcast.findOneAndDelete({ _id: listId, admin_id: req.user.id });
    if (!result) {
      return res.status(404).json({ error: 'Custom list not found.' });
    }

    // Cascade delete numbers
    await CustomBroadcastNumber.deleteMany({ broadcast_id: listId });

    res.json({ message: 'Custom list deleted successfully.' });
  } catch (err) {
    console.error('Delete custom list error:', err);
    res.status(500).json({ error: 'Failed to delete custom list.' });
  }
};

module.exports = { list, create, update, remove };
