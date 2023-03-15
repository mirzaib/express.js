const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

// Parse incoming request body
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection URL and options
const uri = "mongodb+srv://treatymaker12:<password>@cluster0.chm7fjj.mongodb.net/test?retryWrites=true&w=majority";
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useFindAndModify: false
};

// Define schema for memories collection
const memorySchema = new mongoose.Schema({
  memory: String,
  likes: Number,
  comments: [
    {
      name: String,
      comment: String
    }
  ]
});

// Define model for memories collection
const Memory = mongoose.model('Memory', memorySchema);

// Connect to MongoDB database
mongoose.connect(uri, options)
  .then(() => console.log('Connected to MongoDB!'))
  .catch(error => console.error('Error connecting to MongoDB:', error));

// Handle form submission
app.post('/memories', async (req, res) => {
  try {
    const memory = new Memory({
      memory: req.body.memory,
      likes: 0,
      comments: []
    });
    const savedMemory = await memory.save();
    res.status(201).json(savedMemory);
  } catch (error) {
    console.error('Error saving memory:', error);
    res.status(500).json({ error: 'Error saving memory' });
  }
});

// Handle like button click
app.patch('/memories/:id/like', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(req.params.id, { $inc: { likes: 1 } }, { new: true });
    res.status(200).json(memory);
  } catch (error) {
    console.error('Error updating memory:', error);
    res.status(500).json({ error: 'Error updating memory' });
  }
});

// Handle comment form submission
app.post('/memories/:id/comments', async (req, res) => {
  try {
    const memory = await Memory.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { name: req.body.name, comment: req.body.comment } } },
      { new: true }
    );
    res.status(200).json(memory);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Error adding comment' });
  }
});

// Start server
app.listen(port, () => console.log(`Server started on port ${port}`));
