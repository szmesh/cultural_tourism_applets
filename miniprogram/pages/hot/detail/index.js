
const app = getApp()

Page({
  data: {
    spot_table_view: 'mcta_scenic_spots',
    image_table_view: 'mcta_images',
    item_table_view: 'mcta_scenic_spots_items',
    commentates_table_view: 'mcta_commentators',
    commentates_table_view: 'mcta_commentates',
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
    model: {}
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

    // 景区记录id
    if(options.sid) {
      this.setData({
        sid: options.sid
      })

      // 查询景区详情
      this.getDetail()
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
        if(res && res.data) {
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

  // 查询景区对应的讲解
  getCommentates: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.commentates_table_view).where({

    }).get({
      success: function(res) {

      },
      fail: function(err) {
        
      }
    })
  },

  // 查询讲解员信息
  getCommentators: function() {

  },

  //获取当前滑块的index
  onSwiperChangeAction: function (e) {
    const that = this;
    that.setData({
      currentIndex: e.detail.current
    })
  },

  //点击切换，滑块index赋值
  onTabButtonAction: function (e) {
    const that = this;
    if (that.data.currentIndex === e.target.dataset.index) {
      return false;
    } else {

      that.setData({
        currentIndex: e.target.dataset.index
      })
    }
  }
})
