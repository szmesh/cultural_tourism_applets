const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    table_view: 'mcta_commentators',
    comments_table_view: 'mcta_commentators_comments',
    album_table_view: 'mcta_albums',
    commentates_table_view: 'mcta_commentates',
    innerAudioContext: undefined,
    playingSID: '',
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
    albumsDataSources: [],
  },

  onLoad: function () {
    let _this = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      // 设置音频回调
      this.data.innerAudioContext = wx.createInnerAudioContext()

      this.data.innerAudioContext.onPlay(() => {
        console.log('开始播放')
      })
      this.data.innerAudioContext.onError((res) => {
        console.log(res.errMsg)
        console.log(res.errCode)
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

          _this.getCommentatesDataSource()
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '查询用户专辑出错',
        })
      }
    })
  },

  // 查询当前用户所有的讲解记录
  getCommentatesDataSource: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.commentates_table_view).where({
      _openid: _this.data.userInfo.openid
    }).get({
      success: function(res) {
        if(res && res.data) {
          let commentatesDataSource = res.data
          _this.resetAlbumsDataSourcesWithCommentates(commentatesDataSource)
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '查询讲解记录出错',
        })
      }
    })
  },

  // 根据讲解记录重置专辑数据
  resetAlbumsDataSourcesWithCommentates: function (commentatesDataSource) {
    let albumsDataSources = this.data.albumsDataSources
    albumsDataSources.forEach(a => {
      commentatesDataSource.forEach(c => {
        if (a._id == c.s_id) {
          if (a.commentates) {
            a.commentates.push(c)
          } else {
            a.commentates = []
            a.commentates.push(c)
          }
        }
      })
    })

    this.setData({
      albumsDataSources: albumsDataSources
    })
  },

  // 播放讲解
  playAudio: function(e) {
    let aIndex = e.currentTarget.dataset.aindex
    let cIndex = e.currentTarget.dataset.cindex
    let albumModel = this.data.albumsDataSources[aIndex]
    let commentatesModel = albumModel.commentates[cIndex]
    if(this.data.playingSID) {
      this.data.innerAudioContext.pause()
      this.setData({
        playingSID: ''
      })
    } else {
      if (this.data.innerAudioContext.src != commentatesModel.src) {
        this.data.innerAudioContext.destroy()
        this.data.innerAudioContext = wx.createInnerAudioContext()
        this.data.innerAudioContext.src = commentatesModel.src
      }

      this.data.innerAudioContext.play()
      this.setData({
        playingSID: commentatesModel._id
      })
    }
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
          let date = util.timestampParse(st)
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

  // 添加专辑
  onAddAlbumButtonAction: function() {
    wx.navigateTo({
      url: 'albums/index',
    })
  },

  // 添加讲解
  onAddCommentatesButtonAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    let s_id = e.currentTarget.dataset.spotid
    wx.navigateTo({
      url: 'comentates/index?sid=' + sid + '&s_id=' + s_id,
    })
  }
})
