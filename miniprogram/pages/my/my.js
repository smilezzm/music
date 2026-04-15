const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activeTab: 'registrations',
    registrations: [],
    favorites: [],
    regPage: 1,
    favPage: 1,
    pageSize: 10,
    regHasMore: true,
    favHasMore: true,
    regLoading: false,
    favLoading: false,
    regEmpty: false,
    favEmpty: false,
    isAdmin: false
  },

  onLoad: function () {
  },

  onShow: function () {
    const app = getApp()
    this.setData({ isAdmin: app.globalData.isAdmin })
    this.loadRegistrations(true)
    this.loadFavorites(true)
  },

  // Switch tab
  onTabChange: function (e) {
    const tab = e.currentTarget.dataset.tab
    this.setData({ activeTab: tab })
  },

  // Load registrations
  loadRegistrations: function (refresh) {
    if (this.data.regLoading) return
    const that = this
    if (refresh) {
      that.setData({ regPage: 1, registrations: [], regHasMore: true })
    }
    that.setData({ regLoading: true })

    api.getMyRegistrations(that.data.regPage, that.data.pageSize).then(res => {
      const newItems = res.data || []
      return util.resolveCloudFileList(newItems, 'activityCover').then(resolvedItems => {
        const allItems = refresh ? resolvedItems : that.data.registrations.concat(resolvedItems)
        that.setData({
          registrations: allItems,
          regPage: that.data.regPage + 1,
          regHasMore: resolvedItems.length >= that.data.pageSize,
          regLoading: false,
          regEmpty: allItems.length === 0
        })
      })
    }).catch(err => {
      console.error('Failed to load registrations', err)
      that.setData({ regLoading: false })
    })
  },

  // Load favorites
  loadFavorites: function (refresh) {
    if (this.data.favLoading) return
    const that = this
    if (refresh) {
      that.setData({ favPage: 1, favorites: [], favHasMore: true })
    }
    that.setData({ favLoading: true })

    api.getMyFavorites(that.data.favPage, that.data.pageSize).then(res => {
      const newItems = res.data || []
      return util.resolveCloudFileList(newItems, 'activityCover').then(resolvedItems => {
        const allItems = refresh ? resolvedItems : that.data.favorites.concat(resolvedItems)
        that.setData({
          favorites: allItems,
          favPage: that.data.favPage + 1,
          favHasMore: resolvedItems.length >= that.data.pageSize,
          favLoading: false,
          favEmpty: allItems.length === 0
        })
      })
    }).catch(err => {
      console.error('Failed to load favorites', err)
      that.setData({ favLoading: false })
    })
  },

  // Navigate to activity detail
  goToDetail: function (e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  },

  // Navigate to admin
  goToAdmin: function () {
    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  },

  onReachBottom: function () {
    if (this.data.activeTab === 'registrations' && this.data.regHasMore) {
      this.loadRegistrations(false)
    } else if (this.data.activeTab === 'favorites' && this.data.favHasMore) {
      this.loadFavorites(false)
    }
  },

  onPullDownRefresh: function () {
    if (this.data.activeTab === 'registrations') {
      this.loadRegistrations(true)
    } else {
      this.loadFavorites(true)
    }
    wx.stopPullDownRefresh()
  },

  onItemCoverError: function (e) {
    const listName = e.currentTarget.dataset.list
    const index = e.currentTarget.dataset.index
    const list = Array.isArray(this.data[listName]) ? this.data[listName].slice() : []

    if (typeof index !== 'number' || !list[index]) {
      return
    }

    list[index].activityCover = '/images/default-goods-image.png'
    this.setData({
      [listName]: list
    })
  }
})
