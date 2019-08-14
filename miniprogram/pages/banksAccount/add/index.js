
const app = getApp()
const banksAccountType = require('../../../utils/banksAccountType.js')

Page({
  data: {
    table_view: 'mcta_banks_accounts',
    userInfo: {},
    banksAccountType: [],
    accountType: [],
    banksAccountTypeIndex: 0,
    model: {
      type: 1000,
      name: '',
      phone: '',
      account: '',
      bank: '',
      bankLocal: '',
      s_id: ''
    }
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../chooseLib/chooseLib',
      })
      return
    }

    this.setData({
      banksAccountType: banksAccountType.types,
      accountType: banksAccountType.type
    })

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      this.data.model.s_id = app.globalData.userInfo.userId
    }
  },

  pickerChange: function(e) {
    let value = e.detail.value
    let model = this.data.model
    model.type = this.data.banksAccountType[value].type
    this.setData({
      banksAccountTypeIndex: value,
      model: model
    })
  },

  onInputName: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = info
    }
  },

  onInputAccount: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.account = ''
    } else {
      this.data.model.account = info
    }
  },

  onInputPhone: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.phone = ''
    } else {
      this.data.model.phone = info
    }
  },

  onInputBank: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.bank = ''
    } else {
      this.data.model.bank = info
    }
  },

  onInputBankLocal: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.bankLocal = ''
    } else {
      this.data.model.bankLocal = info
    }
  },

  onAddButtonAction: function() {
    if (!this.verify()) {
      return
    }

    let _this = this
    let db = wx.cloud.database()
    db.collection(this.data.table_view).add({
      data: _this.data.model,
      success: function(res) {
        let model = _this.data.model
        model._id = res._id

        var pagesArr = getCurrentPages()
        wx.navigateBack({
          delta: 1,
          success: function (res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            let dataSources = parentPage.data.dataSources
            dataSources.push(model)
            parentPage.setData({
              dataSources: dataSources
            })
          }
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '添加收款帐号失败',
        })
      }
    })
  },

  verify: function() {
    if (undefined == typeof (this.data.model.name)
      || 0 >= this.data.model.name.length) {
      wx.showToast({
        title: '请输入收款人姓名',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.phone)
      || 0 >= this.data.model.phone.length) {
      wx.showToast({
        title: '请输入收款人联系电话',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.account)
      || 0 >= this.data.model.account.length) {
      wx.showToast({
        title: '请输入收款帐号',
        duration: 2000
      })
      return false
    }

    if (this.data.accountType.debit_card == this.data.model.type ||
      this.data.accountType.credit_card == this.data.model.type) {
      if (undefined == typeof (this.data.model.bank)
        || 0 >= this.data.model.bank.length) {
        wx.showToast({
          title: '请输入银行卡所属银行',
          duration: 2000
        })
        return false
      }
    }

    return true
  }
})
