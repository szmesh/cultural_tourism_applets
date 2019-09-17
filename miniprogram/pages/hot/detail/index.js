const app = getApp()

Page({
  data: {
    spot_table_view: 'mcta_scenic_spots',
    image_table_view: 'mcta_images',
    item_table_view: 'mcta_scenic_spots_items',
    albums_table_view: 'mcta_albums',
    commentators_table_view: 'mcta_commentators',
    banner_properties: {
      indicatorDots: true,
      vertical: false,
      autoplay: true,
      circular: false,
      interval: 3000,
      duration: 500,
      previousMargin: 0,
      nextMargin: 0,
    },
    currentIndex: 0,
    userInfo: {},
    model: {},
    albumsDataSources: [],
    commentatorsIdArray: [],
    commentatorsDataSources: [],
    purchasedAlbums: []
  },

  onLoad: function(options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }
    if (!options || !options.sid) {
      wx.reLaunch({
        url: '../index',
      })
    }
    // 景区记录id
    if (options.sid) {
      this.setData({
        sid: options.sid
      })
      // 查询景区详情
      this.getDetail()
      this.getPurchasedList()
    } 

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  getDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.spot_table_view).doc(_this.data.sid).get({
      success: function(res) {
        if (res && res.data && res.data._id) {
          _this.data.model = res.data
          _this.getImagesSetForSpot()
          _this.getAlbums()
          // 设置界面标题
          wx.setNavigationBarTitle({
            title: _this.data.model.name
          })
        } else {
          _this.setData({
            model: {}
          })
        }
      },
      fail: function(err) {
        _this.setData({
          model: {}
        })

        wx.showToast({
          title: '没有找到记录的详情',
          duration: 2000
        })
      }
    })
  },

  // 查询景区的图片集
  getImagesSetForSpot() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.image_table_view).where({
      s_id: _this.data.sid,
      type: 2000
    }).get({
      success: res => {
        if (res && res.data) {
          let model = _this.data.model
          model.imagesDataSources = res.data

          _this.setData({
            model: model
          })

          _this.getItemsSetForSpot()
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  // 查询景区的讲解点集
  getItemsSetForSpot() {
    let _this = this
    let db = wx.cloud.database()
    db.collection(_this.data.item_table_view).where({
      s_id: _this.data.sid
    }).get({
      success: res => {
        if (res && res.data) {
          let model = _this.data.model
          model.itemsDataSources = res.data

          _this.setData({
            model: model
          })
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },

  // 查询景区对应的专辑
  getAlbums: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.albums_table_view).where({
      s_id: _this.data.sid
    }).get({
      success: function(res) {
        if (res && res.data) {
          _this.data.albumsDataSources = res.data
          if (_this.data.purchasedAlbums.length > 0) {
            _this.remarkAlbumPurchased()
          }
          let commentatorsIdArray = []
          for (let i = 0; i < _this.data.albumsDataSources.length; i++) {
            let album = _this.data.albumsDataSources[i]
            let copenid = album._openid
            if (commentatorsIdArray.indexOf(copenid) == -1) {
              commentatorsIdArray.push(copenid);
            }
          }

          _this.data.commentatorsIdArray = commentatorsIdArray
          _this.getCommentators()
        } else {
          _this.data.albumsDataSources = []
          _this.data.commentatorsIdArray = []
        }
      },
      fail: function(err) {
        _this.data.albumsDataSources = []
        _this.data.commentatorsIdArray = []
      }
    })
  },

  // 查询讲解员信息
  getCommentators: function() {
    let _this = this
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(_this.data.commentators_table_view).where({
      _openid: _.in(_this.data.commentatorsIdArray)
    }).get({
      success: function(res) {
        if (res && res.data) {
          _this.setData({
            commentatorsDataSources: res.data
          })
          _this.resetCommentatorsDataSources()
        } else {
          _this.setData({
            commentatorsDataSources: []
          })
        }
      },
      fail: function(err) {
        _this.setData({
          commentatorsDataSources: []
        })
      }
    })
  },

  // 将专辑和导游关联一起
  resetCommentatorsDataSources: function() {
    let _this = this
    let commentatorsDataSources = _this.data.commentatorsDataSources
    commentatorsDataSources.forEach(commentator => {
      _this.data.albumsDataSources.forEach(album => {
        if (album._openid == commentator._openid) {
          if (commentator.albums) {
            commentator.albums.push(album)
          } else {
            commentator.albums = []
            commentator.albums.push(album)
          }
        }
      })
    })

    _this.setData({
      commentatorsDataSources: commentatorsDataSources
    })
  },

  //获取当前滑块的index
  onSwiperChangeAction: function(e) {
    const that = this;
    that.setData({
      currentIndex: e.detail.current
    })
  },

  //点击切换，滑块index赋值
  onTabButtonAction: function(e) {
    const that = this;
    if (that.data.currentIndex === e.target.dataset.index) {
      return false;
    } else {

      that.setData({
        currentIndex: e.target.dataset.index
      })
    }
  },

  onCommentatorsDetailAction: function(e) {
    let index = e.currentTarget.dataset.index
    let commentatorModel = this.data.commentatorsDataSources[index]
    wx.navigateTo({
      url: '../../commentators/detail/index?sid=' + this.data.sid +
        '&cid=' + commentatorModel._id +
        '&aid=' + commentatorModel.albums[0]._id +
        '&bought=' + commentatorModel.albums[0].purchased,
    })
  },
  // 查询已购列表
  getPurchasedList(sid) {
    const db = wx.cloud.database()
    db.collection('mcta_trade_records').where({
      openid: app.globalData.userInfo.openid
    }).get({
      success: res => {
        this.data.purchasedAlbums = res.data
        if (this.data.albumsDataSources.length > 0) {
          this.remarkAlbumPurchased()
        }
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 标注一下已经购买的的专辑
  remarkAlbumPurchased() {
    for (let album of this.data.albumsDataSources) {
      for (let item of this.data.purchasedAlbums) {
        if (album._id == item.album_id) {
          album['purchased'] = true
          break
        }
      }
    }
    this.setData({
      albumsDataSources: this.data.albumsDataSources
    })
  },
  // 点击购买
  onPurchaseAction(e) {
    if (!app.globalData.isLogin) {
      app.loginSuggest()
      return
    }
    const index = e.currentTarget.dataset.index
    const commentatorModel = this.data.commentatorsDataSources[index]
    var purchaseData = {
      price: commentatorModel.albums[0].price,
      a_id: commentatorModel.albums[0]._id,
      a_name: commentatorModel.albums[0].name,
      s_id: commentatorModel.albums[0].s_id,
      s_name: commentatorModel.albums[0].s_name,
      a_icon: this.data.model.imagesDataSources[0].url,
      f_id: app.globalData.userInfo.openid,
      f_name: app.globalData.userInfo.nickName,
      f_icon: app.globalData.userInfo.avatarUrl,
      coupon: 0
    }
    console.log(purchaseData)
    // 调用统一支付接口完成购买
    // app.unitedPayRequest(purchaseData,commentatorModel.albums[0].price)
    app.unitedPayRequest(purchaseData, purchaseData.price)
  }
})