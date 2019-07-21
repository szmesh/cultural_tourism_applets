const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    comments_table_view: 'mcta_commentators_comments',
    album_table_view: 'mcta_albums',
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
    commentsDataSources: [],
    albumsDataSources: []
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
        if(res.data && 0 < res.data.length) {
          _this.setData({
            commetatorModel: res.data[0]
          })

          // 已认证就查询当前用户的专辑
          if (_this.data.status.accept == res.data[0].status) {
            _this.getAlbumsDataSources()
          }

          // 如果是回绝就查询回绝说明
          if (_this.data.status.reject == res.data[0].status) {
            _this.getRejectCommentsDataSources()
          }
        }
      },
      fail: function(err) {
        _this.setData({
          commetatorModel: {}
        })
      }
    })
  },

  // 查询当前用户的专辑
  getAlbumsDataSources: function() {
    let db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.album_table_view).where({
      _openid: _this.data.userInfo.openid
    }).get({
      success: function(res) {
        if(res && res.data) {
          _this.setData({
            albumsDataSources: res.data
          })
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '查询用户专辑出错',
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
        // 转时间戳
        let data = res.data
        data.forEach(function(item) {
          let st = item.time
          let date = _this.formatDataWithTimeStamp(st)
          item.date = date
        })

        _this.setData({
          commentsDataSources: data
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
      url: './verify/index?sid=' + this.data.commetatorModel._id + '&action_type=' + this.data.action_type.e,
    })
  },

  // 时间戳转日期
  formatDataWithTimeStamp: function(st) {
    let d = new Date(st)
    var date = (d.getFullYear()) + "/" +
      (d.getMonth() + 1) + "/" +
      (d.getDate()) + " " +
      (d.getHours()) + ":" +
      (d.getMinutes()) + ":" +
      (d.getSeconds());
    return date
  },

  // 添加专辑
  onAddAlbumButtonAction: function() {
    wx.navigateTo({
      url: 'albums/index',
    })
  }
})
