const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    comments_table_view: 'mcta_commentators_comments',
    action_type: {
      n: 1000,
      e: 2000
    },
    status: {
      apply: 1000,
      accept: 2000,
      reject: 3000
    },
    userInfo: {},
    commetatorModel: {},
    commentsDataSources: []
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
      5 >= _this.data.userInfo.userId.length) {
      return
    }

    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      u_id: _this.data.userInfo.userId
    }).get({
      success: function(res) {
        _this.setData({
          commetatorModel: res.data[0]
        })

        if(_this.data.status.reject == res.data[0].status) {
          _this.getRejectDataSources()
        }
      },
      fail: function(err) {
        _this.setData({
          commetatorModel: {}
        })
      }
    })
  },

  // 回绝的说明信息
  getRejectCommentsDataSources: function() {
    const db = wx.cloud.database()
    let c_id = this.data.commetatorModel._id
    let _this = this
    db.collection(this.data.comments_table_view).where({
      c_id: c_id
    }).get({
      success: function(res) {
        _this.setData({
          commentsDataSources: res.data
        })
      },
      fail: function(err) {
        console.log('查询回绝说明失败：' + err)
      }
    })
  },

  // 申请成为解说员
  onVerifyButtonAction: function() {
    wx.navigateTo({
      url: './verify/index?action_type=' + this.data.action_type.n,
    })
  },

  onEditButtonAction: function () {
    wx.navigateTo({
      url: './verify/index?sid=' + this.data.commetatorModel._id + 'action_type=' + this.data.action_type.e,
    })
  }
})
