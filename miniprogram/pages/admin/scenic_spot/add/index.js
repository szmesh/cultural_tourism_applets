const app = getApp()

Page({
  data: {
    spot_table_view: 'mcta_scenic_spots',
    model: {
      _id: '',
      address: '',
      province: '',
      city: '',
      zone: '',
      latitude: '',
      longitude: '',
      listen_count: 0,
      sell_count: 0,
      view_count: 0,
      name: '',
      work_time: '',
      des: '',
      tickets_info: '',
      suggestion: '',
      assistance_tips: '',
      status: 2000
    }
  },

  onLoad: function (options) {
    this.setData({
      sid: options.spotId
    })

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../../chooseLib/chooseLib',
      })
      return
    }

    // 判断是否是编辑
    if(undefined == this.data.sid || 0 >= this.data.sid.length) {
      return
    }

    // 获取数据
    this.getSpotDetail()
  },

  // 获取数据库的数据
  getSpotDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(this.data.spot_table_view).doc(_this.data.sid).get({
      success: function(res) {
        _this.setData({
          model: res.data
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '没找到对应数据',
          duration: 2000
        })
      }
    })
  },

  // 进入地图
  onOpenMap: function() {
    let _this = this
    wx.chooseLocation({
      success: function(res) {
        let add = app.getArea(res.address)
        let model = _this.data.model
        model.address = add.address
        model.province = add.province
        model.city = add.city
        model.zone = add.zone
        model.latitude = add.latitude
        model.longitude = add.longitude

        _this.setData({
          model: model
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '无法打开地图',
          icon: none,
          duration: 2000
        })
      }
    })
  },

  // 景区名
  onInputName: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = info
    }
  },

  // 开放时间
  onWorkTime: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.work_time = ''
    } else {
      this.data.model.work_time = info
    }
  },

  onDes: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.des = ''
    } else {
      this.data.model.des = info
    }
  },

  onTicketsInfo: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.tickets_info = ''
    } else {
      this.data.model.tickets_info = info
    }
  },

  onSuggestion: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.suggestion = ''
    } else {
      this.data.model.suggestion = info
    }
  },

  onAssistanceTips: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.assistance_tips = ''
    } else {
      this.data.model.assistance_tips = info
    }
  },

  // 保存景区信息
  onSaveScenicSpotAction: function() {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    if (!this.verifyScenicSpotInfo()) {
      return
    }

    // 判断是编辑还是新增
    if(undefined == this.data.sid || 0 >= this.data.sid.length) {
      this.addScenicSpotItem()
    } else {
      this.updateScenicSpotItem()
    }
  },

  // 插入数据
  addScenicSpotItem: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    db.collection(this.data.spot_table_view).add({
      data: model,
      success: function (res) {
        wx.hideToast()
        wx.showToast({
          title: '增加成功',
          duration: 2000
        })
        wx.navigateBack({
          delta: 1
        })
      },
      fail: function (err) {
        wx.hideToast()
        wx.showToast({
          title: '增加失败',
          duration: 2000
        })
      }
    })
  },

  updateScenicSpotItem: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    delete model._id
    delete model._openid
    db.collection(this.data.spot_table_view).doc(this.data.sid).update({
      data: model,
      success: function (res) {
        wx.hideToast() 
        wx.showToast({
          title: '更新成功',
          duration: 2000
        })
      },
      fail: function (err) {
        wx.hideToast()
        wx.showToast({
          title: '更新失败',
          duration: 2000
        })
      }
    })
  },

  // 输入信息检测
  verifyScenicSpotInfo: function() {
    if(undefined == typeof(this.data.model.name)
    || 0 >= this.data.model.name.length) {
      wx.showModal({
        content: '请输入景区名',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    if (undefined == typeof (this.data.model.work_time)
    || 0 >= this.data.model.work_time.length) {
      wx.showModal({
        content: '请输入开放时间',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    if (undefined == typeof (this.data.model.des)
      || 0 >= this.data.model.des.length) {
      wx.showModal({
        content: '请输入说明信息',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    if (undefined == typeof (this.data.model.tickets_info)
      || 0 >= this.data.model.tickets_info.length) {
      wx.showModal({
        content: '请输入票价信息',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    if (undefined == typeof (this.data.model.suggestion)
      || 0 >= this.data.model.suggestion.length) {
      wx.showModal({
        content: '请输入游玩路线信息',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    if (undefined == typeof (this.data.model.assistance_tips)
      || 0 >= this.data.model.assistance_tips.length) {
      wx.showModal({
        content: '请输入游玩建议',
        showCancel: false,
        confirmText: '确定'
      })
      return false
    }

    return true
  }
})
