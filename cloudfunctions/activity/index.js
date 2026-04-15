const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command
const $ = db.command.aggregate

function parseDateTime(value, treatDateOnlyAsEndOfDay) {
  if (!value) {
    return new Date('')
  }

  let normalized = String(value).trim().replace(/T/, ' ')
  if (/^\d{4}-\d{2}-\d{2}$/.test(normalized)) {
    normalized += treatDateOnlyAsEndOfDay ? ' 23:59:59' : ' 00:00:00'
  }
  return new Date(normalized.replace(/-/g, '/'))
}

// Get activities list with pagination, filtering, and search
async function getActivities(event) {
  const { page = 1, pageSize = 10, status = '', keyword = '' } = event
  const skip = (page - 1) * pageSize

  let query = {}

  // Filter by keyword (search in title)
  if (keyword) {
    query.title = db.RegExp({
      regexp: keyword,
      options: 'i'
    })
  }

  // Get all matching activities first, then filter by computed status
  let result
  if (Object.keys(query).length > 0) {
    result = await db.collection('activities')
      .where(query)
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
  } else {
    result = await db.collection('activities')
      .orderBy('createdAt', 'desc')
      .skip(skip)
      .limit(pageSize)
      .get()
  }

  let activities = result.data

  // Compute status for each activity
  const now = new Date()
  activities = activities.map(a => {
    const startDate = parseDateTime(a.startDate, false)
    const endDate = parseDateTime(a.endDate, true)
    let computedStatus = 'upcoming'
    if (now >= startDate && now <= endDate) {
      computedStatus = 'ongoing'
    } else if (now > endDate) {
      computedStatus = 'ended'
    }
    a.status = computedStatus
    return a
  })

  // Filter by status if specified
  if (status) {
    activities = activities.filter(a => a.status === status)
  }

  return {
    data: activities,
    total: activities.length
  }
}

// Get single activity detail
async function getActivityDetail(event) {
  const { activityId } = event
  const result = await db.collection('activities').doc(activityId).get()
  const activity = result.data

  // Compute status
  const now = new Date()
  const startDate = parseDateTime(activity.startDate, false)
  const endDate = parseDateTime(activity.endDate, true)
  if (now >= startDate && now <= endDate) {
    activity.status = 'ongoing'
  } else if (now > endDate) {
    activity.status = 'ended'
  } else {
    activity.status = 'upcoming'
  }

  return {
    data: activity
  }
}

// Create new activity (admin only)
async function createActivity(event, wxContext) {
  const { title, description, location, startDate, endDate, coverImage, fee } = event

  // Check admin
  const adminCheck = await checkAdmin(wxContext.OPENID)
  if (!adminCheck) {
    return { success: false, error: '无管理员权限' }
  }

  const result = await db.collection('activities').add({
    data: {
      title,
      description,
      location,
      startDate,
      endDate,
      coverImage: coverImage || '',
      fee: fee || 0,
      registrationCount: 0,
      creatorId: wxContext.OPENID,
      createdAt: db.serverDate(),
      updatedAt: db.serverDate()
    }
  })

  return { success: true, id: result._id }
}

// Update activity (admin only)
async function updateActivity(event, wxContext) {
  const { activityId, data } = event

  const adminCheck = await checkAdmin(wxContext.OPENID)
  if (!adminCheck) {
    return { success: false, error: '无管理员权限' }
  }

  const updateData = {
    title: data.title,
    description: data.description,
    location: data.location,
    startDate: data.startDate,
    endDate: data.endDate,
    coverImage: data.coverImage || '',
    fee: data.fee || 0,
    updatedAt: db.serverDate()
  }

  await db.collection('activities').doc(activityId).update({
    data: updateData
  })

  return { success: true }
}

// Delete activity (admin only)
async function deleteActivity(event, wxContext) {
  const { activityId } = event

  const adminCheck = await checkAdmin(wxContext.OPENID)
  if (!adminCheck) {
    return { success: false, error: '无管理员权限' }
  }

  // Delete the activity
  await db.collection('activities').doc(activityId).remove()

  // Also delete related registrations and favorites
  try {
    await db.collection('registrations').where({ activityId }).remove()
    await db.collection('favorites').where({ activityId }).remove()
  } catch (e) {
    console.log('Cleanup related data', e)
  }

  return { success: true }
}

// Check if user is admin
async function checkAdmin(openId) {
  const adminResult = await db.collection('admins').where({ openId }).count()
  return adminResult.total > 0
}

// Get statistics (admin only)
async function getStatistics(event, wxContext) {
  const adminCheck = await checkAdmin(wxContext.OPENID)
  if (!adminCheck) {
    return { success: false, error: '无管理员权限' }
  }

  const totalActivities = await db.collection('activities').count()
  const totalRegistrations = await db.collection('registrations').count()

  // Count active activities (where now is between startDate and endDate)
  const allActivities = await db.collection('activities').get()
  const now = new Date()
  let activeCount = 0
  allActivities.data.forEach(a => {
    const start = parseDateTime(a.startDate, false)
    const end = parseDateTime(a.endDate, true)
    if (now >= start && now <= end) {
      activeCount++
    }
  })

  // Today's registrations
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const todayRegs = await db.collection('registrations')
    .where({
      createdAt: _.gte(today)
    })
    .count()

  return {
    totalActivities: totalActivities.total,
    totalRegistrations: totalRegistrations.total,
    activeActivities: activeCount,
    todayRegistrations: todayRegs.total
  }
}

// Main entry
exports.main = async (event, context) => {
  const wxContext = cloud.getWXContext()

  switch (event.type) {
    case 'getActivities':
      return getActivities(event)
    case 'getActivityDetail':
      return getActivityDetail(event)
    case 'createActivity':
      return createActivity(event, wxContext)
    case 'updateActivity':
      return updateActivity(event, wxContext)
    case 'deleteActivity':
      return deleteActivity(event, wxContext)
    case 'getStatistics':
      return getStatistics(event, wxContext)
    default:
      return { error: 'Unknown type: ' + event.type }
  }
}
