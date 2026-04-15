const util = require('../../utils/util')

Component({
  properties: {
    activity: {
      type: Object,
      value: {}
    }
  },
  data: {
    statusText: '',
    statusClass: '',
    timeRange: '',
    defaultCover: '/images/default-goods-image.png',
    displayCover: '/images/default-goods-image.png'
  },
  observers: {
    'activity': function(activity) {
      if (!activity || !activity._id) {
        this.setData({
          displayCover: this.data.defaultCover
        })
        return
      }
      const status = util.getActivityStatus(activity.startDate, activity.endDate)
      this.setData({
        statusText: util.getStatusText(status),
        statusClass: 'status-' + status,
        timeRange: util.formatDateTimeRange(activity.startDate, activity.endDate),
        displayCover: activity.coverImage || this.data.defaultCover
      })
    }
  },
  methods: {
    onTap: function() {
      this.triggerEvent('activitytap', { id: this.properties.activity._id })
    },

    onCoverError: function() {
      if (this.data.displayCover !== this.data.defaultCover) {
        this.setData({
          displayCover: this.data.defaultCover
        })
      }
    }
  }
})
