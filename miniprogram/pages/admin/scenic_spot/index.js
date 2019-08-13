const app = getApp()

Page({
  data: {
    table_view: 'mcta_scenic_spots',
    scenicSpots: []
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    this.getScenicSpots()
  },

  // 获取景区列表数据
  getScenicSpots: function () {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    const db = wx.cloud.database()
    let _this = this

    // 先查询有没有数据
    db.collection(_this.data.table_view).get({
      success: res => {
        if (0 < res.data.length) {
          _this.setData({
            scenicSpots: res.data
          })
        } else {
          _this.setData({
            scenicSpots: []
          })
        }
        wx.hideToast()
      },
      fail: err => {
        _this.setData({
          scenicSpots: []
        })
        wx.hideToast()
      }
    })
  },

  // 跳转到新增界面
  onAddButtonAction: function() {
    wx.navigateTo({
      url: './add/index',
    })
  },

  // 编辑景区
  onEditButtonAction: function(e) {
    wx.navigateTo({
      url: './add/index?spotId=' + e.currentTarget.dataset.sid,
    })
  },

  onDeleteButtonAction: function(e) {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    const db = wx.cloud.database()
    let sid = e.currentTarget.dataset.sid

    // 先查询有没有数据
    db.collection(_this.data.table_view).doc(sid).remove({
      success: res => {
        wx.hideToast()
        wx.showToast({
          title: '删除成功',
          duration: 2000
        })

        this.getScenicSpots()
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    })
  },

  onAddItemButtonAction: function (e) {
    wx.navigateTo({
      url: './items/index?spotId=' + e.currentTarget.dataset.sid,
    })
  },

  onAddBannerButtonAction: function (e) {
    wx.navigateTo({
      url: './banners/index?spotId=' + e.currentTarget.dataset.sid,
    })
  }
})
