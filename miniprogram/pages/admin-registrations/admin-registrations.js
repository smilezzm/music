const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activityId: '',
    activityTitle: '',
    registrations: [],
    totalCount: 0,
    page: 1,
    pageSize: 20,
    hasMore: true,
    loading: false,
    exporting: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        activityId: options.id,
        activityTitle: decodeURIComponent(options.title || '活动')
      })
      wx.setNavigationBarTitle({ title: this.data.activityTitle + ' - 报名名单' })
      this.loadRegistrations(true)
    }
  },

  loadRegistrations: function (refresh) {
    if (this.data.loading) return
    const that = this
    if (refresh) {
      that.setData({ page: 1, registrations: [], hasMore: true })
    }
    that.setData({ loading: true })

    api.getRegistrations(that.data.activityId, that.data.page, that.data.pageSize).then(res => {
      const newItems = res.data || []
      const allItems = refresh ? newItems : that.data.registrations.concat(newItems)
      that.setData({
        registrations: allItems,
        totalCount: res.total || allItems.length,
        page: that.data.page + 1,
        hasMore: newItems.length >= that.data.pageSize,
        loading: false
      })
    }).catch(err => {
      console.error('Failed to load registrations', err)
      that.setData({ loading: false })
      util.showToast('加载失败', 'none')
    })
  },

  // Export to Excel
  onExport: function () {
    const that = this
    if (that.data.exporting) return
    that.setData({ exporting: true })
    util.showLoading('导出中...')

    api.exportRegistrations(that.data.activityId).then(res => {
      util.hideLoading()
      that.setData({ exporting: false })
      if (res.fileID) {
        // Download and save
        wx.cloud.downloadFile({
          fileID: res.fileID,
          success: function (downloadRes) {
            wx.openDocument({
              filePath: downloadRes.tempFilePath,
              fileType: 'xlsx',
              success: function () {
                console.log('Document opened')
              },
              fail: function () {
                // If can't open, save to file manager
                wx.saveFileToDisk({
                  filePath: downloadRes.tempFilePath,
                  success: function () {
                    util.showToast('保存成功', 'success')
                  },
                  fail: function () {
                    util.showToast('请长按文件保存', 'none')
                  }
                })
              }
            })
          },
          fail: function (err) {
            console.error('Download failed', err)
            util.showToast('下载失败', 'none')
          }
        })
      } else {
        util.showToast('导出失败', 'none')
      }
    }).catch(err => {
      util.hideLoading()
      that.setData({ exporting: false })
      console.error('Failed to export', err)
      util.showToast('导出失败', 'none')
    })
  },

  // Call phone
  onCallPhone: function (e) {
    const phone = e.currentTarget.dataset.phone
    wx.makePhoneCall({
      phoneNumber: phone,
      fail: function () {}
    })
  },

  // Copy wechat ID
  onCopyWechat: function (e) {
    const wechatId = e.currentTarget.dataset.wechat
    wx.setClipboardData({
      data: wechatId,
      success: function () {
        util.showToast('已复制微信号', 'success')
      }
    })
  },

  onReachBottom: function () {
    if (this.data.hasMore) {
      this.loadRegistrations(false)
    }
  },

  onPullDownRefresh: function () {
    this.loadRegistrations(true)
    wx.stopPullDownRefresh()
  }
})
