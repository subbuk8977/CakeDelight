const Cake = require("../models/Cake");



const getAllCakes = async (req,res)=>{

  try{
    const data = await Cake.find({});
    res.status(200).json({
      success : true,
      data
    });
  }

  catch(err){
    res.status(404).json({
      message : err.message
    })
  }

}

// GET /api/catalog/cakes
// List cakes with optional filters: name, category, minPrice, maxPrice
const getCakes = async (req, res) => {
  const { name, category, minPrice, maxPrice } = req.query;

  const filter = {};

  if (name) {
    filter.name = { $regex: name, $options: "i" };
  }

  if (category) {
    filter.category = {
      $regex: `^${category}$`,
      $options: "i",
    };
  }

  if (minPrice || maxPrice) {
    filter.price = {};

    if (minPrice) {
      filter.price.$gte = Number(minPrice);
    }

    if (maxPrice) {
      filter.price.$lte = Number(maxPrice);
    }
  }

  const cakes = await Cake.find(filter).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: cakes.length,
    data: cakes,
  });
};

// GET /api/catalog/cakes/:id
const getCakeById = async (req, res) => {
  const cake = await Cake.findById(req.params.id);

  if (!cake) {
    return res.status(404).json({
      success: false,
      message: "Cake not found",
    });
  }

  res.status(200).json({
    success: true,
    data: cake,
  });
};

// POST /api/catalog/cakes
const createCake = async (req, res) => {
  const {
    name,
    description,
    category,
    price,
    availability,
    imageUrl,
  } = req.body;

  if (!name || !category || price === undefined) {
    return res.status(400).json({
      success: false,
      message: "Name, category and price are required",
    });
  }

  const cake = await Cake.create({
    name,
    description,
    category,
    price,
    availability,
    imageUrl,
  });

  res.status(201).json({
    success: true,
    data: cake,
  });
};

// PUT /api/catalog/cakes/:id
const updateCake = async (req, res) => {
  const cake = await Cake.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!cake) {
    return res.status(404).json({
      success: false,
      message: "Cake not found",
    });
  }

  res.status(200).json({
    success: true,
    data: cake,
  });
};

// DELETE /api/catalog/cakes/:id
const deleteCake = async (req, res) => {
  const cake = await Cake.findByIdAndDelete(req.params.id);

  if (!cake) {
    return res.status(404).json({
      success: false,
      message: "Cake not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Cake deleted",
  });
};

module.exports = {
  getAllCakes,
  getCakes,
  getCakeById,
  createCake,
  updateCake,
  deleteCake,
};