const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activities: [],
    statistics: {
      totalActivities: 0,
      totalRegistrations: 0,
      activeActivities: 0,
      todayRegistrations: 0
    },
    loading: true
  },

  onLoad: function () {
    this.checkAdmin()
  },

  onShow: function () {
    this.loadData()
  },

  checkAdmin: function () {
    const app = getApp()
    if (!app.globalData.isAdmin) {
      wx.showModal({
        title: '无权限',
        content: '您没有管理员权限',
        showCancel: false,
        success: function () {
          wx.navigateBack()
        }
      })
    }
  },

  loadData: function () {
    this.loadStatistics()
    this.loadActivities()
  },

  loadStatistics: function () {
    const that = this
    api.getStatistics().then(res => {
      that.setData({
        statistics: res || that.data.statistics
      })
    }).catch(err => {
      console.error('Failed to load statistics', err)
    })
  },

  loadActivities: function () {
    const that = this
    that.setData({ loading: true })
    api.getActivities({ page: 1, pageSize: 100 }).then(res => {
      that.setData({
        activities: res.data || [],
        loading: false
      })
    }).catch(err => {
      console.error('Failed to load activities', err)
      that.setData({ loading: false })
    })
  },

  // Create new activity
  onCreateActivity: function () {
    wx.navigateTo({
      url: '/pages/admin-edit/admin-edit'
    })
  },

  // Edit activity
  onEditActivity: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/admin-edit/admin-edit?id=' + id
    })
  },

  // Delete activity
  onDeleteActivity: function (e) {
    const id = e.currentTarget.dataset.id
    const that = this
    wx.showModal({
      title: '确认删除',
      content: '删除后不可恢复，确定要删除这个活动吗？',
      confirmColor: '#ee0a24',
      success: function (res) {
        if (res.confirm) {
          util.showLoading('删除中...')
          api.deleteActivity(id).then(res => {
            util.hideLoading()
            util.showToast('删除成功', 'success')
            that.loadData()
          }).catch(err => {
            util.hideLoading()
            console.error('Failed to delete activity', err)
            util.showToast('删除失败', 'none')
          })
        }
      }
    })
  },

  // View registrations
  onViewRegistrations: function (e) {
    const id = e.currentTarget.dataset.id
    const title = e.currentTarget.dataset.title
    wx.navigateTo({
      url: '/pages/admin-registrations/admin-registrations?id=' + id + '&title=' + encodeURIComponent(title)
    })
  }
})
