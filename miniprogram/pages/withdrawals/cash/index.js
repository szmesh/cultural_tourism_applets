
const app = getApp()
const util = require('../../../utils/util.js')
const recordDetailStatus = require('../../../utils/recordDetailStatus.js')

Page({
  data: {
    table_view: 'mcta_profit_records',
    approval_table_view: 'mcta_profit_records_approval',
    status: recordDetailStatus.status,
    profitType: {},
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
    }

    if (app.globalData.profitType) {
      this.setData({
        profitType: app.globalData.profitType
      })
    }
    
    this.getDataSources()
  },

  getDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
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
          dataSources: dataSources
        })

        _this.getApprovalDataSources(sidArray)
      },
      fail: function (err) {
        wx.showToast({
          title: '查询提现申请失败',
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  getApprovalDataSources: function(sidArray) {
    let _this = this
    const db = wx.cloud.database()
    const _ = db.command
    db.collection(_this.data.approval_table_view).where({
      s_id: _.in(sidArray)
    }).get({
      success: function (res) {
        let approvalDataSources = res.data
        let dataSources = _this.data.dataSources
        dataSources.forEach(apply => {
          approvalDataSources.forEach(approval => {
            if (approval.s_id === apply._id) {
              apply.approval = approval
            }
          })
        })

        _this.setData({
          dataSources: dataSources
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '查询提现审批失败',
        })
      }
    })
  },

  onApprovalButtonAction: function(e) {
    let status = e.currentTarget.dataset.status
    let sid = e.currentTarget.dataset.sid
    let index = e.currentTarget.dataset.index
    wx.navigateTo({
      url: '../approval/index?sid=' + sid + '&status=' + status + '&index=' + index
    })
  }
})
