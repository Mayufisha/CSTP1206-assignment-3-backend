const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const app = express();
const cors = require("cors");
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://jattbhupinder13:NDRCzkI8wWhfroQK@cluster0.txoj3zd.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0/Assignment3",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

const unicornSchema = new mongoose.Schema({
  name: String,
  loves: [String],
  weight: Number,
  gender: String,
  vampires: Number,
  vaccinated: Boolean,
  vampiresExist: Boolean,
});

const Unicorn = mongoose.model("Unicorns", unicornSchema);

app.use(express.json());
app.get("/unicorns", async (req, res) => {
  try {
    const filters = {};
    const {
      name,
      loves,
      weightGreaterThan,
      weightLessThan,
      gender,
      vaccinated,
      vampiresGreaterThan, // Add vampiresGreaterThan to destructure query params
    } = req.query;

    if (name) filters.name = { $regex: name, $options: "i" }; // Case-insensitive search
    if (loves) filters.loves = { $regex: loves, $options: "i" }; // Case-insensitive search
    if (weightGreaterThan)
      filters.weight = { $gt: parseFloat(weightGreaterThan) }; // Weight greater than
    if (weightLessThan)
      filters.weight = { ...filters.weight, $lt: parseFloat(weightLessThan) }; // Weight less than
    if (gender) filters.gender = gender; // Exact match for gender
    if (vaccinated) filters.vaccinated = vaccinated === "true"; // Boolean match for vaccinated
    if (vampiresGreaterThan)
      filters.vampires = { $gt: parseInt(vampiresGreaterThan) }; // Vampires greater than

    console.log("Filters applied:", filters); // Debugging log

    const unicorns = await Unicorn.find(filters); // Apply filters to the query
    res.json(unicorns); // Send the filtered unicorns as a JSON response
  } catch (error) {
    console.error("Error retrieving unicorns:", error);
    res.status(500).send("Error retrieving unicorns");
  }
});
// Create unicorn
app.post("/unicorns", async (req, res) => {
  try {
    const newUnicorn = new Unicorn(req.body);
    const savedUnicorn = await newUnicorn.save();
    res.status(201).json(savedUnicorn);
  } catch (error) {
    console.error(error);
    res.status(400).send("Error creating unicorn");
  }
});
//update A unicorn
// Update unicorn fields by name
app.patch("/unicorns/:name", async (req, res) => {
  try {
    const { name } = req.params;
    const { dob, loves, weight, vampires, gender } = req.body;

    // Build the update object dynamically
    const updateFields = {};
    if (dob) updateFields.dob = dob;
    if (loves) updateFields.loves = loves;
    if (weight) updateFields.weight = weight;
    if (vampires) updateFields.vampires = vampires;
    if (gender) updateFields.gender = gender;

    // Update unicorn by name (case-insensitive)
    const result = await Unicorn.updateOne(
      { name: { $regex: `^${name}$`, $options: "i" } }, // Case-insensitive match
      { $set: updateFields }
    );

    // Check if any document was updated
    if (result.matchedCount === 0) {
      return res.status(404).send("Unicorn not found");
    }

    console.log("Update result:", result); // Debugging log
    res.send("Unicorn updated successfully");
  } catch (err) {
    console.error("Error updating unicorn:", err);
    res.status(500).send("Error updating unicorn");
  }
});

// Delete unicorn by name
app.delete("/unicorns/:name", async (req, res) => {
  try {
    // Delete unicorn by name (case-insensitive)
    const result = await Unicorn.deleteOne({
      name: { $regex: `^${req.params.name}$`, $options: "i" },
    });

    // Check if any document was deleted
    if (result.deletedCount === 0) {
      return res.status(404).send("Unicorn not found");
    }

    console.log("Delete result:", result); // Debugging log
    res.send("Unicorn deleted");
  } catch (err) {
    console.error("Error deleting unicorn:", err);
    res.status(500).send("Error deleting unicorn");
  }
});
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
