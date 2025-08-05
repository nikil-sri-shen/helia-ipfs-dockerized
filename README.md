# 🚀 Helia IPFS Microservice (Dockerized)

A plug-and-play microservice to upload and retrieve files using [Helia](https://github.com/ipfs/helia), the modern JavaScript implementation of IPFS. This service exposes simple REST APIs to interact with IPFS and is fully containerized using Docker.

> 🎓 Built for ease of use by students, developers, and teams working on decentralized file storage without needing to write Helia or IPFS code.

---

## 📦 Features

- ✅ Upload text, JSON, raw binary, files.
- ✅ Retrieve files via CID (Content Identifier)
- ✅ Exposed APIs via REST (on `port 5001`)
- ✅ Dockerized for ease of setup
- ✅ Volume support for persistent storage
- ✅ Designed for frontend/backend integration

---

## 🐳 Docker Usage

### Pull the Image
```bash
docker pull nikilsrishen/helia-ipfs:latest
```

### Run the Container
```bash
docker run -d \
  -p 5001:5001 \
  -v helia_data:/app/ipfs-blockstore \
  --name helia-ipfs \
  --restart unless-stopped \
  nikilsrishen/helia-ipfs:latest
```

---

## 📁 API Documentation

### 🔹 POST `/add/text`

Upload plain text to IPFS.

**Request:**

- Method: `POST`
- URL: `http://localhost:5001/add/text`
- Content-Type: `text/plain`
- Body: `Plain` text string

**Example using `curl`:**

```bash
curl --request POST \\
  --url http://localhost:5001/add/text \\
  --header 'content-type: text/plain' \\
  --data '"helia-ipfs-dockerized"'
```

**Reponse:**
```bash
{
  "cid": "bafkreie3dwhsgceybailzout6xfqkszs2ie554remxoystmaayi3rhqs74"
}
```

### 🔹 POST `/add/json`

Upload JSON data to IPFS.

**Request:**

- Method: `POST`
- URL: `http://localhost:5001/add/json`
- Content-Type: `application/json`
- Body: Valid JSON

**Example using `curl`:**

```bash
curl --request POST \\
  --url http://localhost:5001/add/json \\
  --header 'content-type: application/json' \\
  --data '{
    "name": "helia-ipfs-dockerized"
}'
```

**Reponse:**
```bash
{
  "cid": "bafkreidai7ewznu4fnftxgokroawv7ldonx7c4dmpmzj34foswuufyrleu"
}
```

### 🔹 POST `/add/raw`

Upload a raw binary file to IPFS.

**Request:**

- Method: `POST`
- URL: `http://localhost:5001/add/raw`
- Content-Type: `application/octet-stream`
- Body: Binary file content

**Example using `curl`:**

```bash
curl --request POST \\
  --url http://localhost:5001/add/raw \\
  --header 'content-type: application/octet-stream' \\
  --data-binary "@/path/to/file.svg"
```

**Reponse:**
```bash
{
  "cid": "bafkreihnypq5kyk7jtjp6oejwmoh6w2ycklgyqn26lth4mxnru6trjmgoe"
}
```

### 🔹 POST `/add/file`

Upload a file using `multipart/form-data`

**Request:**

- Method: `POST`
- URL: `http://localhost:5001/add/file`
- Content-Type: `multipart/form-data`
- Body: `file` field with file to upload

**Example using `curl`:**

```bash
curl --request POST \\
  --url http://localhost:5001/add/file \\
  --header 'content-type: multipart/form-data' \\
  --form file=@/path/to/file.png
```

**Reponse:**
```bash
{
  "cid": "bafkreiamsbo5wxzrzwsnb6mgo3lofmuz63kmlb43nkfvflstfkeavi4qey"
}
```

### 🔹 GET `/cat/:cid`

Retrieve content from IPFS using its CID.

**Request:**

- Method: `GET`
- URL: `http://localhost:5001/cat/:cid`

**Example using `curl`:**

```bash
curl --request GET \\
  --url http://localhost:5001/cat/bafkreie3dwhsgceybailzout6xfqkszs2ie554remxoystmaayi3rhqs74
```

**Reponse:**
```bash
Returns raw file or data based on CID (content-type varies)
```

### 🔹 GET `/status`

Check if the API service is running.

**Request:**

- Method: `GET`
- URL: `http://localhost:5001/status`

**Example using `curl`:**

```bash
curl --request GET \\
  --url http://localhost:5001/status
```

**Reponse:**
```bash
{
  "status": "ok",
  "timestamp": "2025-08-05T16:10:23.360Z",
  "uptime": 36.265331975,
  "totalRequests": 7,
  "totalCIDsStored": 4,
  "recentCIDs": [
    "bafkreie3dwhsgceybailzout6xfqkszs2ie554remxoystmaayi3rhqs74",
    "bafkreidai7ewznu4fnftxgokroawv7ldonx7c4dmpmzj34foswuufyrleu",
    "bafkreihnypq5kyk7jtjp6oejwmoh6w2ycklgyqn26lth4mxnru6trjmgoe",
    "bafkreiamsbo5wxzrzwsnb6mgo3lofmuz63kmlb43nkfvflstfkeavi4qey"
  ],
  "memoryUsage": {
    "rss": "125 MB",
    "heapUsed": "44 MB",
    "heapTotal": "46 MB"
  }
}
```

---

## ✅ Use Cases

- 🚀 Quick IPFS integration for frontend/backends.
- 🧪 Prototyping dApps or decentralized storage workflows.
- 🏫 Educational tool for learning about IPFS and content addressing.
- 🧱 Backend service for apps storing images, documents, or user-generated content.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome!

- Fork the repository
- Create your feature branch (`git checkout -b feature/feature-name`)
- Commit your changes (`git commit -m 'Add feature'`)
- Push to the branch (`git push origin feature/feature-name`)
- Open a Pull Request 🚀

---

## 📜 License

This project is licensed under the `MIT License`. See the [LICENSE](https://github.com/nikil-sri-shen/helia-ipfs-dockerized/blob/main/LICENSE) file for details.

---

## 🙌 Credits

Built by [Nikil Sri Shen](https://github.com/nikil-sri-shen/) as a solution to simplify IPFS file storage using Helia for students, developers, and educators.

---

## 🌐 Contact

For help or questions, please create an issue on the [GitHub repository](https://github.com/nikil-sri-shen/helia-ipfs-dockerized).
