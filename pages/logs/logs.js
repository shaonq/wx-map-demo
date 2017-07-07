//logs.js
var util = require('../../utils/util.js')
Page({
  data: {
    logs: [],
    time: util.formatTime(new Date())
  },
  onLoad: function () {
    this.setData({
      logs: (wx.getStorageSync('logs') || []).map(function (log) {
        return util.formatTime(new Date(log))
      })
    });
    setInterval( ()=>{
      this.setData({
        time: util.formatTime(new Date())
      })
    },500)
  }
})
