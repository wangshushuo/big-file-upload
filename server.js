const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const upload = multer({ dest: "uploads/" });

app.use(express.json());
app.use(express.static("public"));

app.post("/upload", upload.single("file"), (req, res) => {
  const { fileName, chunkIndex } = req.body;
  const chunkPath = path.join(
    __dirname,
    "uploads",
    `${fileName}-${chunkIndex}`
  );
  fs.renameSync(req.file.path, chunkPath);
  res.sendStatus(200);
});

app.post("/merge", (req, res) => {
  const { fileName, totalChunks } = req.body;
  const filePath = path.join(__dirname, "uploads", fileName);
  const writeStream = fs.createWriteStream(filePath);

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(__dirname, "uploads", `${fileName}-${i}`);
    const data = fs.readFileSync(chunkPath);
    writeStream.write(data);
    fs.unlinkSync(chunkPath);
  }

  writeStream.end();
  res.sendStatus(200);
});

app.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
});
