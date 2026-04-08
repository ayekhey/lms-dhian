const prisma = require('../prismaClient');
const bcrypt = require('bcryptjs');

// GET /api/users/students - list all students
const getStudents = async (req, res) => {
  try {
    const students = await prisma.user.findMany({
      where: { role: 'STUDENT' },
      select: {
        id: true,
        name: true,
        email: true,
        tier: true,
        diagnosticDone: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/users/students - create student account
const createStudent = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const student = await prisma.user.create({
      data: { name, email, passwordHash, role: 'STUDENT' },
      select: { id: true, name: true, email: true, createdAt: true }
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/students/:id/reset-password - reset student password
const resetPassword = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return res.status(400).json({ message: 'New password is required' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: req.params.id },
      data: { passwordHash }
    });

    res.json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// PUT /api/users/students/:id/reset-diagnostic - reset student diagnostic
const resetDiagnostic = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.params.id },
      data: { tier: null, diagnosticDone: false }
    });

    res.json({ message: 'Diagnostic reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// DELETE /api/users/students/:id - delete student account
const deleteStudent = async (req, res) => {
  try {
    // Delete related records first
    await prisma.exerciseResult.deleteMany({ where: { studentId: req.params.id } });

    await prisma.user.delete({ where: { id: req.params.id } });

    res.json({ message: 'Student deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStudents,
  createStudent,
  resetPassword,
  resetDiagnostic,
  deleteStudent
};