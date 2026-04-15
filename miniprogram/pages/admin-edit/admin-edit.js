const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    isEdit: false,
    activityId: '',
    formData: {
      title: '',
      description: '',
      location: '',
      startDate: '',
      startTime: '09:00',
      endDate: '',
      endTime: '19:00',
      coverImage: '',
      fee: 0
    },
    coverImageLocal: '',
    submitting: false,
    today: '',
    currentTime: ''
  },

  onLoad: function (options) {
    const now = new Date()
    const today = util.formatDate(now)
    const currentTime = util.formatTime(now)
    this.setData({ today: today, currentTime: currentTime })

    if (options.id) {
      this.setData({ isEdit: true, activityId: options.id })
      wx.setNavigationBarTitle({ title: '编辑活动' })
      this.loadActivity(options.id)
    }
  },

  loadActivity: function (id) {
    const that = this
    util.showLoading('加载中...')
    api.getActivityDetail(id).then(res => {
      util.hideLoading()
      const activity = res.data || res
      const startDateTime = util.parseDateTime(activity.startDate)
      const endDateTime = util.parseDateTime(activity.endDate)
      that.setData({
        formData: {
          title: activity.title || '',
          description: activity.description || '',
          location: activity.location || '',
          startDate: activity.startDate ? util.formatDate(startDateTime) : '',
          startTime: activity.startDate ? util.formatTime(startDateTime) : '09:00',
          endDate: activity.endDate ? util.formatDate(endDateTime) : '',
          endTime: activity.endDate ? util.formatTime(endDateTime) : '19:00',
          coverImage: activity.coverImage || '',
          fee: activity.fee || 0
        },
        coverImageLocal: activity.coverImage || ''
      })
    }).catch(err => {
      util.hideLoading()
      console.error('Failed to load activity', err)
      util.showToast('加载失败', 'none')
    })
  },

  // Form input handlers
  onInputTitle: function (e) {
    this.setData({ 'formData.title': e.detail.value })
  },

  onInputDescription: function (e) {
    this.setData({ 'formData.description': e.detail.value })
  },

  onInputLocation: function (e) {
    this.setData({ 'formData.location': e.detail.value })
  },

  onInputFee: function (e) {
    this.setData({ 'formData.fee': Number(e.detail.value) || 0 })
  },

  onStartDateChange: function (e) {
    this.setData({ 'formData.startDate': e.detail.value })
  },

  onStartTimeChange: function (e) {
    this.setData({ 'formData.startTime': e.detail.value })
  },

  onEndDateChange: function (e) {
    this.setData({ 'formData.endDate': e.detail.value })
  },

  onEndTimeChange: function (e) {
    this.setData({ 'formData.endTime': e.detail.value })
  },

  // Upload cover image
  onChooseCover: function () {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        const tempFilePath = res.tempFiles[0].tempFilePath
        that.setData({ coverImageLocal: tempFilePath })
      }
    })
  },

  // Remove cover
  onRemoveCover: function () {
    this.setData({
      coverImageLocal: '',
      'formData.coverImage': ''
    })
  },

  // Upload image to cloud
  uploadCoverImage: function (filePath) {
    return new Promise((resolve, reject) => {
      if (!filePath || filePath.startsWith('cloud://') || filePath.startsWith('http')) {
        resolve(filePath)
        return
      }
      const cloudPath = 'activity-covers/' + Date.now() + '-' + Math.random().toString(36).substr(2, 9) + '.jpg'
      wx.cloud.uploadFile({
        cloudPath: cloudPath,
        filePath: filePath,
        success: res => {
          resolve(res.fileID)
        },
        fail: err => {
          console.error('Upload failed', err)
          reject(err)
        }
      })
    })
  },

  // Validate form
  validateForm: function () {
    const form = this.data.formData
    const startDateTime = form.startDate && form.startTime ? form.startDate + ' ' + form.startTime : ''
    const endDateTime = form.endDate && form.endTime ? form.endDate + ' ' + form.endTime : ''
    if (!form.title.trim()) {
      util.showToast('请输入活动标题', 'none')
      return false
    }
    if (!form.description.trim()) {
      util.showToast('请输入活动描述', 'none')
      return false
    }
    if (!form.location.trim()) {
      util.showToast('请输入活动地点', 'none')
      return false
    }
    if (!form.startDate) {
      util.showToast('请选择开始日期', 'none')
      return false
    }
    if (!form.startTime) {
      util.showToast('请选择开始时间', 'none')
      return false
    }
    if (!form.endDate) {
      util.showToast('请选择结束日期', 'none')
      return false
    }
    if (!form.endTime) {
      util.showToast('请选择结束时间', 'none')
      return false
    }
    if (util.parseDateTime(startDateTime).getTime() >= util.parseDateTime(endDateTime).getTime()) {
      util.showToast('结束时间必须晚于开始时间', 'none')
      return false
    }
    if (form.fee < 0) {
      util.showToast('费用不能为负数', 'none')
      return false
    }
    return true
  },

  // Submit form
  onSubmit: function () {
    if (!this.validateForm()) return
    if (this.data.submitting) return

    const that = this
    that.setData({ submitting: true })
    util.showLoading('提交中...')

    // Upload cover image first if needed
    const coverPath = that.data.coverImageLocal
    that.uploadCoverImage(coverPath).then(coverUrl => {
      const formData = that.data.formData
      const data = Object.assign({}, formData, {
        startDate: formData.startDate + ' ' + formData.startTime,
        endDate: formData.endDate + ' ' + formData.endTime,
        coverImage: coverUrl || ''
      })
      delete data.startTime
      delete data.endTime

      let promise
      if (that.data.isEdit) {
        promise = api.updateActivity(that.data.activityId, data)
      } else {
        promise = api.createActivity(data)
      }

      return promise
    }).then(res => {
      util.hideLoading()
      that.setData({ submitting: false })
      util.showToast(that.data.isEdit ? '更新成功' : '发布成功', 'success')
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }).catch(err => {
      util.hideLoading()
      that.setData({ submitting: false })
      console.error('Failed to submit activity', err)
      util.showToast('提交失败', 'none')
    })
  }
})
