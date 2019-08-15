
const app = getApp()
const banksAccountType = require('../../utils/banksAccountType.js')

Page({
  data: {
    table_view: 'mcta_banks_accounts',
    action: 1000,
    property: '',
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

    if(options.action) {
      this.data.action = options.action
    }

    if (options.property) {
      this.data.property = options.property
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
  },

  onPickerAction: function(e) {
    let index = e.currentTarget.dataset.index
    if(1000 == this.data.action) {
      return
    }

    let model = this.data.dataSources[index]
    var pagesArr = getCurrentPages()
    let _this = this
    wx.navigateBack({
      delta: 1,   //回退前 delta 页面
      success: function (res) {
        let parentPage = pagesArr[pagesArr.length - 2]
        let data = parentPage.data
        data[_this.data.property] = model
        parentPage.setData(data)
      }
    })
  }
})
