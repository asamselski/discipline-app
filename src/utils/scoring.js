import { formatDateStr, parseLocalDate } from './date';

export const getLevelInfo = (points, ranks, maxLevel = 50) => {
  let level = 1;
  let pointsNeededForCurrentLevel = 60;
  let accumulatedPoints = 0;

  while (level < maxLevel) {
    if (points >= accumulatedPoints + pointsNeededForCurrentLevel) {
      accumulatedPoints += pointsNeededForCurrentLevel;
      level++;
      pointsNeededForCurrentLevel = Math.round(pointsNeededForCurrentLevel * 1.12);
    } else {
      break;
    }
  }

  const currentRank = [...ranks].reverse().find(rank => level >= rank.minLevel)?.name || ranks[0].name;
  return {
    level,
    name: currentRank,
    pointsInLevel: Math.max(0, points - accumulatedPoints),
    maxLevelPoints: pointsNeededForCurrentLevel,
  };
};

export const calculateTotalPoints = ({ tasks, workouts, goals, todayStr, hasStreakBonus }) => {
  const pointsByDate = new Map();
  const activeDates = new Set();
  const trackedDates = new Set([todayStr]);
  const addPointsForDate = (date, points) => {
    const safeDate = date || todayStr;
    trackedDates.add(safeDate);
    activeDates.add(safeDate);
    pointsByDate.set(safeDate, (pointsByDate.get(safeDate) || 0) + points);
  };

  tasks.forEach(task => {
    if (task.createdAt) trackedDates.add(task.createdAt);
    if (task.dueDate) trackedDates.add(task.dueDate);

    if (task.repeat && task.repeat !== 'once' && task.completedDates) {
      Object.entries(task.completedDates).forEach(([date, isDone]) => {
        if (!isDone) return;
        addPointsForDate(date, (task.pkt || 20) + (hasStreakBonus(task.id, date) ? 10 : 0));
      });
    } else if (task.isCompleted) {
      addPointsForDate(task.completedAt || task.dueDate || todayStr, task.pkt || 20);
    }
  });

  workouts.forEach(workout => {
    if (workout.date) trackedDates.add(workout.date);
    addPointsForDate(workout.date || todayStr, workout.pkt || 0);
  });

  goals.forEach(goal => {
    const isProgressType = ['read_book', 'read_chapters', 'study', 'no_sweets'].includes(goal.type);

    if (goal.isDaily) {
      const dailySums = {};
      workouts.forEach(workout => {
        if (isProgressType && workout.goalId === goal.id) {
          dailySums[workout.date] = (dailySums[workout.date] || 0) + workout.amount;
        } else if (!isProgressType && workout.type === goal.type) {
          dailySums[workout.date] = (dailySums[workout.date] || 0) + workout.amount;
        }
      });
      Object.entries(dailySums).forEach(([date, sum]) => {
        if (goal.target && sum >= goal.target) addPointsForDate(date, 30);
      });
      return;
    }

    const relevantWorkouts = workouts.filter(workout => isProgressType
      ? workout.goalId === goal.id
      : workout.type === goal.type);
    const currentSum = isProgressType
      ? (goal.currentPage || 0)
      : relevantWorkouts.reduce((sum, workout) => sum + workout.amount, 0);

    if (!goal.target || currentSum < goal.target) return;

    const relatedTaskDates = tasks
      .filter(task => task.goalId === goal.id)
      .flatMap(task => task.repeat && task.repeat !== 'once'
        ? Object.entries(task.completedDates || {}).filter(([, done]) => done).map(([date]) => date)
        : (task.isCompleted ? [task.completedAt || task.dueDate] : []));
    const completionDate = [...relevantWorkouts.map(workout => workout.date), ...relatedTaskDates]
      .filter(Boolean)
      .sort()
      .at(-1) || todayStr;
    addPointsForDate(completionDate, 30);
  });

  const startDateStr = [...trackedDates].filter(date => date && date <= todayStr).sort()[0] || todayStr;
  const currentDate = parseLocalDate(startDateStr);
  const endDate = parseLocalDate(todayStr);
  let totalPoints = 0;
  let consecutiveInactiveDays = 0;

  while (currentDate <= endDate) {
    const dateStr = formatDateStr(currentDate);
    if (activeDates.has(dateStr)) {
      consecutiveInactiveDays = 0;
      totalPoints += pointsByDate.get(dateStr) || 0;
    } else {
      consecutiveInactiveDays++;
      if (consecutiveInactiveDays > 1) {
        const penalty = 10 * Math.pow(2, consecutiveInactiveDays - 2);
        totalPoints = Math.max(0, totalPoints - penalty);
      }
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return Math.max(0, totalPoints);
};
