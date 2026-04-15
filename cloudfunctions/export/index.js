const cloud = require('wx-server-sdk')
const xlsx = require('node-xlsx')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

// Export registrations to Excel
async function exportRegistrations(event) {
  const { activityId } = event

  // Get activity info
  const activityResult = await db.collection('activities').doc(activityId).get()
  const activity = activityResult.data

  // Get all registrations (handle pagination for large datasets)
  let allRegistrations = []
  const batchSize = 100
  let skip = 0
  let hasMore = true

  while (hasMore) {
    const batch = await db.collection('registrations')
      .where({ activityId })
      .orderBy('createdAt', 'asc')
      .skip(skip)
      .limit(batchSize)
      .get()

    allRegistrations = allRegistrations.concat(batch.data)
    skip += batchSize
    hasMore = batch.data.length === batchSize
  }

  // Build Excel data
  const header = ['序号', '姓名', '手机号', '微信号', '报名时间']
  const rows = allRegistrations.map((reg, index) => {
    let createdAt = ''
    if (reg.createdAt) {
      const d = new Date(reg.createdAt)
      createdAt = d.getFullYear() + '-' +
        String(d.getMonth() + 1).padStart(2, '0') + '-' +
        String(d.getDate()).padStart(2, '0') + ' ' +
        String(d.getHours()).padStart(2, '0') + ':' +
        String(d.getMinutes()).padStart(2, '0')
    }
    return [
      index + 1,
      reg.name || '',
      reg.phone || '',
      reg.wechatId || '',
      createdAt
    ]
  })

  const data = [header, ...rows]
  const sheetOptions = {
    '!cols': [
      { wch: 6 },  // 序号
      { wch: 12 }, // 姓名
      { wch: 15 }, // 手机号
      { wch: 15 }, // 微信号
      { wch: 20 }  // 报名时间
    ]
  }

  const buffer = xlsx.build([{
    name: activity.title || '报名名单',
    data: data,
    options: sheetOptions
  }])

  // Upload to cloud storage
  const fileName = (activity.title || '报名名单') + '_' + Date.now() + '.xlsx'
  const uploadResult = await cloud.uploadFile({
    cloudPath: 'exports/' + fileName,
    fileContent: buffer
  })

  return {
    success: true,
    fileID: uploadResult.fileID,
    total: allRegistrations.length
  }
}

// Main entry
exports.main = async (event, context) => {
  switch (event.type) {
    case 'exportRegistrations':
      return exportRegistrations(event)
    default:
      return { error: 'Unknown type: ' + event.type }
  }
}
