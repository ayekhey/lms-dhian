const prisma = require('../prismaClient');

const timerConfig = await prisma.systemConfig.findUnique({
  where: { key: 'post_test_timer_minutes' }
});

// GET /api/posttest/questions - get questions for post test (same as diagnostic)
const getQuestions = async (req, res) => {
  try {
    const questions = await prisma.diagnosticQuestion.findMany();

    // Get config
    const randomizeConfig = await prisma.systemConfig.findUnique({
      where: { key: 'post_test_randomize' }
    });
    const maxScoreConfig = await prisma.systemConfig.findUnique({
      where: { key: 'post_test_max_score' }
    });

    let result = questions.map(q => {
      // Parse options if they are JSON strings
      let options = q.options;
      let optionOrder = options.map((_, i) => i);

      // Randomize options if enabled
      if (randomizeConfig?.value === 'true') {
        optionOrder = optionOrder.sort(() => Math.random() - 0.5);
        options = optionOrder.map(i => options[i]);
      }

      return {
        id: q.id,
        questionText: q.questionText,
        options,
        originalOptionOrder: optionOrder,
      };
    });

    // Randomize question order if enabled
    if (randomizeConfig?.value === 'true') {
      result = result.sort(() => Math.random() - 0.5);
    }

    res.json({
  questions: result,
  maxScore: maxScoreConfig ? parseInt(maxScoreConfig.value) : null,
  timerMinutes: timerConfig ? parseInt(timerConfig.value) : null,
});
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/posttest/submit - student submits post test
const submitPostTest = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });

    if (user.postTestDone) {
      return res.status(400).json({ message: 'Post test already completed' });
    }

    const { answers, originalOptionOrders } = req.body;
    // answers = { questionId: selectedOptionIndex (in displayed order) }
    // originalOptionOrders = { questionId: [original indices in displayed order] }

    const questions = await prisma.diagnosticQuestion.findMany();

    const maxScoreConfig = await prisma.systemConfig.findUnique({
      where: { key: 'post_test_max_score' }
    });
    const maxScore = maxScoreConfig ? parseInt(maxScoreConfig.value) : questions.length;

    let correct = 0;
    questions.forEach(q => {
      const selectedDisplayIndex = answers[q.id];
      if (selectedDisplayIndex === undefined) return;

      const order = originalOptionOrders?.[q.id];
      let actualIndex = selectedDisplayIndex;

      // Map display index back to original index
      if (order && order.length > 0) {
        actualIndex = order[selectedDisplayIndex];
      }

      if (actualIndex === q.correctOption) correct++;
    });

    // Scale score to maxScore
    const score = questions.length > 0
      ? Math.round((correct / questions.length) * maxScore)
      : 0;

    const result = await prisma.postTestResult.create({
      data: {
        studentId: req.user.userId,
        score,
        maxScore,
      }
    });

    await prisma.user.update({
      where: { id: req.user.userId },
      data: { postTestDone: true }
    });

    res.json({ score, maxScore, correct, total: questions.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/posttest/status - check if student has done post test
const getStatus = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId }
    });
    res.json({ postTestDone: user.postTestDone });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/posttest/results - teacher views all post test results
const getResults = async (req, res) => {
  try {
    const results = await prisma.postTestResult.findMany({
      include: {
        student: { select: { name: true, email: true, tier: true } }
      },
      orderBy: { submittedAt: 'desc' }
    });
    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

const getMyResult = async (req, res) => {
  try {
    const result = await prisma.postTestResult.findFirst({
      where: { studentId: req.user.userId },
      orderBy: { submittedAt: 'desc' },
    });
    if (!result) return res.status(404).json({ message: 'No result found' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/posttest/config - get post test config
const getConfig = async (req, res) => {
  try {
    const [randomize, maxScore, timer] = await Promise.all([
      prisma.systemConfig.findUnique({ where: { key: 'post_test_randomize' } }),
      prisma.systemConfig.findUnique({ where: { key: 'post_test_max_score' } }),
      prisma.systemConfig.findUnique({ where: { key: 'post_test_timer_minutes' } }),
    ]);
    res.json({
      randomize: randomize?.value === 'true',
      maxScore: maxScore ? parseInt(maxScore.value) : null,
      timerMinutes: timer ? parseInt(timer.value) : null,
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/posttest/config - teacher updates post test config
const setConfig = async (req, res) => {
  try {
    const { randomize, maxScore, timerMinutes } = req.body;

    await Promise.all([
      prisma.systemConfig.upsert({
        where: { key: 'post_test_randomize' },
        update: { value: String(randomize) },
        create: { key: 'post_test_randomize', value: String(randomize) },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'post_test_max_score' },
        update: { value: maxScore ? String(maxScore) : '0' },
        create: { key: 'post_test_max_score', value: maxScore ? String(maxScore) : '0' },
      }),
      prisma.systemConfig.upsert({
        where: { key: 'post_test_timer_minutes' },
        update: { value: timerMinutes ? String(timerMinutes) : '0' },
        create: { key: 'post_test_timer_minutes', value: timerMinutes ? String(timerMinutes) : '0' },
      }),
    ]);

    res.json({ message: 'Config saved' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getQuestions, submitPostTest, getStatus, getResults, getConfig, setConfig };