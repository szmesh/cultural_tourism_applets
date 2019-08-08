
const app = getApp()

Page({
  data: {
    table_view: 'mcta_albums',
    spots_table_view: 'mcta_scenic_spots',
    commentator_table_view: 'mcta_commentators',
    commentate_table_view: 'mcta_commentates',
    comment_table_view: '',
    innerAudioContext: undefined,
    playing_sid: '',
    userInfo: {},
    commentatorModel: {},
    albumModel: {},
    commentatesDataSources: [],
    commentsDataSource: []
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }

    // 景区id
    if (options.sid) {
      this.setData({
        sid: options.sid
      })
    }

    // 导游id
    if (options.cid) {
      this.setData({
        cid: options.cid
      })
    }

    // 专辑id
    if (options.aid) {
      this.setData({
        aid: options.aid
      })
    }

    // 设置音频回调
    this.data.innerAudioContext = wx.createInnerAudioContext()

    this.data.innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    this.data.innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })

    if (this.data.cid) {
      this.getCommentatorModel()
    }
  },

  // 查找导游的个人信息
  getCommentatorModel: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.commentator_table_view).doc(_this.data.cid).get({
      success: function(res) {
        if(res && res.data) {
          _this.setData({
            commentatorModel: res.data
          })

          // 只有查询到有效的导游信息后才查询专辑信息
          _this.getAlbumModel()
          _this.getCommentatesDataSource()
        } else {
          _this.setData({
            commentatorModel: {}
          })
        }
      },
      fail: function(err) {
        _this.setData({
          commentatorModel: {}
        })
      }
    })
  },

  // 查询专辑信息
  getAlbumModel: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.table_view).doc(_this.data.aid).get({
      success: function(res) {
        if(res && res.data) {
          _this.setData({
            albumModel: res.data
          })
        } else {
          _this.setData({
            albumModel: {}
          })
        }
      },
      fail: function(err) {
        _this.setData({
          albumModel: {}
        })
      }
    })
  },

  //查询专辑下的讲解列表
  getCommentatesDataSource: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.commentate_table_view).where({
      s_id: _this.data.aid
    }).get({
      success: function(res) {
        if(res && res.data) {
          let dataSources = res.data
          let map = {}
          for (i = 0; i < dataSources.length; i++) {
            let cmodel = dataSources[i]
            if (map[cmodel.i_id]) {
              map[cmodel.i_id].data.push(cmodel)
            } else {
              map[cmodel.i_id] = {
                i_id: cmodel.i_id,
                i_name: cmodel.i_name,
                data: [cmodel]
              }
            }
          }

          let commentatesDataSources = []
          for (k in map) {
            commentatesDataSources.push(map[k])
          }

          _this.setData({
            commentatesDataSources: commentatesDataSources
          })
        } else {
          _this.setData({
            commentatesDataSources: []
          })
        }
      },
      fail: function(err) {
        _this.setData({
          commentatesDataSources: []
        })
      }
    })
  },

  getCommentsDataSource: function() {

  },

  // 播放讲解
  playAudio: function (e) {
    let playing_sid = e.currentTarget.dataset.playingsid
    let src = e.currentTarget.dataset.src
    if (this.data.playing_sid && this.data.playing_sid.length) {
      this.data.innerAudioContext.pause()
      this.setData({
        playing_sid: ''
      })
    } else {
      if (this.data.innerAudioContext.src != src) {
        this.data.innerAudioContext.destroy()
        this.data.innerAudioContext = wx.createInnerAudioContext()
        this.data.innerAudioContext.src = src
      }

      this.data.innerAudioContext.play()
      this.setData({
        playing_sid: playing_sid
      })
    }
  },
})