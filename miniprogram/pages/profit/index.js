
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    table_view: 'mcta_profit_records',
    userTableView: 'mcta_users',
    totalDr: 0,
    totalCr: 0,
    currentIndex: 0,
    drDataSources: [],
    crDataSources: [],
    subUsersDataSources: [],
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

    if(options.sid) {
      this.setData({
        sid: options.sid
      })
    }

    if (options.type) {
      this.setData({
        type: options.type
      })
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

    if(this.data.sid && this.data.type) {
      this.getSubUsersDataSources()
      this.getDrDataSourcese()
    }
  },

  // 查询收益列表
  getDrDataSourcese: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      t_id: _this.data.sid,
      type: _this.data.profitType.dr
    }).get({
      success: function(res) {
        let dataSources = res.data
        let totalDr = 0
        dataSources.forEach(item => {
          item.time_local = util.timestampParse(item.time)
          item.p_type_name = app.getProfitTypeName(item.p_type)
          totalDr += item.profit
        })

        _this.setData({
          drDataSources: dataSources,
          totalDr: totalDr
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '查询收入明细失败',
        })

        _this.setData({
          drDataSources: [],
          totalDr: 0
        })
      }
    })
  },

  getCrDataSourcese: function () {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      t_id: _this.data.sid,
      type: _this.data.profitType.cr
    }).get({
      success: function (res) {
        let dataSources = res.data
        let totalCr = 0
        dataSources.forEach(item => {
          item.time_local = util.timestampParse(item.time)
          item.p_type_name = app.getProfitTypeName(item.p_type)
          totalCr += item.profit
        })

        _this.setData({
          crDataSources: dataSources,
          totalCr: totalCr
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '查询收入明细失败',
        })

        _this.setData({
          crDataSources: [],
          totalCr: 0
        })
      }
    })
  },

  // 查询下级用户
  getSubUsersDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.userTableView).where({
      parentId: _this.data.sid
    }).get({
      success: function(res) {
        _this.setData({
          subUsersDataSources: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '查询下级用户失败',
        })

        _this.setData({
          subUsersDataSources: []
        })
      }
    })
  },

  onTabButtonAction: function(e) {
    const that = this
    if (that.data.currentIndex === e.target.dataset.index) {
      return
    } else {
      that.setData({
        currentIndex: e.target.dataset.index
      })
    }
  },

  onSwiperChangeAction: function(e) {
    const that = this;
    that.setData({
      currentIndex: e.detail.current
    })
  }
})
