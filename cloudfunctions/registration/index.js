const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

// Register for an activity
async function register(event, wxContext) {
  const { activityId, userInfo } = event
  const userId = wxContext.OPENID

  // Check if already registered
  const existing = await db.collection('registrations').where({
    activityId,
    userId
  }).count()

  if (existing.total > 0) {
    return { success: false, error: '您已报名此活动' }
  }

  // Check if activity exists and registration is open
  const activityResult = await db.collection('activities').doc(activityId).get()
  const activity = activityResult.data

  const now = new Date()
  const startDate = new Date(activity.startDate)
  if (now >= startDate) {
    return { success: false, error: '报名已截止' }
  }

  // Get activity info for registration record
  const formatDate = (d) => {
    const date = new Date(d)
    return date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0')
  }

  // Create registration
  const result = await db.collection('registrations').add({
    data: {
      activityId,
      userId,
      name: userInfo.name,
      phone: userInfo.phone,
      wechatId: userInfo.wechatId,
      activityTitle: activity.title,
      activityCover: activity.coverImage || '',
      activityDate: formatDate(activity.startDate) + ' ~ ' + formatDate(activity.endDate),
      activityLocation: activity.location || '',
      createdAt: db.serverDate()
    }
  })

  // Increment registration count
  await db.collection('activities').doc(activityId).update({
    data: {
      registrationCount: _.inc(1)
    }
  })

  // Try to send subscribe message
  try {
    await sendSubscribeMessage(userId, activity)
  } catch (e) {
    console.log('Subscribe message failed (this is normal if user did not subscribe)', e)
  }

  return { success: true, id: result._id }
}

// Cancel registration
async function cancelRegistration(event, wxContext) {
  const { activityId } = event
  const userId = wxContext.OPENID

  const result = await db.collection('registrations').where({
    activityId,
    userId
  }).remove()

  if (result.stats.removed > 0) {
    // Decrement registration count
    await db.collection('activities').doc(activityId).update({
      data: {
        registrationCount: _.inc(-1)
      }
    })
  }

  return { success: true }
}

// Get registrations for an activity (admin)
async function getRegistrations(event) {
  const { activityId, page = 1, pageSize = 20 } = event
  const skip = (page - 1) * pageSize

  const result = await db.collection('registrations')
    .where({ activityId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  const total = await db.collection('registrations')
    .where({ activityId })
    .count()

  // Format createdAt
  const data = result.data.map(item => {
    if (item.createdAt) {
      const d = new Date(item.createdAt)
      item.createdAt = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0')
    }
    return item
  })

  return {
    data: data,
    total: total.total
  }
}

// Get current user's registrations
async function getMyRegistrations(event, wxContext) {
  const { page = 1, pageSize = 10 } = event
  const userId = wxContext.OPENID
  const skip = (page - 1) * pageSize

  const result = await db.collection('registrations')
    .where({ userId })
    .orderBy('createdAt', 'desc')
    .skip(skip)
    .limit(pageSize)
    .get()

  // Format createdAt
  const data = result.data.map(item => {
    if (item.createdAt) {
      const d = new Date(item.createdAt)
      item.createdAt = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0')
    }
    return item
  })

  return {
    data: data
  }
}

// Send subscribe message notification
async function sendSubscribeMessage(userId, activity) {
  try {
    await cloud.openapi.subscribeMessage.send({
      touser: userId,
      templateId: 'TEMPLATE_ID_PLACEHOLDER', // Replace with actual template ID
      page: '/pages/detail/detail?id=' + activity._id,
      data: {
        thing1: { value: activity.title.substring(0, 20) },
        time2: { value: activity.startDate },
        thing3: { value: activity.location || '待定' }
      }
    })
  } catch (e) {
    console.log('Send subscribe message error', e)
  }
}

// Main entry
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  switch (event.type) {
    case 'register':
      return register(event, wxContext)
    case 'cancelRegistration':
      return cancelRegistration(event, wxContext)
    case 'getRegistrations':
      return getRegistrations(event)
    case 'getMyRegistrations':
      return getMyRegistrations(event, wxContext)
    default:
      return { error: 'Unknown type: ' + event.type }
  }
}
