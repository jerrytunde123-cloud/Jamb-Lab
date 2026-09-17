/**
 * JAMB Quiz - Application State & Configuration
 */

const JAMB_STATE = (function() {
  'use strict';

  const CONFIG = {
    POINTS: {
      UNLOCK_BONUS: 15,
      TG_CHANNEL_BONUS: 15,
      WAEC_CHANNEL_BONUS: 10,
      JAMB_TUTORIAL_BONUS: 10,
      JAMB_VIP_BONUS: 15,
      FACEBOOK_BONUS: 5,
      SHARE_REWARD: 10,
      REFERRAL_REWARD: 10,
      QUIZ_COST: 5,
      CORRECT_BONUS: 10,
      WRONG_PENALTY: -5,
      ATTEND_ALL_BONUS: 20,
      PERFECT_BONUS: 50,
      DAILY_TOPUP: 10,
      MIN_TO_TOPUP: 5,
      PURCHASE_BONUS_PERCENT: 10
    },
    QUIZ: {
      LENGTH: 20,
      TIME: 25 * 60,
      MAX_SUBJECTS: 4
    },
    PAYMENT: {
      ADMIN_WHATSAPP: '2347048135078',
      PAYSTACK_PUBLIC_KEY: 'pk_test_YOUR_PUBLIC_KEY_HERE',
      ACTIVATION_PINS: {
        "JAMB-A1B2-55":  55,
        "JAMB-C3D4-110": 110,
        "JAMB-E5F6-550": 550
      }
    }
  };

  function loadNumber(key) {
    const n = parseInt(localStorage.getItem(key) || '0', 10);
    return isNaN(n) ? 0 : n;
  }

  const state = {
    userId: localStorage.getItem('jamb_uid') || null,
    unlocked: false,
    points: loadNumber('jamb_points'),
    earned: loadNumber('jamb_earned'),
    spent: loadNumber('jamb_spent'),
    referralCount: loadNumber('jamb_ref_count'),
    referralUsed: localStorage.getItem('jamb_ref_used') || null,
    newbieBonusClaimed: localStorage.getItem('jamb_newbie_bonus') === 'yes',
    questionBank: null,
    subjectsLoaded: false,
    showMoreSubjects: false,
    selectedSubjects: new Set(),
    currentQuiz: null,
    lastTopUpTime: localStorage.getItem('jamb_daily_topup')
  };

  return {
    getConfig: function() { return CONFIG; },

    getUserId: function() { return state.userId; },
    setUserId: function(id) { state.userId = id; },

    isUnlocked: function() { return state.unlocked; },
    setUnlocked: function(val) { state.unlocked = !!val; },

    getPoints: function() { return state.points; },
    setPoints: function(val) {
      state.points = Math.max(0, val);
      localStorage.setItem('jamb_points', String(state.points));
    },
    getEarned: function() { return state.earned; },
    setEarned: function(val) {
      state.earned = Math.max(0, val);
      localStorage.setItem('jamb_earned', String(state.earned));
    },
    getSpent: function() { return state.spent; },
    setSpent: function(val) {
      state.spent = Math.max(0, val);
      localStorage.setItem('jamb_spent', String(state.spent));
    },

    getReferralCount: function() { return state.referralCount; },
    setReferralCount: function(count) { state.referralCount = count; },
    getReferralUsed: function() { return state.referralUsed; },
    setReferralUsed: function(ref) { state.referralUsed = ref; },
    isNewbieBonusClaimed: function() { return state.newbieBonusClaimed; },
    setNewbieBonusClaimed: function(val) { state.newbieBonusClaimed = !!val; },

    getQuestionBank: function() { return state.questionBank; },
    setQuestionBank: function(bank) { state.questionBank = bank; },
    isSubjectsLoaded: function() { return state.subjectsLoaded; },
    setSubjectsLoaded: function(val) { state.subjectsLoaded = !!val; },

    getShowMoreSubjects: function() { return state.showMoreSubjects; },
    setShowMoreSubjects: function(val) { state.showMoreSubjects = !!val; },
    getSelectedSubjects: function() { return Array.from(state.selectedSubjects); },
    setSelectedSubjects: function(set) { state.selectedSubjects = set; },
    addSelectedSubject: function(key) { state.selectedSubjects.add(key); },
    removeSelectedSubject: function(key) { state.selectedSubjects.delete(key); },
    clearSelectedSubjects: function() { state.selectedSubjects.clear(); },
    getSelectedSubjectCount: function() { return state.selectedSubjects.size; },

    getCurrentQuiz: function() { return state.currentQuiz; },
    setCurrentQuiz: function(quiz) { state.currentQuiz = quiz; },
    clearCurrentQuiz: function() { state.currentQuiz = null; },

    getLastTopUpTime: function() { return state.lastTopUpTime; },
    setLastTopUpTime: function(time) { state.lastTopUpTime = time; }
  };
})();

if (typeof module !== 'undefined' && module.exports) {
  module.exports = JAMB_STATE;
}
