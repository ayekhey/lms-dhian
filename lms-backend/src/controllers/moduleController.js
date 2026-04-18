const prisma = require('../prismaClient');

// GET /api/modules - List all modules
const getModules = async (req, res) => {
  try {
    const modules = await prisma.module.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(modules);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/modules/:id/pages - Get pages filtered by student tier
const getModulePages = async (req, res) => {
  try {
    const pages = await prisma.modulePage.findMany({
      where: { moduleId: req.params.id },
      orderBy: { pageNumber: 'asc' },
      include: { miniQuiz: true }
    });

    const tier = req.user.tier || 1;

    const filtered = pages.map(page => ({
      id: page.id,
      pageNumber: page.pageNumber,
      content: page.content,
      extendContent: tier >= 2 ? page.extendContent : null,
      helpContent: tier >= 3 ? page.helpContent : null,
      miniQuiz: page.miniQuiz
    }));

    res.json(filtered);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/modules - Create module (teacher only)
const createModule = async (req, res) => {
  try {
    const { title, description } = req.body;

    const module = await prisma.module.create({
      data: {
        title,
        description,
        teacherId: req.user.userId
      }
    });

    res.status(201).json(module);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/modules/:id - Update module (teacher only)
// const updateModule = async (req, res) => {
//   try {
//     const { title, description } = req.body;

//     const module = await prisma.module.update({
//       where: { id: req.params.id },
//       data: { title, description }
//     });

//     res.json(module);
//   } catch (error) {
//     res.status(500).json({ message: 'Server error' });
//   }
// };

// DELETE /api/modules/:id - Delete module (teacher only)
const deleteModule = async (req, res) => {
  try {
    await prisma.module.delete({
      where: { id: req.params.id }
    });

    res.json({ message: 'Module deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/modules/:id/pages - Add page to module (teacher only)
const addPage = async (req, res) => {
  try {
    const { pageNumber, content, extendContent, helpContent, blocks } = req.body;
    const page = await prisma.modulePage.create({
      data: {
        moduleId: req.params.id,
        pageNumber,
        content: content || '',
        extendContent,
        helpContent,
        blocks: blocks || undefined,
      }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/modules/:id/pages/:pageId - Update page (teacher only)
const updatePage = async (req, res) => {
  try {
    const { content, extendContent, helpContent, blocks } = req.body;
    const page = await prisma.modulePage.update({
      where: { id: req.params.pageId },
      data: { content, extendContent, helpContent, blocks: blocks || undefined }
    });
    res.json(page);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

const deletePage = async (req, res) => {
  try {
    await prisma.modulePage.delete({
      where: { id: req.params.pageId }
    });
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getModules,
  getModulePages,
  createModule,
  updateModule,
  deleteModule,
  addPage,
  updatePage,
  deletePage,
};