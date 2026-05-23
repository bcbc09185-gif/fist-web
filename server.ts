import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 3000;

// Cloudinary Configuration
const envCloudName = process.env.CLOUDINARY_CLOUD_NAME?.trim();
const envApiKey = process.env.CLOUDINARY_API_KEY?.trim();
const envApiSecret = process.env.CLOUDINARY_API_SECRET?.trim();
const envCloudUrl = process.env.CLOUDINARY_URL?.trim();

// Special check: If the user accidentally put the whole URL in one of the fields
const isUrlMistake = [envCloudName, envApiKey, envApiSecret].some(v => v?.startsWith("cloudinary://"));

let hasFullUserConfig = !!(envCloudName && envApiKey && envApiSecret);
let configSource = "system fallback";

if (envCloudUrl) {
  configSource = "CLOUDINARY_URL";
  cloudinary.config({
    cloudinary_url: envCloudUrl,
    secure: true
  });
} else if (hasFullUserConfig) {
  configSource = "discrete environment variables";
  cloudinary.config({
    cloud_name: envCloudName,
    api_key: envApiKey,
    api_secret: envApiSecret,
    secure: true
  });
} else {
  // System Fallback
  cloudinary.config({
    cloud_name: "dzkffnro1",
    api_key: "241135318915358",
    api_secret: "NJXhU8zJhyH7sFol9NO7Kuywqgo",
    secure: true
  });
}

if (isUrlMistake) {
  console.error("🛑 Cloudinary Error: It looks like you pasted a 'cloudinary://' URL into one of the individual fields. Please use CLOUDINARY_URL variable instead.");
}

console.log(`☁️ Cloudinary: Configured using ${configSource}`);

// For debugging (only logs first/last chars)
const debugSecret = envApiSecret || (envCloudUrl ? "URL-based" : "NJXhU8zJhyH7sFol9NO7Kuywqgo");
if (debugSecret !== "URL-based") {
  console.log(`   - Secret Hint: ${debugSecret.substring(0, 5)}...${debugSecret.substring(debugSecret.length - 3)}`);
}

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://bcbc09185_db_user:BvoR5pjECOW3UKRD@cluster0.jmssfza.mongodb.net/?appName=Cluster0";
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ MongoDB Connected Successfully");
    seedDefaultConfig();
  })
  .catch(err => {
    console.error("❌ MongoDB Connection Error:");
    console.error(err);
    if (err.name === 'MongooseServerSelectionError') {
      console.error("💡 TIP: This is likely an IP whitelist issue in MongoDB Atlas.");
      console.error("   Please go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)");
    }
  });

// Schemas
const userSchema = new mongoose.Schema({
  email: String,
  firstName: String,
  lastName: String,
  role: { type: String, default: "user" },
  createdAt: { type: Date, default: Date.now }
});

const productSchema = new mongoose.Schema({
  name: String,
  price: Number,
  description: String,
  category: String,
  subcategory: String,
  features: [{ text: String, imageUrl: String }],
  benefits: [{ text: String, imageUrl: String }],
  imageUrl: String,
  gallery: [String],
  demoUrl: String,
  downloadUrl: String,
  downloadFiles: [{ name: String, url: String }],
  technologies: [String],
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  userEmail: String,
  status: { type: String, default: 'pending' }, // 'pending', 'confirmed', 'rejected'
  amount: Number,
  createdAt: { type: Date, default: Date.now },
  
  // New user/checkout details
  customerName: String,
  customerEmail: String,
  customerWhatsapp: String,
  paymentMethod: String,
  transactionId: String,
  senderPhone: String,
  selectedGuidePack: {
    key: String,
    name: String,
    price: Number,
    description: String
  }
});

const saleSchema = new mongoose.Schema({
  orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
  amount: Number,
  createdAt: { type: Date, default: Date.now }
});

const guidePackSchema = new mongoose.Schema({
  key: { type: String, unique: true }, // 'small', 'medium', 'pro'
  name: String,
  price: Number,
  description: String,
  images: [String]
});

const paymentConfigSchema = new mongoose.Schema({
  method: { type: String, unique: true }, // 'bkash', 'nagad', 'rocket', 'upay', 'bank', 'card'
  label: String,
  isEnabled: { type: Boolean, default: false },
  details: String
});

const User = mongoose.model("User", userSchema);
const Product = mongoose.model("Product", productSchema);
const Order = mongoose.model("Order", orderSchema);
const Sale = mongoose.model("Sale", saleSchema);
const GuidePack = mongoose.model("GuidePack", guidePackSchema);
const PaymentConfig = mongoose.model("PaymentConfig", paymentConfigSchema);

async function seedDefaultConfig() {
  try {
    // 1. Seed guide packs
    const packsCount = await GuidePack.countDocuments();
    if (packsCount === 0) {
      const defaultPacks = [
        {
          key: 'small',
          name: 'Small Pack',
          price: 500,
          description: 'Includes a step-by-step PDF installation guide, initial setup instructions, and 7 days of basic chat/email support to resolve setup blockages.',
          images: ['https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600']
        },
        {
          key: 'medium',
          name: 'Medium Pack',
          price: 700,
          description: 'Includes video guides, standard database connection setup assistance, deployment hosting configuration advice, and 15 days of active messenger support.',
          images: ['https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600']
        },
        {
          key: 'pro',
          name: 'Pro Pack',
          price: 1000,
          description: 'Complete hands-on assistance. Our expert agent will directly setup, configure and fully deploy the application onto your hosting choice, backed by 30 days of priority direct support.',
          images: ['https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=600']
        }
      ];
      await GuidePack.insertMany(defaultPacks);
      console.log('🌱 Seeded default Guide Packs!');
    }

    // 2. Seed payment configs
    const paymentCount = await PaymentConfig.countDocuments();
    if (paymentCount === 0) {
      const defaultPayments = [
        { method: 'nagad', label: 'Nagad', isEnabled: true, details: '01339885689' },
        { method: 'bkash', label: 'bKash', isEnabled: false, details: '01700000000' },
        { method: 'rocket', label: 'Rocket', isEnabled: false, details: '01800000000' },
        { method: 'upay', label: 'Upay', isEnabled: false, details: '01900000000' },
        { method: 'bank', label: 'Bank Transfer', isEnabled: false, details: 'Bank Name: City Bank, A/C: 123456789' },
        { method: 'card', label: 'Credit/Debit Card', isEnabled: false, details: 'Card Gateway: PortWallet / SSLCommerz Link' }
      ];
      await PaymentConfig.insertMany(defaultPayments);
      console.log('🌱 Seeded default Payment Configs!');
    }
  } catch (err) {
    console.error('Error seeding configurations:', err);
  }
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Database connection check middleware
const checkDbConnection = (req: any, res: any, next: any) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({ 
      error: "Database Connection Error", 
      message: "The backend is unable to connect to MongoDB Atlas. This is likely an IP whitelist issue.",
      tip: "Please go to MongoDB Atlas -> Network Access -> Add IP Address -> Allow Access From Anywhere (0.0.0.0/0)"
    });
  }
  next();
};

app.use("/api", checkDbConnection);

// Multer storage
const uploadDir = path.join(process.cwd(), "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const uploadManager = multer({ 
  dest: "uploads/",
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB limit
    files: 200 // Increased total files
  }
});

const upload = uploadManager.fields([
  { name: 'image', maxCount: 1 },
  { name: 'gallery', maxCount: 100 },
  { name: 'prototypeFiles', maxCount: 100 },
  { name: 'prototypeFile', maxCount: 100 },
  { name: 'featureImages', maxCount: 100 },
  { name: 'benefitImages', maxCount: 100 }
]);

// Helper for Cloudinary Upload
async function uploadToCloudinary(filePath: string, folder: string = "website_bazer") {
  try {
    const stats = fs.statSync(filePath);
    console.log(`☁️ Uploading ${path.basename(filePath)} to Cloudinary (${(stats.size / 1024 / 1024).toFixed(2)} MB)...`);
    
    const result = await cloudinary.uploader.upload(filePath, { folder });
    
    fs.unlink(filePath, (err) => {
      if (err) console.error("Failed to delete temp file:", err);
    });
    return result.secure_url;
  } catch (error) {
    console.error("Cloudinary Upload Error:", error);
    throw error;
  }
}

// API Routes
app.get("/api/health", (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.json({ 
    status: isConnected ? "ok" : "degraded", 
    database: isConnected ? "connected" : "disconnected",
    database_state: mongoose.connection.readyState,
    cloudinary: configSource,
    cloud_name: cloudinary.config().cloud_name,
    tip: isConnected ? null : "MongoDB might be blocked by IP whitelist. Check Network Access in Atlas."
  });
});

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

app.post("/api/products", (req, res, next) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error("Multur Error:", err);
      return res.status(400).json({ error: "Upload limit exceeded", details: err.message });
    } else if (err) {
      console.error("Unknown Upload Error:", err);
      return res.status(500).json({ error: "Unknown upload error", details: err.message });
    }
    next();
  });
}, async (req, res) => {
  try {
    const { 
      name, price, description, category, subcategory, 
      features, benefits, demoUrl, imageUrls, technologies 
    } = req.body;
    
    console.log(`📦 Processing new product listing: ${name}`);
    const files = (req as any).files || {};

    // 1. Handle Main Image
    let mainImageUrl = "";
    if (files['image']?.[0]) {
      mainImageUrl = await uploadToCloudinary(files['image'][0].path);
    } else if (req.body.imageUrl) {
      mainImageUrl = req.body.imageUrl;
    }

    // 2. Handle Gallery
    const galleryUrls: string[] = [];
    if (files['gallery']) {
      for (const file of files['gallery']) {
        galleryUrls.push(await uploadToCloudinary(file.path));
      }
    }
    // Also add URL based gallery if provided
    if (imageUrls) {
      const urls = typeof imageUrls === 'string' ? JSON.parse(imageUrls || "[]") : imageUrls;
      galleryUrls.push(...urls);
    }

    // 3. Handle Prototype Files (Everything supported: Zip, APK, PDF, Images, etc.)
    const downloadFiles = [];
    let downloadUrl = "";
    
    if (files['prototypeFiles']) {
      console.log(`📁 Processing ${files['prototypeFiles'].length} prototype assets...`);
      for (const file of files['prototypeFiles']) {
        try {
            const result = await cloudinary.uploader.upload(file.path, { 
              folder: "downloads",
              resource_type: "auto",
              // Include the full filename with extension in public_id for raw files
              public_id: `${Date.now()}_${file.originalname}`,
              use_filename: true,
              unique_filename: true
            });
          downloadFiles.push({ name: file.originalname, url: result.secure_url });
          if (!downloadUrl) downloadUrl = result.secure_url;
          console.log(`✅ Uploaded: ${file.originalname}`);
        } catch (cloudErr: any) {
          console.error(`Error uploading ${file.originalname}:`, cloudErr);
        } finally {
          fs.unlink(file.path, (err) => { if (err) console.error(err); });
        }
      }
    } else if (files['prototypeFile']?.[0]) {
      // Small backward compatibility if needed
      const result = await cloudinary.uploader.upload(files['prototypeFile'][0].path, { 
        folder: "downloads",
        resource_type: "auto",
        public_id: `${Date.now()}_${files['prototypeFile'][0].originalname}`,
        use_filename: true,
        unique_filename: true
      });
      downloadUrl = result.secure_url;
      downloadFiles.push({ name: files['prototypeFile'][0].originalname, url: result.secure_url });
      fs.unlink(files['prototypeFile'][0].path, (err) => { if (err) console.error(err); });
    }

    // 4. Handle Features (Text + Image)
    const parsedFeatures = Array.isArray(features) ? features : JSON.parse(features || "[]");
    const processedFeatures = [];
    for (let i = 0; i < parsedFeatures.length; i++) {
      let featImg = parsedFeatures[i]?.imageUrl || "";
      const featFile = (files['featureImages'] as any[])?.find((f: any) => f.originalname.includes(`feat_${i}`));
      if (featFile) {
        featImg = await uploadToCloudinary(featFile.path);
      }
      const textValue = typeof parsedFeatures[i] === 'object' ? parsedFeatures[i].text : parsedFeatures[i];
      processedFeatures.push({ text: textValue || "", imageUrl: featImg });
    }

    // 5. Handle Benefits (Text + Image)
    const parsedBenefits = Array.isArray(benefits) ? benefits : JSON.parse(benefits || "[]");
    const processedBenefits = [];
    for (let i = 0; i < parsedBenefits.length; i++) {
      let benImg = parsedBenefits[i]?.imageUrl || "";
      const benFile = (files['benefitImages'] as any[])?.find((f: any) => f.originalname.includes(`ben_${i}`));
      if (benFile) {
        benImg = await uploadToCloudinary(benFile.path);
      }
      const textValue = typeof parsedBenefits[i] === 'object' ? parsedBenefits[i].text : parsedBenefits[i];
      processedBenefits.push({ text: textValue || "", imageUrl: benImg });
    }

    const numericPrice = parseFloat(price);
    const parsedTechs = Array.isArray(technologies) ? technologies : JSON.parse(technologies || "[]");
    
    const newProduct = new Product({
      name,
      price: numericPrice,
      description,
      category,
      subcategory,
      features: processedFeatures,
      benefits: processedBenefits,
      imageUrl: mainImageUrl,
      gallery: galleryUrls,
      demoUrl,
      downloadUrl,
      downloadFiles,
      technologies: parsedTechs
    });

    await newProduct.save();
    res.status(201).json(newProduct);
  } catch (error: any) {
    console.error("Product Creation Error:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

app.post("/api/users/sync", async (req, res) => {
  try {
    const { email, firstName, lastName } = req.body;
    if (!email) {
      return res.status(400).json({ error: "Email is required for syncing" });
    }
    let user = await User.findOne({ email });
    if (!user) {
      user = new User({ email, firstName: firstName || "Guest", lastName: lastName || "" });
      await user.save();
    }
    res.json(user);
  } catch (error) {
    console.error("User sync error:", error);
    res.status(500).json({ error: "Failed to sync user" });
  }
});

app.get("/api/orders", async (req, res) => {
  try {
    const { email } = req.query;
    const filter = email ? { userEmail: String(email) } : {};
    const orders = await Order.find(filter).populate('productId').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

app.post("/api/orders", async (req, res) => {
  try {
    const { 
      productId, 
      userEmail, 
      amount,
      customerName,
      customerEmail,
      customerWhatsapp,
      paymentMethod,
      transactionId,
      senderPhone,
      selectedGuidePack
    } = req.body;

    const order = new Order({ 
      productId, 
      userEmail, 
      amount,
      customerName,
      customerEmail,
      customerWhatsapp,
      paymentMethod,
      transactionId,
      senderPhone,
      selectedGuidePack
    });
    
    await order.save();
    
    // If the order is initially confirmed (unlikely, but safe), create a sale.
    // Otherwise sales are dynamically created only when Admin confirms the order.
    
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Order creation error:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

app.put("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const order = await Order.findById(id).populate('productId');
    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }
    
    order.status = status;
    await order.save();
    
    // Sync with Sales
    if (status === 'confirmed') {
      const existingSale = await Sale.findOne({ orderId: id });
      if (!existingSale) {
        const sale = new Sale({ orderId: id, amount: order.amount });
        await sale.save();
      }
    } else {
      // Delete any associated Sales recording if status reverted to pending/rejected
      await Sale.deleteMany({ orderId: id });
    }
    
    res.json(order);
  } catch (error: any) {
    console.error("Order update error:", error);
    res.status(500).json({ error: "Failed to update order status", details: error.message });
  }
});

app.delete("/api/orders/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await Order.findByIdAndDelete(id);
    // clean up associated sales records
    await Sale.deleteMany({ orderId: id });
    res.json({ message: "Order & sale deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: "Failed to delete order", details: error.message });
  }
});

// Dynamic configuration APIs for Guide Packs and Payment Methods
app.get("/api/configs/guide-packs", async (req, res) => {
  try {
    const packs = await GuidePack.find();
    res.json(packs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch guide packs" });
  }
});

app.put("/api/configs/guide-packs/:key", async (req, res) => {
  try {
    const { key } = req.params;
    const { name, price, description, images } = req.body;
    const pack = await GuidePack.findOne({ key });
    if (!pack) {
      return res.status(404).json({ error: "Guide Pack not found" });
    }
    if (name !== undefined) pack.name = name;
    if (price !== undefined) pack.price = Number(price);
    if (description !== undefined) pack.description = description;
    if (images !== undefined) pack.images = images;
    
    await pack.save();
    res.json(pack);
  } catch (error: any) {
    console.error("Guide Pack update error:", error);
    res.status(500).json({ error: "Failed to update guide pack", details: error.message });
  }
});

app.get("/api/configs/payments", async (req, res) => {
  try {
    const configs = await PaymentConfig.find();
    res.json(configs);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch payment config" });
  }
});

app.put("/api/configs/payments/:method", async (req, res) => {
  try {
    const { method } = req.params;
    const { isEnabled, details, label } = req.body;
    const config = await PaymentConfig.findOne({ method });
    if (!config) {
      return res.status(404).json({ error: "Payment method not found" });
    }
    if (isEnabled !== undefined) config.isEnabled = !!isEnabled;
    if (details !== undefined) config.details = details;
    if (label !== undefined) config.label = label;
    
    await config.save();
    res.json(config);
  } catch (error: any) {
    console.error("Payment config update error:", error);
    res.status(500).json({ error: "Failed to update payment config", details: error.message });
  }
});

app.get("/api/sales", async (req, res) => {
  try {
    const sales = await Sale.find().populate({
      path: 'orderId',
      populate: { path: 'productId' }
    }).sort({ createdAt: -1 });
    res.json(sales);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch sales" });
  }
});

app.get("/api/download", async (req, res) => {
  const { url, name } = req.query;

  if (!url || !name) {
    return res.status(400).send("URL and Name are required");
  }

  try {
    const response = await axios({
      method: "get",
      url: url as string,
      responseType: "stream",
    });

    // Content-Disposition: attachment; filename="original_name.ext"
    res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(name as string)}"`);
    
    // Pipe the data to the response
    response.data.pipe(res);
  } catch (error) {
    console.error("Download Proxy Error:", error);
    res.status(500).send("Failed to download file");
  }
});

// Update product
app.put("/api/products/:id", uploadManager.fields([
  { name: 'mainImage', maxCount: 1 },
  { name: 'gallery', maxCount: 10 },
  { name: 'featureImages', maxCount: 10 },
  { name: 'benefitImages', maxCount: 10 }
]), async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, price, description, category, subcategory, 
      features, benefits, demoUrl, technologies 
    } = req.body;
    
    console.log(`📦 Received request to update prototype with ID: ${id}`);
    
    const product = await Product.findById(id);
    if (!product) {
      console.warn(`Product not found for ID: ${id}`);
      return res.status(404).json({ error: "Product not found" });
    }

    const files = (req as any).files || {};
    
    // Update basic fields
    if (name !== undefined) product.name = name;
    if (price !== undefined) product.price = parseFloat(price);
    if (description !== undefined) product.description = description;
    if (category !== undefined) product.category = category;
    if (subcategory !== undefined) product.subcategory = subcategory;
    if (demoUrl !== undefined) product.demoUrl = demoUrl;
    
    if (technologies !== undefined) {
      try {
        product.technologies = Array.isArray(technologies) 
          ? technologies 
          : JSON.parse(technologies || "[]");
      } catch (parseErr) {
        console.error("Error parsing technologies JSON:", parseErr);
      }
    }

    // Handle Image Updates if provided
    if (files['mainImage']?.[0]) {
      product.imageUrl = await uploadToCloudinary(files['mainImage'][0].path);
    }

    if (files['gallery']) {
      const galleryUrls = [];
      for (const file of files['gallery']) {
        galleryUrls.push(await uploadToCloudinary(file.path));
      }
      product.gallery = galleryUrls;
    }

    // Features and Benefits update logic
    if (features !== undefined) {
      try {
        const parsedFeatures = typeof features === 'string' ? JSON.parse(features) : (features || []);
        const featureImages = files['featureImages'] || [];
        
        const newFeatures = [];
        for (let i = 0; i < parsedFeatures.length; i++) {
          const f = parsedFeatures[i];
          let imageUrl = f.imageUrl;
          // Search for file with index
          const file = featureImages.find((fi: any) => fi?.originalname && fi.originalname.includes(`feat_${i}`));
          if (file) {
            imageUrl = await uploadToCloudinary(file.path);
          }
          newFeatures.push({ ...f, imageUrl });
        }
        product.features = newFeatures as any;
      } catch (parseErr) {
        console.error("Error parsing/handling features context:", parseErr);
      }
    }

    if (benefits !== undefined) {
      try {
        const parsedBenefits = typeof benefits === 'string' ? JSON.parse(benefits) : (benefits || []);
        const benefitImages = files['benefitImages'] || [];
        
        const newBenefits = [];
        for (let i = 0; i < parsedBenefits.length; i++) {
          const b = parsedBenefits[i];
          let imageUrl = b.imageUrl;
          const file = benefitImages.find((fi: any) => fi?.originalname && fi.originalname.includes(`ben_${i}`));
          if (file) {
            imageUrl = await uploadToCloudinary(file.path);
          }
          newBenefits.push({ ...b, imageUrl });
        }
        product.benefits = newBenefits as any;
      } catch (parseErr) {
        console.error("Error parsing/handling benefits context:", parseErr);
      }
    }

    await product.save();
    console.log(`✅ Product ID: ${id} successfully updated!`);
    res.json(product);
  } catch (error: any) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
});

// Delete product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️ Deleting product with ID: ${id}`);
    await Product.findByIdAndDelete(id);
    res.json({ message: "Product deleted" });
  } catch (error: any) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
});

// Cache for models that have returned a permanent quota exhaustion
const exhaustedModels = new Set<string>();

// AI Assistant endpoint
app.post("/api/ai-assistant", async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    const { GoogleGenAI } = await import("@google/genai");
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not configured. Please supply it in Settings > Secrets." });
    }

    const ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    // Dynmically fetch products context from DB
    const products = await Product.find().select('name price description category subcategory technologies');
    const productContext = products.length > 0 
      ? products.map(p => {
          return `- **${p.name}**
  Price/মূল্য: ৳${p.price} BDT
  Category: ${p.category}
  Subcategory: ${p.subcategory}
  Tech Stack: ${p.technologies?.join(", ") || "N/A"}
  Description: ${p.description}`;
        }).join("\n\n")
      : "No templates or products listed yet in the database. But users can contact us to build a custom website!";

    // Check if this is the very first user message we are replying to.
    const userMessageCount = history?.filter((msg: any) => msg.role === "user").length || 0;
    const isFirstUserReply = userMessageCount === 0;

    const systemInstruction = `You are "Website Bazer Assistant" (ওয়েবসাইট বাজার অ্যাসিস্ট্যান্ট), an incredibly helpful AI agent for the "Website Bazer" ready-made website template marketplace.

Our Details & Contacts:
- Location / আমাদের ঠিকানা: Kaptai, Rangamati, Bangladesh (কাপ্তাই, রাঙামাটি, বাংলাদেশ)
- Contacts / আমাদের সাথে যোগাযোগের মাধ্যম:
  1. WhatsApp / হোয়াটসঅ্যাপ: 01822963824 (Link: https://wa.me/8801822963824?text=I%20want%20to%20build%20a%20website%2C%20so%20I%20want%20to%20hire%20you)
  2. Call / সরাসরি ফোন: 01329885689
  3. Telegram / টেলিগ্রাম: 01822963824 (Link: https://t.me/+8801822963824 or search +8801822963824)
  4. Gmail / ইমেইল: orjodas@gmail.com

${isFirstUserReply ? `CRITICAL FIRST-REPLY RULE:
- THIS IS THE VERY FIRST USER QUERY of this chat session.
- You MUST respond, greet, and answer EXCLUSIVELY in standard friendly English, regardless of whatever language or regional dialect the user typed their first message in (even if they wrote in Bangla, Chatgaiya, Noakhali, etc.).
- Do not speak/write in any Bangla or regional dialect for this response. Reply entirely in standard English.` : `CRITICAL MULTILINGUAL & REGIONAL DIALECT RULES (50,000+ LANGUAGES & DIALECTS):
- You can communicate masterfully in ANY language or regional dialect on Earth (Standard Bangla, English, Chatgaiya / Chittagonian, Sylheti, Dhakaiya, Noakhali, Barisahiya, Hindi, Arabic, Spanish, French, Chinese, Japanese, and thousands of others!).
- NEVER APOLOGIZE OR DENY A LANGUAGE / DIALECT: Under absolutely no circumstances should you ever say "I cannot speak [dialect/language]" or "আমি চাটগাঁইয়া ভাষায় কথা বলতে পারি না". You must embrace whatever dialect or language the user types in, and converse back with them beautifully and fluently in that exact language or regional dialect!
- ALWAYS detect the language/dialect of the user's latest message and respond in the exact same language or regional dialect.
- Keep the conversation extremely personalized, polite, and helpful. Never reply in standard Bangla if the user asks you something in a regional dialect like Chatgaiya (Chittagonian) or Sylheti; instead, speak to them in that specific dialect to provide the ultimate personalization!`}

Instructions:
1. Handle user requests about ready-made templates, pricing, categories, and technologies.
2. If they ask about buying a template, explain terms simply and mention our available Payment Methods (like bKash / Nagad / Upay / Bank / Cards) which they can use easily on checkout.
3. Show off the templates in our marketplace! Here are the actual templates ready to sell right now in our Database:
${productContext}

4. CRITICAL: If a user says they want a dedicated or custom website built specifically for their requirements, tell them (translating/adapting the response appropriately or staying friendly to the query language / regional dialect):
- For Bangla / Regional Bangla dialects: "আপনার ইচ্ছে মতো কাস্টম সাইট বানাতে চাইলে সরাসরি আমাদের হোয়াটসঅ্যাপ নাম্বারে (01822963824) মেসেজ দিয়ে আমাদের হায়ার করতে পারেন! আমরা আপনার প্রয়োজন অনুযায়ী খুব দ্রুত সাইট বানিয়ে দেব।" (Please adapt/write this beautifully in the user's precise regional dialect if they asked in one!)
- For English / other languages, adapt the response: "If you want to build a custom website according to your own requirements, you can directly message us on our WhatsApp number (+8801822963824) to hire us! We will build the site very quickly according to your needs."
Direct them to use the WhatsApp button or click the WhatsApp link: https://wa.me/8801822963824?text=I%20want%20to%20build%20a%20website%2C%20so%20I%20want%20to%20hire%20you

Provide short, crisp, highly readable markdown replies. Emphasize friendliness and help them buy or build their dream websites!`;

    const chatHistory = history?.map((msg: any) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.text }]
    })) || [];

    // Helper function to call the models with fallback and retries
    const callModelWithRetry = async (modelName: string, retries = 3, delay = 800) => {
      for (let attempt = 1; attempt <= retries + 1; attempt++) {
        try {
          return await ai.models.generateContent({
            model: modelName,
            contents: [
              ...chatHistory,
              { role: "user", parts: [{ text: message }] }
            ],
            config: {
              systemInstruction,
              temperature: 0.7,
            }
          });
        } catch (err: any) {
          const errMsg = err?.message || "";
          
          // Check for permanent quota exhaustion / daily tier limit issues (Do not retry - fail instantly to save time/requests)
          const isQuotaOrLimitError = err?.status === 429 || 
                                      errMsg.includes("429") || 
                                      errMsg.includes("RESOURCE_EXHAUSTED") || 
                                      errMsg.toUpperCase().includes("QUOTA EXCEEDED") || 
                                      errMsg.toUpperCase().includes("LIMIT EXCEEDED");

          if (isQuotaOrLimitError) {
            console.warn(`Model ${modelName} hit a permanent quota limit. Throwing immediately to use fallbacks...`);
            throw err;
          }

          const isTemporaryError = err?.status === 503 || 
                                   errMsg.includes("503") || 
                                   errMsg.includes("demand") ||
                                   errMsg.includes("UNAVAILABLE");

          if (isTemporaryError && attempt <= retries) {
            console.warn(`Attempt ${attempt} for model ${modelName} encountered busy/resource limits. Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
            delay *= 2; // exponential backoff
            continue;
          }
          throw err;
        }
      }
    };

    const allModels = [
      "gemini-2.5-flash",
      "gemini-3.1-flash-lite",
      "gemini-3.5-flash",
      "gemini-flash-latest"
    ];

    // Filter out models that have been marked as exhausted/quota exceeded in this server session.
    // If all are marked, we reset or use the entire list as a last resort.
    const modelsToTry = allModels.filter(m => !exhaustedModels.has(m));
    const finalModelsToTry = modelsToTry.length > 0 ? modelsToTry : allModels;

    let response = null;
    let success = false;
    let lastError = null;

    for (const model of finalModelsToTry) {
      try {
        console.log(`Checking/calling AI assistant with model: ${model}`);
        response = await callModelWithRetry(model);
        success = true;
        break;
      } catch (err: any) {
        lastError = err;
        const errMsg = err?.message || "";

        const isQuotaOrLimitError = err?.status === 429 || 
                                    errMsg.includes("429") || 
                                    errMsg.includes("RESOURCE_EXHAUSTED") || 
                                    errMsg.toUpperCase().includes("QUOTA EXCEEDED") || 
                                    errMsg.toUpperCase().includes("LIMIT EXCEEDED");

        if (isQuotaOrLimitError) {
          console.warn(`[Quota Exceeded] Adding model ${model} to the session exhaustion list to bypass it for subsequent calls.`);
          exhaustedModels.add(model);
        }

        console.warn(`Model ${model} failed: ${err.message || err}. Moving to next fallback model...`);
      }
    }

    if (!success) {
      console.error("All fallback models failed. Last error:", lastError?.message || lastError);
      
      // Handle failure nicely with a friendly, high-quality, pre-defined response!
      const loweredMsg = message.toLowerCase();
      let fallbackReply = "Our AI Assistant is currently experiencing extremely high demand, but we are absolutely active and ready to help you directly!";
      
      if (loweredMsg.includes("custom") || loweredMsg.includes("কাস্টম") || loweredMsg.includes("বানাতে") || loweredMsg.includes("hire") || loweredMsg.includes("তৈরি")) {
        fallbackReply += "\n\nTo build a **custom website** specifically tailored to your needs, please contact us directly on WhatsApp at **01822963824** or call us at **01329885689**. We are located in Kaptai, Rangamati, Bangladesh, and we will build it for you with clean code and super-fast delivery!";
      } else if (loweredMsg.includes("template") || loweredMsg.includes("বাই") || loweredMsg.includes("buy") || loweredMsg.includes("পেমেন্ট") || loweredMsg.includes("payment")) {
        fallbackReply += "\n\nTo buy a **ready-made template** or complete your order, simply add your templates to the cart and click checkout! We accept bKash, Nagad, Upay, Bank accounts, and Debit/Credit Cards. If you need any assistance, please call us directly at **01329885689**.";
      } else {
        fallbackReply += "\n\nFor instant and direct human support:\n- **WhatsApp:** 01822-963824\n- **Direct Call:** 01329-885689\n- **Email:** orjodas@gmail.com\n- **Address:** Kaptai, Rangamati, Bangladesh\n\nFeel free to call us anytime. We're happy to guide you!";
      }
      
      return res.json({ reply: fallbackReply });
    }

    res.json({ reply: response?.text || "" });
  } catch (error: any) {
    console.error("AI Assistant Route Outer Error:", error);
    res.status(500).json({ error: error.message || "Failed to process chat requests" });
  }
});

// Vite Middleware for Dev
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch(err => {
  console.error("🔥 Server Failed to Start:");
  console.error(err);
  process.exit(1);
});
