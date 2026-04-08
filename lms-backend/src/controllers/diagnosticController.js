const prisma = require('../prismaClient');

// GET /api/diagnostic/questions - for students (hides correct answer)
const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.diagnosticQuestion.findMany();

    const safeQuestions = questions.map(q => ({
      id: q.id,
      questionText: q.questionText,
      options: q.options
    }));

    res.json(safeQuestions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/diagnostic/manage - for teachers (shows correct answer)
const getQuestionsForTeacher = async (req, res) => {
  try {
    const questions = await prisma.diagnosticQuestion.findMany();
    res.json(questions);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/diagnostic/questions - teacher creates a question
const createQuestion = async (req, res) => {
  try {
    const { questionText, options, correctOption } = req.body;

    if (!questionText || !options || options.length < 2 || correctOption === undefined) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const question = await prisma.diagnosticQuestion.create({
      data: { questionText, options, correctOption }
    });

    res.status(201).json(question);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/diagnostic/questions/:id - teacher deletes a question
const deleteQuestion = async (req, res) => {
  try {
    await prisma.diagnosticQuestion.delete({
      where: { id: req.params.id }
    });
    res.json({ message: 'Question deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/diagnostic/submit - student submits answers
const submitDiagnostic = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (user.diagnosticDone) {
      return res.status(400).json({ message: 'Diagnostic already completed' });
    }

    const { answers } = req.body;
    const questions = await prisma.diagnosticQuestion.findMany();

    if (questions.length === 0) {
      return res.status(400).json({ message: 'No diagnostic questions available' });
    }

    let score = 0;
    questions.forEach(q => {
      if (answers[q.id] === q.correctOption) score++;
    });

    const percentage = (score / questions.length) * 100;
    let tier;
    if (percentage >= 75) tier = 1;
    else if (percentage >= 50) tier = 2;
    else tier = 3;

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { tier, diagnosticDone: true }
    });

    res.json({ tier, score, total: questions.length });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/diagnostic/config - get diagnostic timer
const getConfig = async (req, res) => {
  try {
    const config = await prisma.systemConfig.findUnique({
      where: { key: 'diagnostic_timer_minutes' }
    });
    res.json({ timerMinutes: config ? parseInt(config.value) : null });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/diagnostic/config - teacher sets diagnostic timer
const setConfig = async (req, res) => {
  try {
    const { timerMinutes } = req.body;

    await prisma.systemConfig.upsert({
      where: { key: 'diagnostic_timer_minutes' },
      update: { value: timerMinutes ? String(timerMinutes) : '0' },
      create: { key: 'diagnostic_timer_minutes', value: timerMinutes ? String(timerMinutes) : '0' }
    });

    res.json({ timerMinutes });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getQuestions,
  getQuestionsForTeacher,
  createQuestion,
  deleteQuestion,
  submitDiagnostic,
  getConfig,
  setConfig
};