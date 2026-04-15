/**
 * Utility functions for the Mini Program
 */

/**
 * Pad a number to two digits
 */
function pad(n) {
  return n < 10 ? '0' + n : '' + n
}

/**
 * Format a Date object to 'YYYY-MM-DD'
 * @param {Date} date
 * @returns {string}
 */
function formatDate(date) {
  var d = new Date(date)
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

/**
 * Format a Date object to 'YYYY-MM-DD HH:mm'
 * @param {Date} date
 * @returns {string}
 */
function formatDateTime(date) {
  var d = new Date(date)
  return formatDate(d) + ' ' + pad(d.getHours()) + ':' + pad(d.getMinutes())
}

/**
 * Format a Date object to 'HH:mm'
 * @param {Date} date
 * @returns {string}
 */
function formatTime(date) {
  var d = new Date(date)
  return pad(d.getHours()) + ':' + pad(d.getMinutes())
}

/**
 * Determine activity status based on current time
 * @param {string|Date} startDate
 * @param {string|Date} endDate
 * @returns {'upcoming'|'ongoing'|'ended'}
 */
function getActivityStatus(startDate, endDate) {
  var now = new Date().getTime()
  var start = new Date(startDate).getTime()
  var end = new Date(endDate).getTime()

  if (now < start) {
    return 'upcoming'
  } else if (now >= start && now <= end) {
    return 'ongoing'
  } else {
    return 'ended'
  }
}

/**
 * Get Chinese display text for activity status
 * @param {'upcoming'|'ongoing'|'ended'} status
 * @returns {string}
 */
function getStatusText(status) {
  var map = {
    upcoming: '报名中',
    ongoing: '进行中',
    ended: '已结束'
  }
  return map[status] || '未知'
}

/**
 * Get display color for activity status
 * @param {'upcoming'|'ongoing'|'ended'} status
 * @returns {string} hex color
 */
function getStatusColor(status) {
  var map = {
    upcoming: '#07c160',
    ongoing: '#1296db',
    ended: '#999999'
  }
  return map[status] || '#999999'
}

/**
 * Check whether registration is still open (current time is before startDate)
 * @param {string|Date} startDate
 * @returns {boolean}
 */
function isRegistrationOpen(startDate) {
  return new Date().getTime() < new Date(startDate).getTime()
}

/**
 * Validate a Chinese mobile phone number
 * @param {string} phone
 * @returns {boolean}
 */
function validatePhone(phone) {
  return /^1[3-9]\d{9}$/.test(phone)
}

/**
 * Create a throttled version of a function
 * @param {Function} fn
 * @param {number} delay - milliseconds
 * @returns {Function}
 */
function throttle(fn, delay) {
  var lastCall = 0
  return function () {
    var now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      return fn.apply(this, arguments)
    }
  }
}

/**
 * Wrapper for wx.showToast
 * @param {string} title
 * @param {string} [icon='none']
 */
function showToast(title, icon) {
  wx.showToast({
    title: title,
    icon: icon || 'none',
    duration: 2000
  })
}

/**
 * Wrapper for wx.showLoading
 * @param {string} [title='加载中...']
 */
function showLoading(title) {
  wx.showLoading({
    title: title || '加载中...',
    mask: true
  })
}

/**
 * Wrapper for wx.hideLoading
 */
function hideLoading() {
  wx.hideLoading()
}

/**
 * Wrapper for wx.showModal that returns a Promise
 * @param {string} title
 * @param {string} content
 * @returns {Promise<boolean>} resolves to true if user confirmed
 */
function showModal(title, content) {
  return new Promise(function (resolve) {
    wx.showModal({
      title: title,
      content: content,
      success: function (res) {
        resolve(!!res.confirm)
      },
      fail: function () {
        resolve(false)
      }
    })
  })
}

module.exports = {
  formatDate: formatDate,
  formatDateTime: formatDateTime,
  formatTime: formatTime,
  getActivityStatus: getActivityStatus,
  getStatusText: getStatusText,
  getStatusColor: getStatusColor,
  isRegistrationOpen: isRegistrationOpen,
  validatePhone: validatePhone,
  throttle: throttle,
  showToast: showToast,
  showLoading: showLoading,
  hideLoading: hideLoading,
  showModal: showModal
}
