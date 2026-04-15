/**
 * Cloud function API wrappers
 *
 * Each function calls wx.cloud.callFunction and returns the
 * extracted result from the cloud function response.
 */

// ─── Helpers ────────────────────────────────────────────────

function callCloud(name, data) {
  return wx.cloud.callFunction({
    name: name,
    data: data || {}
  }).then(function (res) {
    return res.result
  })
}

// ─── Activity APIs ──────────────────────────────────────────

/**
 * Get paginated list of activities
 * @param {Object} [params] - { page, pageSize, status, keyword }
 */
function getActivities(params) {
  try {
    return callCloud('getActivities', params)
  } catch (err) {
    console.error('[api] getActivities failed:', err)
    throw err
  }
}

/**
 * Get a single activity by ID
 * @param {string} activityId
 */
function getActivityDetail(activityId) {
  try {
    return callCloud('getActivityDetail', { activityId: activityId })
  } catch (err) {
    console.error('[api] getActivityDetail failed:', err)
    throw err
  }
}

/**
 * Create a new activity
 * @param {Object} data - activity fields
 */
function createActivity(data) {
  try {
    return callCloud('createActivity', data)
  } catch (err) {
    console.error('[api] createActivity failed:', err)
    throw err
  }
}

/**
 * Update an existing activity
 * @param {string} activityId
 * @param {Object} data - fields to update
 */
function updateActivity(activityId, data) {
  try {
    return callCloud('updateActivity', {
      activityId: activityId,
      data: data
    })
  } catch (err) {
    console.error('[api] updateActivity failed:', err)
    throw err
  }
}

/**
 * Delete an activity
 * @param {string} activityId
 */
function deleteActivity(activityId) {
  try {
    return callCloud('deleteActivity', { activityId: activityId })
  } catch (err) {
    console.error('[api] deleteActivity failed:', err)
    throw err
  }
}

// ─── Registration APIs ──────────────────────────────────────

/**
 * Register for an activity
 * @param {string} activityId
 * @param {Object} userInfo - { name, phone, wechatId }
 */
function register(activityId, userInfo) {
  try {
    return callCloud('register', {
      activityId: activityId,
      userInfo: userInfo
    })
  } catch (err) {
    console.error('[api] register failed:', err)
    throw err
  }
}

/**
 * Cancel a registration
 * @param {string} activityId
 */
function cancelRegistration(activityId) {
  try {
    return callCloud('cancelRegistration', { activityId: activityId })
  } catch (err) {
    console.error('[api] cancelRegistration failed:', err)
    throw err
  }
}

/**
 * Get registrations for a specific activity
 * @param {string} activityId
 * @param {number} [page]
 * @param {number} [pageSize]
 */
function getRegistrations(activityId, page, pageSize) {
  try {
    return callCloud('getRegistrations', {
      activityId: activityId,
      page: page,
      pageSize: pageSize
    })
  } catch (err) {
    console.error('[api] getRegistrations failed:', err)
    throw err
  }
}

/**
 * Get current user's registrations
 * @param {number} [page]
 * @param {number} [pageSize]
 */
function getMyRegistrations(page, pageSize) {
  try {
    return callCloud('getMyRegistrations', {
      page: page,
      pageSize: pageSize
    })
  } catch (err) {
    console.error('[api] getMyRegistrations failed:', err)
    throw err
  }
}

/**
 * Export registrations for an activity to Excel
 * @param {string} activityId
 */
function exportRegistrations(activityId) {
  try {
    return callCloud('exportRegistrations', { activityId: activityId })
  } catch (err) {
    console.error('[api] exportRegistrations failed:', err)
    throw err
  }
}

// ─── Favorite APIs ──────────────────────────────────────────

/**
 * Toggle favorite status for an activity
 * @param {string} activityId
 */
function toggleFavorite(activityId) {
  try {
    return callCloud('toggleFavorite', { activityId: activityId })
  } catch (err) {
    console.error('[api] toggleFavorite failed:', err)
    throw err
  }
}

/**
 * Get current user's favorites
 * @param {number} [page]
 * @param {number} [pageSize]
 */
function getMyFavorites(page, pageSize) {
  try {
    return callCloud('getMyFavorites', {
      page: page,
      pageSize: pageSize
    })
  } catch (err) {
    console.error('[api] getMyFavorites failed:', err)
    throw err
  }
}

/**
 * Check if current user has favorited an activity
 * @param {string} activityId
 */
function checkFavorite(activityId) {
  try {
    return callCloud('checkFavorite', { activityId: activityId })
  } catch (err) {
    console.error('[api] checkFavorite failed:', err)
    throw err
  }
}

// ─── User APIs ──────────────────────────────────────────────

/**
 * Check if current user is an admin
 */
function checkAdmin() {
  try {
    return callCloud('checkAdmin')
  } catch (err) {
    console.error('[api] checkAdmin failed:', err)
    throw err
  }
}

/**
 * Get current user info
 */
function getUserInfo() {
  try {
    return callCloud('getUserInfo')
  } catch (err) {
    console.error('[api] getUserInfo failed:', err)
    throw err
  }
}

/**
 * Save / update user info
 * @param {Object} userInfo
 */
function saveUserInfo(userInfo) {
  try {
    return callCloud('saveUserInfo', { userInfo: userInfo })
  } catch (err) {
    console.error('[api] saveUserInfo failed:', err)
    throw err
  }
}

// ─── Statistics APIs ────────────────────────────────────────

/**
 * Get admin dashboard statistics
 */
function getStatistics() {
  try {
    return callCloud('getStatistics')
  } catch (err) {
    console.error('[api] getStatistics failed:', err)
    throw err
  }
}

module.exports = {
  // Activities
  getActivities: getActivities,
  getActivityDetail: getActivityDetail,
  createActivity: createActivity,
  updateActivity: updateActivity,
  deleteActivity: deleteActivity,
  // Registrations
  register: register,
  cancelRegistration: cancelRegistration,
  getRegistrations: getRegistrations,
  getMyRegistrations: getMyRegistrations,
  exportRegistrations: exportRegistrations,
  // Favorites
  toggleFavorite: toggleFavorite,
  getMyFavorites: getMyFavorites,
  checkFavorite: checkFavorite,
  // Users
  checkAdmin: checkAdmin,
  getUserInfo: getUserInfo,
  saveUserInfo: saveUserInfo,
  // Statistics
  getStatistics: getStatistics
}
