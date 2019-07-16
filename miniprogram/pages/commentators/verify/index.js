const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    userInfo: {},
    model: {
      name: '',
      openid: '',
      gender: 3,
      img: ''
    }
  },

  onLoad: function (options) {
    if (undefined != options.sid && 0 < options.sid.length) {
      this.setData({
        sid: options.sid
      })
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }

    // 判断是否是编辑
    if(undefined == this.data.sid || 0 >= this.data.sid.length) {
      return
    }

    // 获取数据
    this.getDetail()
  },

  // 根据给的记录id，查询对应记录的详情
  getDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(_this.data.sid).get({
      success: function(res) {
        _this.setData({
          model: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '没找到对应数据',
          duration: 2000
        })
      }
    })
  },

  onSaveButtonAction: function() {
    
  }
})
