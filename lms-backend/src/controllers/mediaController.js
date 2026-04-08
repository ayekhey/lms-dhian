const prisma = require('../prismaClient');
const path = require('path');
const fs = require('fs');

// GET /api/media - List all media items
const getMedia = async (req, res) => {
  try {
    const media = await prisma.mediaItem.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(media);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/media - Upload QR code image (teacher only)
const uploadMedia = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/static/${req.file.filename}`;

    const media = await prisma.mediaItem.create({
      data: {
        label: req.body.label || null,
        imageUrl,
        teacherId: req.user.userId
      }
    });

    res.status(201).json(media);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/media/:id - Delete media item (teacher only)
const deleteMedia = async (req, res) => {
  try {
    const media = await prisma.mediaItem.findUnique({
      where: { id: req.params.id }
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete file from disk
    const filePath = path.join('src/uploads', path.basename(media.imageUrl));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await prisma.mediaItem.delete({ where: { id: req.params.id } });

    res.json({ message: 'Media deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getMedia, uploadMedia, deleteMedia };