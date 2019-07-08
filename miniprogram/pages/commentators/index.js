const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    userInfo: {},
    commetatorModel: {}
  },

  onLoad: function () {
let _this = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      // 查询已经是解说员
      _this.checkCommentators()
    }
  },

  checkCommentators: function() {
    let _this = this

    if(undefined == _this.data.userInfo.userId ||
    5 >= _this.data.userId.userId.length) {
      return
    }

    const db = wx.cloud.database
    db.collection(_this.data.table_view).where({
      u_id: _this.data.userId.userId
    }).get({
      success: function(res) {
        _this.setData({
          commetatorModel: res.data
        })
      },
      fail: function(err) {
        _this.setData({
          commetatorModel: {}
        })
      }
    })
  },

// 申请成为解说员
onVerifyButtonAction: function() {
wx.navigateTo({
  url: './verify/index',
})
}
})
