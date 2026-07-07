const Task = require('../models/Task');

// @desc    Get all user tasks (with search, filter, and sorting)
// @route   GET /api/tasks
// @access  Private
const getTasks = async (req, res) => {
  try {
    const queryObject = { user: req.user.id };

    // Search query
    if (req.query.search) {
      const searchRegex = new RegExp(req.query.search, 'i');
      queryObject.$or = [
        { title: searchRegex },
        { description: searchRegex }
      ];
    }

    // Filter by status
    if (req.query.status && req.query.status !== 'All') {
      queryObject.status = req.query.status;
    }

    // Filter by priority
    if (req.query.priority && req.query.priority !== 'All') {
      queryObject.priority = req.query.priority;
    }

    // Build Query
    let query = Task.find(queryObject);

    // Sorting
    if (req.query.sortBy) {
      const parts = req.query.sortBy.split(':');
      const sortField = parts[0];
      const sortOrder = parts[1] === 'desc' ? -1 : 1;
      query = query.sort({ [sortField]: sortOrder });
    } else {
      // Default sort by due date ascending
      query = query.sort({ dueDate: 1 });
    }

    const tasks = await query;

    res.json({
      success: true,
      count: tasks.length,
      data: tasks,
    });
  } catch (error) {
    console.error('Get Tasks Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Get single task
// @route   GET /api/tasks/:id
// @access  Private
const getTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to access this task' });
    }

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Get Task Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Create new task
// @route   POST /api/tasks
// @access  Private
const createTask = async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    // Validate fields
    if (!title) {
      return res.status(400).json({ success: false, message: 'Please add a task title' });
    }
    if (!dueDate) {
      return res.status(400).json({ success: false, message: 'Please add a due date' });
    }

    // Associate user with the task
    const task = await Task.create({
      title,
      description,
      status: status || 'Pending',
      priority: priority || 'Medium',
      dueDate,
      user: req.user.id,
    });

    res.status(201).json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Create Task Error:', error.message);
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Update task
// @route   PUT /api/tasks/:id
// @access  Private
const updateTask = async (req, res) => {
  try {
    let task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to modify this task' });
    }

    // Update fields
    const { title, description, status, priority, dueDate } = req.body;
    
    const fieldsToUpdate = {};
    if (title !== undefined) fieldsToUpdate.title = title;
    if (description !== undefined) fieldsToUpdate.description = description;
    if (status !== undefined) fieldsToUpdate.status = status;
    if (priority !== undefined) fieldsToUpdate.priority = priority;
    if (dueDate !== undefined) fieldsToUpdate.dueDate = dueDate;

    task = await Task.findByIdAndUpdate(
      req.params.id,
      fieldsToUpdate,
      { new: true, runValidators: true }
    );

    res.json({
      success: true,
      data: task,
    });
  } catch (error) {
    console.error('Update Task Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

// @desc    Delete task
// @route   DELETE /api/tasks/:id
// @access  Private
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }

    // Make sure task belongs to user
    if (task.user.toString() !== req.user.id) {
      return res.status(401).json({ success: false, message: 'Not authorized to delete this task' });
    }

    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Task removed successfully',
      data: { id: req.params.id }
    });
  } catch (error) {
    console.error('Delete Task Error:', error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.status(500).json({ success: false, message: 'Server Error: ' + error.message });
  }
};

module.exports = {
  getTasks,
  getTask,
  createTask,
  updateTask,
  deleteTask,
};
