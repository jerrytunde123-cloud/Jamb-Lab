/**
 * JAMB Quiz - Daily Tasks System
 * Handles daily bonus tasks and streak top-ups
 */

const JAMB_DAILY = (function() {
  'use strict';

  const state = JAMB_STATE;
  const utils = JAMB_UTILS;
  const points = JAMB_POINTS;
  const config = state.getConfig();

  // ============================================
  // REFRESH DAILY TASKS UI
  // ============================================
  function refreshDailyTasks() {
    const tasks = [
      { 
        key: 'tg_channel', 
        label: 'Join Telegram', 
        icon: 'fab fa-telegram', 
        points: config.POINTS.TG_CHANNEL_BONUS, 
        check: () => localStorage.getItem('jamb_tg') === 'yes' 
      },
      { 
        key: 'wa_channel', 
        label: 'Join WhatsApp', 
        icon: 'fab fa-whatsapp', 
        points: config.POINTS.WAEC_CHANNEL_BONUS, 
        check: () => localStorage.getItem('jamb_wa') === 'yes' 
      },
      { 
        key: 'tutorial', 
        label: 'Watch Tutorial', 
        icon: 'fas fa-play-circle', 
        points: config.POINTS.JAMB_TUTORIAL_BONUS, 
        check: () => utils.isToday('tutorial') 
      },
      { 
        key: 'facebook', 
        label: 'Follow on FB', 
        icon: 'fab fa-facebook-f', 
        points: config.POINTS.FACEBOOK_BONUS, 
        check: () => utils.isToday('facebook') 
      },
      { 
        key: 'share', 
        label: 'Share App', 
        icon: 'fas fa-share-alt', 
        points: config.POINTS.SHARE_REWARD, 
        check: () => utils.isToday('share') 
      }
    ];

    const container = utils.$('dailyTasks');
    if (!container) return;
    
    container.innerHTML = '';
    
    tasks.forEach(function(t) {
      const done = t.check();
      const div = utils.createEl('div', 'bonus-row' + (done ? ' claimed' : ''),
        '<i class="' + t.icon + '"></i> ' + t.label + ' <span style="margin-left:auto;">+' + t.points + 'pts</span>'
      );
      
      div.addEventListener('click', function() {
        if (done) {
          utils.showToast('Already claimed today', 'orange');
          return;
        }
        
        points.addPoints(t.points);
        utils.markToday(t.key);
        
        div.classList.add('claimed');
        div.innerHTML = '<i class="' + t.icon + '"></i> ' + t.label + ' <span style="margin-left:auto;">+' + t.points + 'pts</span>';
        
        utils.showToast('+' + t.points + ' points earned!', 'green');
      });
      
      container.appendChild(div);
    });
  }

  // ============================================
  // DAILY TOP-UP (streak system)
  // ============================================
  function dailyTopUp() {
    const last = localStorage.getItem('jamb_daily_topup');
    const now = new Date();
    const days = 30;
    const msPerDay = 24 * 60 * 60 * 1000;
    
    // Calculate expected timestamp for 30-day intervals
    const expected = Math.floor((now.getTime() - (days * msPerDay)) / (days * msPerDay)) * (days * msPerDay);
    
    if (last === null) {
      localStorage.setItem('jamb_daily_topup', String(now.getTime()));
      return;
    }
    
    const lastTime = parseInt(last);
    if (lastTime >= expected) return;
    
    // Calculate days since last top-up
    const diffDays = Math.floor((now.getTime() - lastTime) / msPerDay);
    if (diffDays < 1) return;
    
    const bonus = Math.min(diffDays, 30) * config.POINTS.DAILY_TOPUP;
    points.addPoints(bonus);
    localStorage.setItem('jamb_daily_topup', String(now.getTime()));
    
    if (bonus > 0) {
      utils.showToast('Daily top-up: +' + bonus + ' points!', 'green');
    }
  }

  // ============================================
  // CLAIM SPECIFIC TASK
  // ============================================
  function claimTask(taskKey) {
    if (utils.isToday(taskKey)) {
      utils.showToast('Already claimed today', 'orange');
      return false;
    }
    
    const tasks = {
      tg_channel: { points: config.POINTS.TG_CHANNEL_BONUS },
      wa_channel: { points: config.POINTS.WAEC_CHANNEL_BONUS },
      tutorial: { points: config.POINTS.JAMB_TUTORIAL_BONUS },
      facebook: { points: config.POINTS.FACEBOOK_BONUS },
      share: { points: config.POINTS.SHARE_REWARD }
    };
    
    const task = tasks[taskKey];
    if (!task) return false;
    
    points.addPoints(task.points);
    utils.markToday(taskKey);
    utils.showToast('+' + task.points + ' points earned!', 'green');
    
    refreshDailyTasks();
    return true;
  }

  // ============================================
  // PUBLIC API
  // ============================================
  return {
    refreshDailyTasks: refreshDailyTasks,
    dailyTopUp: dailyTopUp,
    claimTask: claimTask
  };
})();