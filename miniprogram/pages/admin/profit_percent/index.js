
const app = getApp()

Page({
  data: {
    table_view: 'mcta_profit_percents',
    dataSources: [],
    status: {
      work: 2000,
      normal: 1000
    }
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    // 查询列表
    this.getDataSources()
  },

  getDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      status: _this.data.status.work
    }).get({
      success: function(res) {
        if(res && res.data) {
          _this.setData({
            dataSources: res.data
          })
        } else {
          _this.setData({
            dataSources: []
          })
        }
      },
      fail: function(err) {
        wx.showToast({
          title: '查询分销列表失败',
          icon: 'fail',
          duration: 2000
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  onEditButtonAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: 'add/index?sid=' + sid + '&index=' + index,
    })
  },

  onDeleteButtonAction: function (e) {

  },

  onAddScopeButtonAction: function (e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: 'scope/index?sid=' + sid,
    })
  },

  onAddItemButtonAction: function (e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: 'items/index?sid=' + sid,
    })
  },

  onAddButtonAction: function() {
    wx.navigateTo({
      url: 'add/index',
    })
  }
})
