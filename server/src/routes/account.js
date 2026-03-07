import express from 'express';
import { prisma } from '../lib/auth.js';
import { requireAuth } from './utils.js';

const router = express.Router();

const userSelection = {
  id: true,
  name: true,
  email: true,
  image: true,
  emailVerified: true,
  createdAt: true,
  updatedAt: true,
};

const formatApiError = (fallbackMessage) => (error) => {
  if (error?.code === 'P2025') {
    return {
      status: 404,
      payload: { error: 'User not found' },
    };
  }

  return {
    status: 500,
    payload: { error: fallbackMessage },
  };
};

router.get('/me', requireAuth, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: userSelection,
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json({ user });
  } catch (error) {
    const { status, payload } = formatApiError(
      'Failed to load account profile'
    )(error);
    return res.status(status).json(payload);
  }
});

router.patch('/me', requireAuth, async (req, res) => {
  const { name } = req.body || {};

  if (name === undefined) {
    return res.status(400).json({ error: 'Nothing to update' });
  }

  if (typeof name !== 'string') {
    return res.status(400).json({ error: 'Name must be a string' });
  }

  const trimmedName = name.trim();
  if (!trimmedName) {
    return res.status(400).json({ error: 'Name is required' });
  }

  if (trimmedName.length > 120) {
    return res.status(400).json({ error: 'Name must be 120 characters or less' });
  }

  try {
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name: trimmedName },
      select: userSelection,
    });

    return res.json({ user });
  } catch (error) {
    const { status, payload } = formatApiError('Failed to update account')(
      error
    );
    return res.status(status).json(payload);
  }
});

router.delete('/me', requireAuth, async (req, res) => {
  const { confirmation } = req.body || {};

  if (confirmation !== 'DELETE') {
    return res
      .status(400)
      .json({ error: 'Confirmation must be exactly DELETE' });
  }

  try {
    await prisma.user.delete({
      where: { id: req.user.id },
    });
    return res.status(204).send();
  } catch (error) {
    const { status, payload } = formatApiError('Failed to delete account')(
      error
    );
    return res.status(status).json(payload);
  }
});

export default router;
