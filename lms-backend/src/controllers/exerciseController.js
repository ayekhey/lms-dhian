const prisma = require('../prismaClient');
const { Parser } = require('json2csv');

// GET /api/exercises - List exercises
const getExercises = async (req, res) => {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: { createdAt: 'desc' }
    });
    res.json(exercises);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/exercises/:id - Get single exercise
const getExercise = async (req, res) => {
  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id }
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    res.json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/exercises - Create exercise (teacher only)
const createExercise = async (req, res) => {
  try {
    const { title, timerMinutes, questions } = req.body;

    const exercise = await prisma.exercise.create({
      data: {
        title,
        timerMinutes: timerMinutes || null,
        questions,
        teacherId: req.user.userId
      }
    });

    res.status(201).json(exercise);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/exercises/:id/submit - Student submits exercise
const submitExercise = async (req, res) => {
  try {
    const { answers } = req.body;

    const exercise = await prisma.exercise.findUnique({
      where: { id: req.params.id }
    });

    if (!exercise) {
      return res.status(404).json({ message: 'Exercise not found' });
    }

    // Calculate score
    const questions = exercise.questions;
    let score = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctOption) score++;
    });

    const result = await prisma.exerciseResult.create({
      data: {
        exerciseId: req.params.id,
        studentId: req.user.userId,
        score
      }
    });

    res.json({ score, total: questions.length, result });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/exercises/:id/results - Teacher views results
const getResults = async (req, res) => {
  try {
    const results = await prisma.exerciseResult.findMany({
      where: { exerciseId: req.params.id },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'desc' }
    });

    res.json(results);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// GET /api/exercises/:id/results/export - Teacher downloads CSV
const exportResults = async (req, res) => {
  try {
    const results = await prisma.exerciseResult.findMany({
      where: { exerciseId: req.params.id },
      include: { student: { select: { name: true, email: true } } },
      orderBy: { submittedAt: 'desc' }
    });

    const data = results.map(r => ({
      studentName: r.student.name,
      email: r.student.email,
      score: r.score,
      submittedAt: r.submittedAt
    }));

    const parser = new Parser();
    const csv = parser.parse(data);

    res.header('Content-Type', 'text/csv');
    res.attachment('results.csv');
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getExercises,
  getExercise,
  createExercise,
  submitExercise,
  getResults,
  exportResults
};