
const app = getApp()
const util = require('../../utils/util.js')

Page({
  data: {
    table_view: 'mcta_profit_records',
    profitType: {},
    userInfo: {},
    banksAccountModel: {},
    model: {
      order_id: '', //订单的ID
      w_id: '', //微信订单ID
      a_id: '', //专辑id
      a_name: '', //专辑名
      a_icon: '', //专辑封面
      f_id: '', //下订单的人id
      f_name: '', //下单人名字
      f_icon: '', //下单人的头像
      t_id: '', //收益人的ID，- 1表示系统
      t_name: '', //收益人名字
      t_icon: '', //收益人头像
      price: 0, //订单原价
      time: '', //发生的时间戳，字符串
      total_fee: 0, // 实际支付的金额
      profit: 0, //收益
      p_rate: '', //收益百分比，存整数，如20表示20%，因为比效好计算和传输
      s_id: '', //分成记录的id,
      s_name: '', //分成名称
      coupon: 0, // 优惠券
      p_type: '', // 分成类型，如果是提现，就没有值
      type: 2000 // 记录类型，有借，有贷
    }
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

      this.data.model.type = app.globalData.profitType.cr
    }

    this.data.model.f_id = options.f_id
    this.data.model.f_name = options.f_name
    this.data.model.f_icon = options.f_icon
    this.data.model.t_id = options.t_id
    this.data.model.t_name = options.t_name
    this.data.model.t_icon = options.t_icon
    this.data.model.price = options.leftProfit
    this.data.model.total_fee = options.leftProfit
  },

  onInputProfit: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.profit = 0
    } else {
      this.data.model.profit = info
    }
  },

  selectCashAccount: function() {
    wx.navigateTo({
      url: '../banksAccount/index?action=2000&property=banksAccountModel'
    })
  },

  onAddButtonAction: function() {
    if(!this.data.banksAccountModel._id) {
      wx.showToast({
        title: '请选择收款帐号',
      })
      return
    }

    if (this.data.model.profit <= 0.1) {
      wx.showToast({
        title: '必须大于0.1元',
      })
      return
    }

    if (this.data.model.profit > this.data.model.total_fee) {
      wx.showToast({
        title: '不能超出余额喔',
      })
      return
    }

    let _this = this
    const db = wx.cloud.database()
    let pagesArr = getCurrentPages()
    _this.data.model.time = util.createTimeStamp()
    db.collection(_this.data.table_view).add({
      data: _this.data.model,
      success: function(res) {
        wx.showToast({
          title: '提取成功',
          duration: 2000
        })

        let model = _this.data.model
        model._id = res._id

        wx.navigateBack({
          delta: 1,
          success: function (res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            let crDataSources = parentPage.data.crDataSources
            crDataSources.push(model)
            parentPage.setData({
              crDataSources: crDataSources
            })
          }
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '提取申请失败',
          duration: 2000
        })
      } 
    })
  }
})
