
const app = getApp()

Page({
  data: {
    table_view: 'mcta_scenic_spots',
    dataSources: [],
    profitType: {},
    userInfo: {},
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }

    if (app.globalData.profitType) {
      this.setData({
        profitType: app.globalData.profitType
      })
    }

    this.getDataSources()
  },

  // 查询景区
  getDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).get({
      success: function(res) {
        _this.setData({
          dataSources: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '查询景区失败',
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  onProfitButtonAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: '../index?sid=' + sid + '&type=-2000',
    })
  }
})
