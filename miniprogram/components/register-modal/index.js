const util = require('../../utils/util')

Component({
  properties: {
    show: {
      type: Boolean,
      value: false
    },
    activity: {
      type: Object,
      value: {}
    },
    lastInfo: {
      type: Object,
      value: null
    }
  },
  data: {
    name: '',
    phone: '',
    wechatId: ''
  },
  methods: {
    onNameInput: function(e) {
      this.setData({ name: e.detail.value })
    },
    onPhoneInput: function(e) {
      this.setData({ phone: e.detail.value })
    },
    onWechatIdInput: function(e) {
      this.setData({ wechatId: e.detail.value })
    },
    onQuickFill: function() {
      var info = this.properties.lastInfo
      if (info) {
        this.setData({
          name: info.name || '',
          phone: info.phone || '',
          wechatId: info.wechatId || ''
        })
      }
    },
    onClose: function() {
      this.setData({ name: '', phone: '', wechatId: '' })
      this.triggerEvent('close')
    },
    onSubmit: function() {
      var name = this.data.name.trim()
      var phone = this.data.phone.trim()
      var wechatId = this.data.wechatId.trim()

      if (!name) {
        util.showToast('请输入姓名')
        return
      }
      if (!util.validatePhone(phone)) {
        util.showToast('请输入正确的手机号')
        return
      }
      if (!wechatId) {
        util.showToast('请输入微信号')
        return
      }

      this.triggerEvent('submit', {
        name: name,
        phone: phone,
        wechatId: wechatId
      })
    },
    preventBubble: function() {
      // Prevent tap events from bubbling to the overlay
    }
  }
})
