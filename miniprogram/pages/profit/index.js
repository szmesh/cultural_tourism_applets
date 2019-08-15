
const app = getApp()
const util = require('../../utils/util.js')
const recordDetailStatus = require('../../utils/recordDetailStatus.js')

Page({
  data: {
    table_view: 'mcta_profit_records',
    userTableView: 'mcta_users',
    approval_table_view: 'mcta_profit_records_approval',
    status: recordDetailStatus.status,
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
      this.getCrDataSourcese()
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
          totalDr += parseFloat(item.profit)
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
        let sidArray = []
        dataSources.forEach(item => {
          item.time_local = util.timestampParse(item.time)
          item.p_type_name = app.getProfitTypeName(item.p_type)
          sidArray.push(item._id)
        })

        _this.setData({
          crDataSources: dataSources,
        })

        _this.getApprovalDataSources(sidArray)
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

  // 查询提现申请的审批情况
  getApprovalDataSources: function (sidArray) {
    let _this = this
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(_this.data.approval_table_view).where({
      s_id: _.in(sidArray)
    }).get({
      success: function (res) {
        let approvalDataSources = res.data
        let crDataSources = _this.data.crDataSources
        let totalCr = 0
        crDataSources.forEach(apply => {
          approvalDataSources.forEach(approval => {
            if (approval.s_id === apply._id) {
              apply.approval = approval
            }
          })

          if (apply.approval) {
            if (_this.data.status.reject !== parseInt(apply.approval.type)) {
              totalCr += parseFloat(apply.profit)
            }
          } else {
            totalCr += parseFloat(apply.profit)
          }
        })

        _this.setData({
          crDataSources: crDataSources,
          totalCr: totalCr
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '查询提现审批失败',
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
  },

  onCashButtonAction: function() {
    let left = this.data.totalDr - this.data.totalCr
    if (0.1 >= left) {
      wx.showToast({
        title: '小于1元无法提现喔',
        icon: 'fail'
      })
      return
    }

    // 根据不同类型的分成，设置不同的收益人信息
    let t_id = this.data.sid
    let t_name = this.data.userInfo.nickName
    let t_icon = this.data.userInfo.avatarUrl
    if (app.globalData.profitPercentType.platform === this.data.type) {
      t_id = this.data.type
      t_name = app.getProfitTypeName(this.data.type)
      t_icon = ''
    }

    if (app.globalData.profitPercentType.manager === this.data.type) {
      t_id = this.data.type
      t_name = app.getProfitTypeName(this.data.type)
      t_icon = ''
    }

    if (app.globalData.profitPercentType.spot === this.data.type) {
      t_id = this.data.sid
      t_name = ''
      t_icon = ''
    }

    let queryParams = 'f_id=' + this.data.userInfo.userId +
      '&f_name=' + this.data.userInfo.nickName +
      '&f_icon=' + this.data.userInfo.avatarUrl +
      '&t_id=' + t_id +
      '&t_name=' + t_name +
      '&t_icon=' + t_icon +
      '&leftProfit=' + left
    wx.navigateTo({
      url: '../withdrawals/index?' + queryParams,
    })
  },

  onApprovalDetailAction: function (e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: '../withdrawals/approval/index?sid=' + sid + '&status=' + this.data.status.view
    })
  }
})
