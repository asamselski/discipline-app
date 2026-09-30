export const parseLocalDate = (dateStr) => {
  if (!dateStr) return new Date();
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
};

export const formatDateStr = (dateObj) => {
  const year = dateObj.getFullYear();
  const month = String(dateObj.getMonth() + 1).padStart(2, '0');
  const day = String(dateObj.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const getAppDayString = (customResetTime) => {
  const resetTime = customResetTime !== undefined
    ? customResetTime
    : (localStorage.getItem('discipline_reset_time') || '00:00');
  const now = new Date();
  const [resetHour, resetMinute] = resetTime.split(':').map(Number);
  const appDate = new Date(now);

  if (now.getHours() < resetHour || (now.getHours() === resetHour && now.getMinutes() < resetMinute)) {
    appDate.setDate(appDate.getDate() - 1);
  }

  return formatDateStr(appDate);
};

export const taskAppliesToDate = (task, targetDateStr) => {
  if (targetDateStr < task.createdAt) return false;
  if (!task.repeat || task.repeat === 'once') {
    return task.dueDate === targetDateStr || (!task.isCompleted && task.dueDate < targetDateStr);
  }
  if (task.repeat === 'daily') return true;
  if (task.repeat === 'custom') return task.customDates && task.customDates.includes(targetDateStr);
  if (task.repeat === 'interval') {
    const start = parseLocalDate(task.createdAt);
    const target = parseLocalDate(targetDateStr);
    start.setHours(0, 0, 0, 0);
    target.setHours(0, 0, 0, 0);
    const differenceInDays = Math.floor(Math.abs(target - start) / (1000 * 60 * 60 * 24));
    return differenceInDays % (task.intervalDays || 2) === 0;
  }
  return false;
};

export const isTaskDoneForDate = (task, dateStr) => {
  if (!task.repeat || task.repeat === 'once') return Boolean(task.isCompleted);
  return Boolean(task.completedDates && task.completedDates[dateStr]);
};
