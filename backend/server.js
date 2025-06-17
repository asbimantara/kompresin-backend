import express from 'express';
import multer from 'multer';
import sharp from 'sharp';
import cors from 'cors';

const app = express();
const upload = multer();
const PORT = process.env.PORT || 8080;

app.use(cors());

// Endpoint kompresi gambar
app.post('/compress', upload.single('image'), async (req, res) => {
  try {
    const { quality } = req.body;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const inputBuffer = req.file.buffer;
    const fileType = req.file.mimetype;
    let outputBuffer;

    // Kompresi hanya untuk JPEG/JPG/PNG
    if (fileType === 'image/jpeg' || fileType === 'image/jpg') {
      outputBuffer = await sharp(inputBuffer)
        .jpeg({ quality: Math.round(Number(quality) * 100) })
        .toBuffer();
    } else if (fileType === 'image/png') {
      outputBuffer = await sharp(inputBuffer)
        .png({ quality: Math.round(Number(quality) * 100), compressionLevel: 9 })
        .toBuffer();
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    res.set({
      'Content-Type': fileType,
      'Content-Disposition': `attachment; filename=compressed_${req.file.originalname}`
    });
    res.send(outputBuffer);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Compression failed' });
  }
});

app.get('/', (req, res) => {
  res.send('Kompresin Backend is running!');
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 