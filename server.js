const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb+srv://iotmember:06SgzAZmoMqpfYTg@iot.63oci.mongodb.net/noel').then(() => console.log('MongoDB connected'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

// Define a schema and model for incoming Arduino data
const ArduinoDataSchema = new mongoose.Schema({
  devid: { type: String, required: true },
  state: { type: String, required: true },
}, {
  collection: 'toys' // Specify the collection name
});
const ArduinoData = mongoose.model('ArduinoData', ArduinoDataSchema);

// Define the POST route
app.post('/api/arduino-data/data', async (req, res) => {
  try {
    const { devid, state } = req.body;

    // Validate the incoming data
    if (!devid || !state) {
      return res.status(400).json({ error: 'Both devid and status are required' });
    }

    // Delete the existing entry with the same devid
    await ArduinoData.deleteOne({ devid });

    // Insert the new data
    const newEntry = new ArduinoData({ devid, state });
    const savedEntry = await newEntry.save();

    res.status(201).json({ message: 'Data replaced successfully', savedEntry });
  } catch (error) {
    console.error('Error saving data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define the GET route to fetch all Arduino data
app.get('/api/arduino-data/data', async (req, res) => {
  try {
    const data = await ArduinoData.find();
    res.status(200).json({ message: 'Data fetched successfully', data });
  } catch (error) {
    console.error('Error fetching data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});