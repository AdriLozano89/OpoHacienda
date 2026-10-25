import { useState, useEffect } from 'react';

export function usePomodoro(activeTopicId: string, activeTopicTitle: string) {
  const DEFAULT_FOCUS_TIME = 25 * 60; // 25 minutes
  const DEFAULT_BREAK_TIME = 5 * 60;  // 5 minutes

  const [sessionSeconds, setSessionSeconds] = useState<number>(DEFAULT_FOCUS_TIME);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [sessionType, setSessionType] = useState<'focus' | 'break'>('focus');

  // Cumulative study time per topic (topicId -> total seconds studied)
  const [topicStudyTimes, setTopicStudyTimes] = useState<Record<string, { title: string; seconds: number }>>(() => {
    try {
      const saved = localStorage.getItem('opohacienda_study_times');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });

  // Persist study times
  useEffect(() => {
    try {
      localStorage.setItem('opohacienda_study_times', JSON.stringify(topicStudyTimes));
    } catch {}
  }, [topicStudyTimes]);

  useEffect(() => {
    let interval: any = null;
    if (isRunning) {
      interval = setInterval(() => {
        setSessionSeconds((prev) => {
          if (prev <= 1) {
            // Switch session type
            const nextType = sessionType === 'focus' ? 'break' : 'focus';
            setSessionType(nextType);
            setIsRunning(false);
            return nextType === 'focus' ? DEFAULT_FOCUS_TIME : DEFAULT_BREAK_TIME;
          }
          return prev - 1;
        });

        // If in focus mode, accumulate seconds for current topic
        if (sessionType === 'focus' && activeTopicId) {
          setTopicStudyTimes((prev) => {
            const current = prev[activeTopicId] || { title: activeTopicTitle, seconds: 0 };
            return {
              ...prev,
              [activeTopicId]: {
                title: activeTopicTitle,
                seconds: current.seconds + 1,
              },
            };
          });
        }
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, sessionType, activeTopicId, activeTopicTitle]);

  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = (newDurationMinutes?: number) => {
    setIsRunning(false);
    const mins = newDurationMinutes || (sessionType === 'focus' ? 25 : 5);
    setSessionSeconds(mins * 60);
  };

  const setFocusDuration = (minutes: number) => {
    setIsRunning(false);
    setSessionType('focus');
    setSessionSeconds(minutes * 60);
  };

  const totalStudiedMinutes = Math.round(
    Object.values(topicStudyTimes).reduce((acc, curr) => acc + curr.seconds, 0) / 60
  );

  return {
    sessionSeconds,
    isRunning,
    sessionType,
    toggleTimer,
    resetTimer,
    setFocusDuration,
    topicStudyTimes,
    totalStudiedMinutes,
  };
}
