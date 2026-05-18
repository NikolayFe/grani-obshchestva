process.env.PRISMA_CLIENT_ENGINE_TYPE = process.env.PRISMA_CLIENT_ENGINE_TYPE || 'library';

const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

let prismaClient;

function getPrismaClient() {
  if (!prismaClient) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prismaClient = new PrismaClient({ adapter });
  }
  return prismaClient;
}

function isValidUUID(str) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(str);
}

/**
 * GET /api/users/:userId
 * Профиль пользователя: имя, xpTotal, streakDays
 */
async function getUserProfile(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({ success: false, message: 'Некорректный userId' });
    }

    const prisma = getPrismaClient();
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, lastName: true, email: true, xpTotal: true, streakDays: true, livesCount: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'Пользователь не найден' });
    }

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Ошибка getUserProfile:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * GET /api/rating?period=week|allTime&userId=...
 * Лидерборд пользователей по XP
 */
async function getRating(req, res) {
  try {
    const { period = 'allTime', userId } = req.query;
    const prisma = getPrismaClient();

    let whereClause = {};
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      whereClause = { lastActivityDate: { gte: weekAgo } };
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: { id: true, name: true, lastName: true, xpTotal: true, streakDays: true },
      orderBy: { xpTotal: 'desc' },
      take: 20,
    });

    const leaderboard = users.map((u, idx) => ({
      id: u.id,
      place: idx + 1,
      name: u.lastName ? `${u.name} ${u.lastName.charAt(0)}.` : u.name,
      xp: u.xpTotal,
      streakDays: u.streakDays,
      isCurrentUser: userId ? u.id === userId : false,
    }));

    const summary =
      period === 'week'
        ? 'Смотри, кто набрал больше всего XP за эту неделю.'
        : 'Здесь собран общий рейтинг за всё время обучения.';

    return res.status(200).json({
      success: true,
      data: { period, summary, leaderboard },
    });
  } catch (error) {
    console.error('Ошибка getRating:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * POST /api/users/:userId/activity
 * Записать активность пользователя за сегодня
 */
async function recordActivity(req, res) {
  try {
    const { userId } = req.params;
    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({ success: false, message: 'Некорректный userId' });
    }

    const prisma = getPrismaClient();
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    await prisma.userActivityLog.upsert({
      where: { userId_date: { userId, date: today } },
      update: {},
      create: { userId, date: today },
    });

    // Обновить streak и lastActivityDate
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true, lastActivityDate: true },
    });

    if (user) {
      const lastDate = user.lastActivityDate ? new Date(user.lastActivityDate) : null;
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      let newStreak = user.streakDays;
      const lastDateStr = lastDate ? lastDate.toISOString().split('T')[0] : null;
      const todayStr = today.toISOString().split('T')[0];
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDateStr !== todayStr) {
        newStreak = lastDateStr === yesterdayStr ? user.streakDays + 1 : 1;
        await prisma.user.update({
          where: { id: userId },
          data: { streakDays: newStreak, lastActivityDate: today },
        });
      }
    }

    return res.status(200).json({ success: true });
  } catch (error) {
    console.error('Ошибка recordActivity:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

/**
 * GET /api/users/:userId/activity?period=week|month
 * Получить данные активности пользователя
 */
async function getActivity(req, res) {
  try {
    const { userId } = req.params;
    const { period = 'week' } = req.query;

    if (!userId || !isValidUUID(userId)) {
      return res.status(400).json({ success: false, message: 'Некорректный userId' });
    }

    const prisma = getPrismaClient();

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const daysBack = period === 'month' ? 29 : 6;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - daysBack);

    const logs = await prisma.userActivityLog.findMany({
      where: { userId, date: { gte: startDate, lte: today } },
      select: { date: true },
    });

    const activeDatesSet = new Set(logs.map((l) => l.date.toISOString().split('T')[0]));

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { streakDays: true },
    });
    const streak = user?.streakDays ?? 0;

    if (period === 'week') {
      const dayLabels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
      const days = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        const dow = (d.getUTCDay() + 6) % 7; // 0=Пн
        days.push({
          id: 7 - i,
          label: dayLabels[dow],
          active: activeDatesSet.has(dateStr),
          current: i === 0,
        });
      }
      const activeDays = days.filter((d) => d.active).length;
      return res.status(200).json({
        success: true,
        data: { mode: 'week', activeDays, totalDays: 7, streak, days },
      });
    }

    // month — разбить по неделям (последние 4)
    const weeks = [];
    for (let w = 3; w >= 0; w--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - w * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekEnd.getDate() - 6);

      const weekDays = [];
      for (let d = 0; d < 7; d++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + d);
        weekDays.push(activeDatesSet.has(day.toISOString().split('T')[0]));
      }

      const fmt = (dt) =>
        dt.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }).replace('.', '');
      weeks.push({ weekLabel: `${fmt(weekStart)} – ${fmt(weekEnd)}`, days: weekDays });
    }

    const activeDays = [...activeDatesSet].length;
    return res.status(200).json({
      success: true,
      data: { mode: 'month', activeDays, totalDays: 30, streak, weeks },
    });
  } catch (error) {
    console.error('Ошибка getActivity:', error);
    return res.status(500).json({ success: false, message: 'Внутренняя ошибка сервера' });
  }
}

module.exports = { getUserProfile, getRating, recordActivity, getActivity };
