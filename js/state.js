/**
 * JAMB Quiz - Application State & Configuration
 * Central state management for the entire app
 */

const JAMB_STATE = (function() {
  'use strict';

  // ============================================
  // CONFIGURATION
  // ============================================
  const CONFIG = {
    POINTS: {
      UNLOCK_BONUS: 15,
      TG_CHANNEL_BONUS: 15,
      WAEC_CHANNEL_BONUS: 10,
      JAMB_TUTORIAL_BONUS: 10,
      FACEBOOK_BONUS: 5,
      SHARE_REWARD: 10,
      REFERRAL_REWARD: 10,
      QUIZ_COST: 5,
      CORRECT_BONUS: 10,
      WRONG_PENALTY: -5,
      ATTEND_ALL_BONUS: 20,
      PERFECT_BONUS: 50,
      DAILY_TOPUP: 10,
      MIN_TO_TOPUP: 5
    },
    QUIZ: {
      LENGTH: 20,
      TIME: 25 * 60, // 25 minutes in seconds
      MAX_SUBJECTS: 4
    }
  };

  // ============================================
  // STATE
  // ============================================
  const state = {
    // Auth & Unlock
    userId: null,
    unlocked: false,
    
    // Points
    points: 0,
    earned: 0,
    spent: 0,
    
    // Referrals
    referralCount: 0,
    referralUsed: null,
    newbieBonusClaimed: false,
    
    // Question Bank
    questionBank: null,
    subjectsLoaded: false,
    
    // Subject Selection
    showMoreSubjects: false,
    selectedSubjects: new Set(),
    
    // Quiz
    currentQuiz: null, // { questions, index, answers, timeLeft, timer }
    
    // Daily
    lastTopUpTime: null
  };

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    // Config
    getConfig: () => CONFIG,
    
    // User
    getUserId: () => state.userId,
    setUserId: (id) => { state.userId = id; },
    
    // Unlock
    isUnlocked: () => state.unlocked,
    setUnlocked: (val) => { state.unlocked = val; },
    
    // Points
    getPoints: () => state.points,
    setPoints: (val) => { 
      state.points = Math.max(0, val);
      localStorage.setItem('jamb_points', String(state.points));
    },
    getEarned: () => state.earned,
    getSpent: () => state.spent,
    
    // Referrals
    getReferralCount: () => state.referralCount,
    setReferralCount: (count) => { state.referralCount = count; },
    getReferralUsed: () => state.referralUsed,
    setReferralUsed: (ref) => { state.referralUsed = ref; },
    isNewbieBonusClaimed: () => state.newbieBonusClaimed,
    setNewbieBonusClaimed: (val) => { state.newbieBonusClaimed = val; },
    
    // Questions
    getQuestionBank: () => state.questionBank,
    setQuestionBank: (bank) => { state.questionBank = bank; },
    isSubjectsLoaded: () => state.subjectsLoaded,
    setSubjectsLoaded: (val) => { state.subjectsLoaded = val; },
    
    // Subjects
    getShowMoreSubjects: () => state.showMoreSubjects,
    setShowMoreSubjects: (val) => { state.showMoreSubjects = val; },
    getSelectedSubjects: () => Array.from(state.selectedSubjects),
    setSelectedSubjects: (set) => { state.selectedSubjects = set; },
    addSelectedSubject: (key) => state.selectedSubjects.add(key),
    removeSelectedSubject: (key) => state.selectedSubjects.delete(key),
    clearSelectedSubjects: () => state.selectedSubjects.clear(),
    getSelectedSubjectCount: () => state.selectedSubjects.size,
    
    // Quiz
    getCurrentQuiz: () => state.currentQuiz,
    setCurrentQuiz: (quiz) => { state.currentQuiz = quiz; },
    clearCurrentQuiz: () => { state.currentQuiz = null; },
    
    // Daily
    getLastTopUpTime: () => state.lastTopUpTime,
    setLastTopUpTime: (time) => { state.lastTopUpTime = time; }
  };
})();