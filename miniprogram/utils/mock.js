/**
 * Mock data for local development and testing
 */

var mockActivities = [
  {
    _id: 'mock-activity-001',
    title: '周末户外徒步活动',
    description: '一起走进大自然，感受山林间的清新空气。路线全长约10公里，适合初中级徒步爱好者参加。请穿着舒适运动鞋，自带饮用水。',
    coverImage: '/images/mock/hiking.png',
    location: '北京市海淀区香山公园',
    startDate: '2026-05-01',
    endDate: '2026-05-01',
    registrationCount: 32,
    createdAt: '2026-04-10',
    creatorId: 'mock-user-admin',
    status: 'upcoming'
  },
  {
    _id: 'mock-activity-002',
    title: '摄影爱好者交流会',
    description: '分享你的摄影作品，与志同道合的朋友交流拍摄技巧。本次交流会将邀请专业摄影师进行点评指导。',
    coverImage: '/images/mock/photography.png',
    location: '上海市徐汇区文化艺术中心',
    startDate: '2026-05-15',
    endDate: '2026-05-15',
    registrationCount: 18,
    createdAt: '2026-04-12',
    creatorId: 'mock-user-admin',
    status: 'upcoming'
  },
  {
    _id: 'mock-activity-003',
    title: '社区公益读书会',
    description: '每月一期的读书分享活动，本期主题：经典文学作品赏析。欢迎带上你最近在读的好书，一起品味文字之美。',
    coverImage: '/images/mock/reading.png',
    location: '广州市天河区社区图书馆',
    startDate: '2026-05-20',
    endDate: '2026-05-20',
    registrationCount: 25,
    createdAt: '2026-04-15',
    creatorId: 'mock-user-admin',
    status: 'upcoming'
  },
  {
    _id: 'mock-activity-004',
    title: '亲子手工DIY工坊',
    description: '适合3-10岁小朋友与家长一起参与的手工制作活动，本期制作主题为陶艺彩绘。所有材料由主办方提供。',
    coverImage: '/images/mock/diy.png',
    location: '深圳市南山区万象天地',
    startDate: '2026-06-01',
    endDate: '2026-06-01',
    registrationCount: 40,
    createdAt: '2026-04-20',
    creatorId: 'mock-user-admin',
    status: 'upcoming'
  },
  {
    _id: 'mock-activity-005',
    title: '夜跑俱乐部周三例跑',
    description: '每周三晚8点准时开跑，全程约5公里。适合所有水平的跑者参加，配速自由。跑后有拉伸指导环节。',
    coverImage: '/images/mock/running.png',
    location: '成都市锦江区锦城湖公园',
    startDate: '2026-05-07',
    endDate: '2026-05-07',
    registrationCount: 55,
    createdAt: '2026-04-25',
    creatorId: 'mock-user-admin',
    status: 'upcoming'
  }
]

var mockRegistrations = [
  {
    _id: 'mock-reg-001',
    activityId: 'mock-activity-001',
    userId: 'mock-user-001',
    name: '张三',
    phone: '13800138001',
    wechatId: 'zhangsan_wx',
    createdAt: '2026-04-11'
  },
  {
    _id: 'mock-reg-002',
    activityId: 'mock-activity-001',
    userId: 'mock-user-002',
    name: '李四',
    phone: '13900139002',
    wechatId: 'lisi_wx',
    createdAt: '2026-04-12'
  },
  {
    _id: 'mock-reg-003',
    activityId: 'mock-activity-002',
    userId: 'mock-user-003',
    name: '王五',
    phone: '13700137003',
    wechatId: 'wangwu_wx',
    createdAt: '2026-04-13'
  }
]

/**
 * Check whether the app is running in mock mode
 * (i.e. wx.cloud has not been initialised)
 * @returns {boolean}
 */
function isMockMode() {
  try {
    return !wx.cloud
  } catch (e) {
    return true
  }
}

/**
 * Get paginated / filtered mock activities
 * @param {Object} [params] - { page, pageSize, status, keyword }
 * @returns {{ list: Array, total: number }}
 */
function getMockActivities(params) {
  params = params || {}
  var page = params.page || 1
  var pageSize = params.pageSize || 10
  var status = params.status
  var keyword = params.keyword

  var filtered = mockActivities.slice()

  if (status) {
    filtered = filtered.filter(function (a) {
      return a.status === status
    })
  }

  if (keyword) {
    var kw = keyword.toLowerCase()
    filtered = filtered.filter(function (a) {
      return a.title.toLowerCase().indexOf(kw) !== -1 ||
        a.description.toLowerCase().indexOf(kw) !== -1
    })
  }

  var total = filtered.length
  var start = (page - 1) * pageSize
  var list = filtered.slice(start, start + pageSize)

  return { list: list, total: total }
}

/**
 * Get a single mock activity by ID
 * @param {string} id
 * @returns {Object|null}
 */
function getMockActivityDetail(id) {
  for (var i = 0; i < mockActivities.length; i++) {
    if (mockActivities[i]._id === id) {
      return mockActivities[i]
    }
  }
  return null
}

module.exports = {
  mockActivities: mockActivities,
  mockRegistrations: mockRegistrations,
  isMockMode: isMockMode,
  getMockActivities: getMockActivities,
  getMockActivityDetail: getMockActivityDetail
}
