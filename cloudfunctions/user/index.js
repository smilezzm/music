const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

function parseDateTime(value) {
  if (!value) {
    return new Date('')
  }

  let normalized = String(value).trim().replace(/T/, ' ')
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized += ' 00:00:00'
  }
  return new Date(normalized.replace(/-/g, '/'))
}

function formatDateTime(value) {
  const date = parseDateTime(value)
  return date.getFullYear() + '-' +
    String(date.getMonth() + 1).padStart(2, '0') + '-' +
    String(date.getDate()).padStart(2, '0') + ' ' +
    String(date.getHours()).padStart(2, '0') + ':' +
    String(date.getMinutes()).padStart(2, '0')
}

// Get OpenID
async function getOpenId(wxContext) {
  return {
    openId: wxContext.OPENID,
    appId: wxContext.APPID,
    unionId: wxContext.UNIONID || ''
  }
}

// Check if current user is admin
async function checkAdmin(wxContext) {
  const openId = wxContext.OPENID

  // Check in admins collection
  const result = await db.collection('admins').where({
    openId: openId
  }).count()

  return {
    isAdmin: result.total > 0,
    openId: openId
  }
}

// Get user info from database
async function getUserInfo(wxContext) {
  const openId = wxContext.OPENID

  const result = await db.collection('users').where({
    openId: openId
  }).get()

  if (result.data.length > 0) {
    return { data: result.data[0] }
  }

  return { data: null }
}

// Save or update user info
async function saveUserInfo(event, wxContext) {
  const openId = wxContext.OPENID
  const { userInfo } = event

  const existing = await db.collection('users').where({
    openId: openId
  }).get()

  if (existing.data.length > 0) {
    // Update
    await db.collection('users').doc(existing.data[0]._id).update({
      data: {
        ...userInfo,
        updatedAt: db.serverDate()
      }
    })
  } else {
    // Create
    await db.collection('users').add({
      data: {
        openId: openId,
        ...userInfo,
        createdAt: db.serverDate(),
        updatedAt: db.serverDate()
      }
    })
  }

  return { success: true }
}

// Toggle favorite
async function toggleFavorite(event, wxContext) {
  const { activityId } = event
  const userId = wxContext.OPENID

  // Check if already favorited
  const existing = await db.collection('favorites').where({
    activityId,
    userId
  }).get()

  if (existing.data.length > 0) {
    // Remove favorite
    await db.collection('favorites').doc(existing.data[0]._id).remove()
    return { isFavorited: false }
  } else {
    // Get activity info
    let activityTitle = ''
    let activityCover = ''
    let activityDate = ''
    let activityLocation = ''
    try {
      const activityResult = await db.collection('activities').doc(activityId).get()
      const activity = activityResult.data
      activityTitle = activity.title || ''
      activityCover = activity.coverImage || ''
      activityLocation = activity.location || ''
      activityDate = formatDateTime(activity.startDate) + ' - ' + formatDateTime(activity.endDate)
    } catch (e) {
      console.log('Failed to get activity info for favorite', e)
    }

    // Add favorite
    await db.collection('favorites').add({
      data: {
        activityId,
        userId,
        activityTitle,
        activityCover,
        activityDate,
        activityLocation,
        createdAt: db.serverDate()
      }
    })
    return { isFavorited: true }
  }
}

// Check favorite status
async function checkFavorite(event, wxContext) {
  const { activityId } = event
  const userId = wxContext.OPENID

  const result = await db.collection('favorites').where({
    activityId,
    userId
  }).count()

  return { isFavorited: result.total > 0 }
}

// Get user's favorites
async function getMyFavorites(event, wxContext) {
  const { page = 1, pageSize = 10 } = event
  const userId = wxContext.OPENID
  const skip = (page - 1) * pageSize

  const result = await db.collection('favorites')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  return { data: result.data }
}

// Main entry
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  switch (event.type) {
    case 'getOpenId':
      return getOpenId(wxContext)
    case 'checkAdmin':
      return checkAdmin(wxContext)
    case 'getUserInfo':
      return getUserInfo(wxContext)
    case 'saveUserInfo':
      return saveUserInfo(event, wxContext)
    case 'toggleFavorite':
      return toggleFavorite(event, wxContext)
    case 'checkFavorite':
      return checkFavorite(event, wxContext)
    case 'getMyFavorites':
      return getMyFavorites(event, wxContext)
    default:
      return { error: 'Unknown type: ' + event.type }
  }
}
