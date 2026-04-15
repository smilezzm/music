const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activity: null,
    activityId: '',
    isFavorited: false,
    isRegistered: false,
    registrationOpen: false,
    showRegisterModal: false,
    lastRegInfo: null,
    statusText: '',
    statusClass: '',
    timeRange: '',
    loading: true
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({ activityId: options.id })
      this.loadActivityDetail(options.id)
      this.checkFavoriteStatus(options.id)
      this.checkRegistrationStatus(options.id)
    }
    // Get last registration info for quick fill
    const app = getApp()
    const lastRegInfo = app.getLastRegistrationInfo()
    if (lastRegInfo) {
      this.setData({ lastRegInfo: lastRegInfo })
    }
  },

  // Load activity detail
  loadActivityDetail: function (id) {
    const that = this
    that.setData({ loading: true })
    api.getActivityDetail(id).then(res => {
      const activity = res.data || res
      const status = util.getActivityStatus(activity.startDate, activity.endDate)
      that.setData({
        activity: activity,
        statusText: util.getStatusText(status),
        statusClass: 'status-' + status,
        timeRange: util.formatDate(new Date(activity.startDate)) + ' ~ ' + util.formatDate(new Date(activity.endDate)),
        registrationOpen: util.isRegistrationOpen(activity.startDate),
        loading: false
      })
      wx.setNavigationBarTitle({ title: activity.title || '活动详情' })
    }).catch(err => {
      console.error('Failed to load activity detail', err)
      that.setData({ loading: false })
      util.showToast('加载失败', 'none')
    })
  },

  // Check if user favorited this activity
  checkFavoriteStatus: function (id) {
    const that = this
    api.checkFavorite(id).then(res => {
      that.setData({ isFavorited: res.isFavorited || false })
    }).catch(err => {
      console.error('Failed to check favorite status', err)
    })
  },

  // Check if user registered for this activity
  checkRegistrationStatus: function (id) {
    const that = this
    api.getMyRegistrations(1, 100).then(res => {
      const registrations = res.data || []
      const isRegistered = registrations.some(r => r.activityId === id)
      that.setData({ isRegistered: isRegistered })
    }).catch(err => {
      console.error('Failed to check registration status', err)
    })
  },

  // Open registration modal
  onRegister: function () {
    if (!this.data.registrationOpen) {
      util.showToast('报名已截止', 'none')
      return
    }
    if (this.data.isRegistered) {
      util.showToast('您已报名', 'none')
      return
    }
    this.setData({ showRegisterModal: true })
  },

  // Close registration modal
  onCloseRegister: function () {
    this.setData({ showRegisterModal: false })
  },

  // Submit registration
  onSubmitRegister: function (e) {
    const that = this
    const formData = e.detail
    util.showLoading('提交中...')

    api.register(that.data.activityId, formData).then(res => {
      util.hideLoading()
      that.setData({
        showRegisterModal: false,
        isRegistered: true
      })

      // Save last registration info
      const app = getApp()
      app.saveLastRegistrationInfo(formData)

      // Update registration count
      if (that.data.activity) {
        const activity = that.data.activity
        activity.registrationCount = (activity.registrationCount || 0) + 1
        that.setData({ activity: activity })
      }

      // Try to subscribe to notification
      that.requestSubscribeMessage()

      util.showToast('报名成功', 'success')

      // Check if payment is needed
      if (that.data.activity && that.data.activity.fee > 0) {
        wx.showModal({
          title: '支付提示',
          content: '报名成功！活动费用 ¥' + that.data.activity.fee + '，请联系管理员完成支付。',
          showCancel: false
        })
      }
    }).catch(err => {
      util.hideLoading()
      console.error('Failed to register', err)
      util.showToast('报名失败', 'none')
    })
  },

  // Cancel registration
  onCancelRegistration: function () {
    const that = this
    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: function (res) {
        if (res.confirm) {
          util.showLoading('取消中...')
          api.cancelRegistration(that.data.activityId).then(res => {
            util.hideLoading()
            that.setData({ isRegistered: false })
            // Update registration count
            if (that.data.activity) {
              const activity = that.data.activity
              activity.registrationCount = Math.max(0, (activity.registrationCount || 1) - 1)
              that.setData({ activity: activity })
            }
            util.showToast('已取消报名', 'success')
          }).catch(err => {
            util.hideLoading()
            console.error('Failed to cancel registration', err)
            util.showToast('取消失败', 'none')
          })
        }
      }
    })
  },

  // Toggle favorite
  onToggleFavorite: function () {
    const that = this
    api.toggleFavorite(that.data.activityId).then(res => {
      const newState = !that.data.isFavorited
      that.setData({ isFavorited: newState })
      util.showToast(newState ? '已收藏' : '已取消收藏', 'success')
    }).catch(err => {
      console.error('Failed to toggle favorite', err)
      util.showToast('操作失败', 'none')
    })
  },

  // Request subscribe message
  requestSubscribeMessage: function () {
    wx.requestSubscribeMessage({
      tmplIds: ['TEMPLATE_ID_PLACEHOLDER'], // Replace with actual template ID
      success: function (res) {
        console.log('Subscribe message result', res)
      },
      fail: function (err) {
        console.log('Subscribe message failed or denied', err)
      }
    })
  },

  // Share
  onShareAppMessage: function () {
    const activity = this.data.activity
    return {
      title: activity ? activity.title : '精彩活动等你来参加！',
      path: '/pages/detail/detail?id=' + this.data.activityId,
      imageUrl: activity ? activity.coverImage : ''
    }
  },

  // Preview cover image
  onPreviewImage: function () {
    if (this.data.activity && this.data.activity.coverImage) {
      wx.previewImage({
        urls: [this.data.activity.coverImage]
      })
    }
  }
})
