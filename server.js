import express from "express";
import helmet from "helmet";
import cors from "cors";
import morgan from "morgan";
import multer from "multer";
import { createHelia } from "helia";
import { unixfs } from "@helia/unixfs";
import { createLibp2p } from "libp2p";
import { webSockets } from "@libp2p/websockets";
import { noise } from "@libp2p/noise";
import { mplex } from "@libp2p/mplex";
import { FsBlockstore } from "blockstore-fs";
import { fileTypeFromBuffer } from "file-type";
import { dirname, join } from "path";
import { fileURLToPath } from "url";
import { CID } from "multiformats/cid";
import logger from "./logger.js";

// Setup __dirname for ESM
const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const port = 5001;
const upload = multer();

// Stats
let totalRequests = 0;
let totalCIDsStored = 0;
const recentCIDs = [];
const MAX_RECENT = 10;

// Middleware
app.use(helmet());
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:3000" }));
app.use(
  morgan("combined", {
    stream: {
      write: (msg) => logger.info(msg.trim()),
    },
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use((req, res, next) => {
  totalRequests++;
  next();
});

// IPFS Setup
const blockstorePath = join(__dirname, "ipfs-blockstore");
logger.info(`Initializing blockstore at: ${blockstorePath}`);
const blockstore = new FsBlockstore(blockstorePath);

logger.info("Creating libp2p node...");
const libp2p = await createLibp2p({
  transports: [webSockets()],
  connectionEncryption: [noise()],
  streamMuxers: [mplex()],
});
logger.info("libp2p initialized");

logger.info("Creating Helia node...");
const helia = await createHelia({ libp2p, blockstore });
const fs = unixfs(helia);
logger.info("Helia node ready");

// Utils
function trackCID(cid) {
  if (!cid || typeof cid.toString !== "function") {
    logger.warn("Invalid CID passed to tracker:", cid);
    return;
  }
  const str = cid.toString();
  totalCIDsStored++;
  recentCIDs.unshift(str);
  if (recentCIDs.length > MAX_RECENT) recentCIDs.pop();
}

// Routes

// 📝 Text
app.post("/add/text", express.text({ type: "text/*" }), async (req, res) => {
  try {
    const buffer = Buffer.from(req.body, "utf-8");
    const cid = await fs.addBytes(buffer);
    trackCID(cid);
    logger.info(`Text stored → CID: ${cid}`);
    res.json({ cid: cid.toString() });
  } catch (err) {
    logger.error("Error adding text", err);
    res.status(500).json({ error: "Failed to add text" });
  }
});

// 📄 File
app.post("/add/file", upload.single("file"), async (req, res) => {
  if (!req.file) {
    logger.warn("No file uploaded");
    return res.status(400).json({ error: "No file uploaded" });
  }
  try {
    const cid = await fs.addBytes(req.file.buffer);
    trackCID(cid);
    logger.info(`File uploaded: ${req.file.originalname} → CID: ${cid}`);
    res.json({ cid: cid.toString() });
  } catch (err) {
    logger.error("Error adding file", err);
    res.status(500).json({ error: "Failed to add file" });
  }
});

// 🧾 JSON
app.post("/add/json", async (req, res) => {
  try {
    const buffer = Buffer.from(JSON.stringify(req.body), "utf-8");
    const cid = await fs.addBytes(buffer);
    trackCID(cid);
    logger.info(`JSON added → CID: ${cid}`);
    res.json({ cid: cid.toString() });
  } catch (err) {
    logger.error("Error adding JSON", err);
    res.status(500).json({ error: "Failed to add JSON" });
  }
});

// 🧱 Raw
app.post(
  "/add/raw",
  express.raw({ type: "*/*", limit: "50mb" }),
  async (req, res) => {
    if (!req.body || req.body.length === 0) {
      logger.warn("Empty body in raw upload");
      return res.status(400).json({ error: "Empty body" });
    }
    try {
      const cid = await fs.addBytes(req.body);
      trackCID(cid);
      logger.info(`Raw data added → CID: ${cid}`);
      res.json({ cid: cid.toString() });
    } catch (err) {
      logger.error("Error adding raw data", err);
      res.status(500).json({ error: "Failed to add raw data" });
    }
  }
);

// 📤 Retrieve
app.get("/cat/:cid", async (req, res) => {
  try {
    const cid = CID.parse(req.params.cid.toLowerCase());
    const chunks = [];
    for await (const chunk of fs.cat(cid)) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);
    const type = await fileTypeFromBuffer(buffer);

    res.setHeader("Content-Type", type?.mime || "application/octet-stream");
    logger.info(`CID fetched: ${cid} (${type?.mime || "binary"})`);
    res.send(buffer);
  } catch (err) {
    logger.error("Error retrieving file", err);
    res.status(404).json({ error: "Invalid or not found CID" });
  }
});

// 📊 Status
app.get("/status", (req, res) => {
  try {
    const mem = process.memoryUsage();
    const info = {
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      totalRequests,
      totalCIDsStored,
      recentCIDs: recentCIDs.slice(), // clone
      memoryUsage: {
        rss: `${Math.round(mem.rss / 1024 / 1024)} MB`,
        heapUsed: `${Math.round(mem.heapUsed / 1024 / 1024)} MB`,
        heapTotal: `${Math.round(mem.heapTotal / 1024 / 1024)} MB`,
      },
    };
    logger.info("Health check", info);
    res.json(info);
  } catch (err) {
    logger.error("Status check failed", err);
    res.status(500).json({ error: "Failed to fetch status" });
  }
});

// 🧯 Shutdown
process.on("SIGINT", async () => {
  logger.warn("SIGINT: Shutting down...");
  await helia.stop();
  logger.info("Helia stopped cleanly");
  process.exit(0);
});

// ❌ Catch unhandled errors
app.use((err, req, res, next) => {
  logger.error("Unhandled error", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(port, () => {
  logger.info(`🚀 Helia IPFS node running at http://localhost:${port}`);
});
