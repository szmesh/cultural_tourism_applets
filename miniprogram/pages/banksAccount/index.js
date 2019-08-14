
const app = getApp()
const banksAccountType = require('../../utils/banksAccountType.js')

Page({
  data: {
    table_view: 'mcta_banks_accounts',
    userInfo: {},
    dataSources: []
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

      this.getDataSources()
    }
  },

  getDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      s_id: _this.data.userInfo.userId
    }).get({
      success: function(res) {
        let dataSources = res.data
        dataSources.forEach(item => {
          item.type_name = banksAccountType.getTypeName(item.type)
        })

        _this.setData({
          dataSources: dataSources
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '获取当前用户的收款帐户失败',
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  onAddButtonAction: function() {
    wx.navigateTo({
      url: 'add/index',
    })
  }
})
