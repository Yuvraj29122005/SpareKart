const Product = require("../models/Product");

const defaultProducts = [
  {
    name: "All-Season Tyre",
    price: 4500,
    category: "Tyres",
    stock: 15,
    desc: "Durable all-season tyre with excellent grip and long life.",
    img: ""
  },
  {
    name: "LED Headlight",
    price: 1899,
    category: "Lights",
    stock: 22,
    desc: "Bright LED headlight for better visibility at night.",
    img: ""
  },
  {
    name: "Engine Oil Filter",
    price: 499,
    category: "Engine",
    stock: 40,
    desc: "High-quality oil filter for engine protection and performance.",
    img: ""
  },
  {
    name: "Brake Disc Set",
    price: 2999,
    category: "Brakes",
    stock: 30,
    desc: "Premium brake disc set for superior stopping power. Fits front wheels.",
    img: ""
  }
];

exports.getProducts = async (req, res) => {
  try {
    const { search = "", category = "All" } = req.query;

    const query = {};
    if (search) {
      query.name = { $regex: search, $options: "i" };
    }
    if (category && category !== "All") {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 }).lean();
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).lean();
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createProduct = async (req, res) => {
  try {
    const { name, price, category, stock, desc, img } = req.body || {};
    if (!name || price == null || !category || stock == null || !desc) {
      return res.status(400).json({
        message: "name, price, category, stock and desc are required"
      });
    }

    const product = await Product.create({
      name,
      price,
      category,
      stock,
      desc,
      img: img || ""
    });

    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const { name, price, category, stock, desc, img } = req.body || {};
    if (name != null) product.name = name;
    if (price != null) product.price = price;
    if (category != null) product.category = category;
    if (stock != null) product.stock = stock;
    if (desc != null) product.desc = desc;
    if (img != null) product.img = img;

    const updated = await product.save();
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    await Product.deleteOne({ _id: req.params.id });
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.seedProducts = async (req, res) => {
  try {
    const count = await Product.countDocuments();
    if (count > 0) {
      return res.json({ message: "Products already exist", inserted: 0 });
    }

    const inserted = await Product.insertMany(defaultProducts);
    res.status(201).json({
      message: "Default products inserted",
      inserted: inserted.length
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
