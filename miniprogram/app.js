// app.js
const config = require('./utils/config')

App({
  onLaunch: function () {
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
      return
    }
    wx.cloud.init({
      env: config.CLOUD_ENV,
      traceUser: true
    })
    // Check login status
    this.checkLoginStatus()
  },

  globalData: {
    env: config.CLOUD_ENV,
    userInfo: null,
    openId: null,
    isAdmin: false,
    isLoggedIn: false,
    // Cache last registration info for quick fill
    lastRegistrationInfo: null
  },

  // Check and restore login status
  checkLoginStatus: function () {
    const that = this
    // Try to restore from storage
    try {
      const userInfo = wx.getStorageSync('userInfo')
      const openId = wx.getStorageSync('openId')
      const isAdmin = wx.getStorageSync('isAdmin')
      const lastRegInfo = wx.getStorageSync('lastRegistrationInfo')
      if (openId) {
        that.globalData.openId = openId
        that.globalData.isLoggedIn = true
      }
      if (userInfo) {
        that.globalData.userInfo = userInfo
      }
      if (isAdmin) {
        that.globalData.isAdmin = isAdmin
      }
      if (lastRegInfo) {
        that.globalData.lastRegistrationInfo = lastRegInfo
      }
    } catch (e) {
      console.error('Failed to restore login status', e)
    }
    // Get OpenID from cloud
    this.getOpenId()
  },

  // Get OpenID
  getOpenId: function () {
    const that = this
    return new Promise((resolve, reject) => {
      if (that.globalData.openId) {
        resolve(that.globalData.openId)
        return
      }
      wx.cloud.callFunction({
        name: 'user',
        data: { type: 'getOpenId' }
      }).then(res => {
        const openId = res.result.openId
        that.globalData.openId = openId
        that.globalData.isLoggedIn = true
        wx.setStorageSync('openId', openId)
        // Check admin status
        that.checkAdminStatus(openId)
        resolve(openId)
      }).catch(err => {
        console.error('Failed to get OpenID', err)
        reject(err)
      })
    })
  },

  // Check admin status
  checkAdminStatus: function (openId) {
    const that = this
    wx.cloud.callFunction({
      name: 'user',
      data: { type: 'checkAdmin' }
    }).then(res => {
      const isAdmin = res.result.isAdmin
      that.globalData.isAdmin = isAdmin
      wx.setStorageSync('isAdmin', isAdmin)
    }).catch(err => {
      console.error('Failed to check admin status', err)
    })
  },

  // Save last registration info for quick fill
  saveLastRegistrationInfo: function (info) {
    this.globalData.lastRegistrationInfo = info
    wx.setStorageSync('lastRegistrationInfo', info)
  },

  // Get last registration info
  getLastRegistrationInfo: function () {
    return this.globalData.lastRegistrationInfo
  }
})
