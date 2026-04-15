const api = require('../../utils/api')
const util = require('../../utils/util')

Page({
  data: {
    activities: [],
    filteredActivities: [],
    searchKeyword: '',
    currentFilter: 'all',
    filters: [
      { key: 'all', text: '全部' },
      { key: 'upcoming', text: '报名中' },
      { key: 'ongoing', text: '进行中' },
      { key: 'ended', text: '已结束' }
    ],
    page: 1,
    pageSize: 10,
    hasMore: true,
    loading: false,
    isAdmin: false,
    isEmpty: false
  },

  onLoad: function () {
    this.loadActivities(true)
  },

  onShow: function () {
    const app = getApp()
    this.setData({ isAdmin: app.globalData.isAdmin })
    // Refresh data on show
    this.loadActivities(true)
  },

  onPullDownRefresh: function () {
    this.loadActivities(true)
  },

  onReachBottom: function () {
    if (this.data.hasMore && !this.data.loading) {
      this.loadActivities(false)
    }
  },

  // Load activities from cloud
  loadActivities: function (refresh) {
    if (this.data.loading) return
    const that = this

    if (refresh) {
      that.setData({ page: 1, activities: [], hasMore: true })
    }

    that.setData({ loading: true })

    const params = {
      page: that.data.page,
      pageSize: that.data.pageSize,
      status: that.data.currentFilter === 'all' ? '' : that.data.currentFilter,
      keyword: that.data.searchKeyword
    }

    api.getActivities(params).then(res => {
      const newActivities = res.data || []
      const allActivities = refresh ? newActivities : that.data.activities.concat(newActivities)
      
      that.setData({
        activities: allActivities,
        filteredActivities: allActivities,
        page: that.data.page + 1,
        hasMore: newActivities.length >= that.data.pageSize,
        loading: false,
        isEmpty: allActivities.length === 0
      })
      wx.stopPullDownRefresh()
    }).catch(err => {
      console.error('Failed to load activities', err)
      that.setData({ loading: false })
      wx.stopPullDownRefresh()
      util.showToast('加载失败', 'none')
    })
  },

  // Search input handler
  onSearchInput: function (e) {
    this.setData({ searchKeyword: e.detail.value })
  },

  // Search confirm handler
  onSearch: function () {
    this.loadActivities(true)
  },

  // Clear search
  onClearSearch: function () {
    this.setData({ searchKeyword: '' })
    this.loadActivities(true)
  },

  // Filter by status
  onFilterChange: function (e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.loadActivities(true)
  },

  // Navigate to activity detail
  onActivityTap: function (e) {
    const id = e.detail.id
    wx.navigateTo({
      url: '/pages/detail/detail?id=' + id
    })
  },

  // Navigate to admin page
  goToAdmin: function () {
    wx.navigateTo({
      url: '/pages/admin/admin'
    })
  },

  // Share
  onShareAppMessage: function () {
    return {
      title: '精彩活动等你来参加！',
      path: '/pages/index/index'
    }
  }
})
