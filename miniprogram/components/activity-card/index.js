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
    defaultCover: '/images/default-cover.png'
  },
  observers: {
    'activity': function(activity) {
      if (!activity || !activity._id) return
      const status = util.getActivityStatus(activity.startDate, activity.endDate)
      this.setData({
        statusText: util.getStatusText(status),
        statusClass: 'status-' + status,
        timeRange: util.formatDate(new Date(activity.startDate)) + ' ~ ' + util.formatDate(new Date(activity.endDate))
      })
    }
  },
  methods: {
    onTap: function() {
      this.triggerEvent('tap', { id: this.properties.activity._id })
    }
  }
})
