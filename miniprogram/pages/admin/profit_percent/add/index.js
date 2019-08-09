
const app = getApp()

Page({
  data: {
    table_view: 'mcta_profit_percents',
    status: {
      work: 2000,
      normal: 1000
    },
    model: {
      status: 2000,
      name: ''
    }
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../../chooseLib/chooseLib',
      })
      return
    }

    if (options.sid && options.index) {
      this.setData({
        sid: options.sid,
        index: options.index
      })

      this.getDetail()
    }
  },

  getDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(_this.data.sid).get({
      success: function(res) {
        _this.setData({
          model: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '查询详情失败',
          duration: 2000
        })
      }
    })
  },

  onInputName: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = info
    }
  },

  verifyScenicSpotInfo: function () {
    if (undefined == typeof (this.data.model.name)
      || 0 >= this.data.model.name.length) {
      wx.showToast({
        title: '请输入分成方案名',
        duration: 2000
      })
      return false
    }

    return true
  },

  onSaveAction: function() {
    if(!this.verifyScenicSpotInfo()) {
      return
    }

    // 判断是编辑还是更新
    if(this.data.sid) {
      this.onEditProfitPercent()
    } else {
      this.onAddProfitPercent()
    }
  },

  onAddProfitPercent: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).add({
      data: _this.data.model,
      success: function (res) {
        if (res && res._id) {
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
        } else {
          wx.showToast({
            title: '添加失败',
            duration: 2000
          })
        }
      },
      fail: function (err) {
        wx.showToast({
          title: '添加失败',
          duration: 2000
        })
      }
    })
  },

  onEditProfitPercent: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(_this.data.sid).update({
      data: {
        name: _this.data.model.name
      },
      success: function(res) {
        var pagesArr = getCurrentPages()
        wx.navigateBack({
          delta: 1,
          success: function (res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            let dataSources = parentPage.data.dataSources
            dataSources[_this.data.index] = _this.data.model
            parentPage.setData({
              dataSources: dataSources
            })
          }
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '更新失败',
          duration: 2000
        })
      }
    })
  }
})
