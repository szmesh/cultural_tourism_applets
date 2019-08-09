
const app = getApp()

Page({
  data: {
    table_view: 'mcta_profit_percent_items',
    dataSources: [],
    model: {
      p_id: '',
      name: '',
      percent: 0,
      type: ''
    }
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    if (options.sid) {
      this.setData({
        sid: options.sid
      })

      this.data.model.p_id = options.sid
      this.getDataSources()
    }
  },

  getDataSources: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      p_id: _this.data.sid
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
      fail: function(res) {
        wx.showToast({
          title: '查询数据失败',
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  onInputPercent: function(e) {
    let info = e.detail.value
    let index = e.currentTarget.dataset.index
    let model = this.data.dataSources[index]
    if (undefined == typeof (info)) {
      model.percent = 0
    } else {
      model.percent = info
    }

    let dataSources = this.data.dataSources
    dataSources[index] = model
    this.setData({
      dataSources: dataSources
    })
  },

  onNewInputName: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = info
    }
  },

  onNewInputPercent: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.percent = 0
    } else {
      this.data.model.percent = info
    }
  },

  onNewInputType: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.type = ''
    } else {
      this.data.model.type = info
    }
  },

  onAddButtonAction: function() {
    if(!this.verifyNewModel()) {
      return
    }

    let _this = this
    const db = wx.cloud.database()
    let model = _this.data.model
    delete model._id
    db.collection(this.data.table_view).add({
      data: model,
      success: function(res) {
        wx.showToast({
          title: '添加成功',
          duration: 2000
        })

        // 将新的数据记录清加到数据组中
        model._id = res._id
        let dataSources = _this.data.dataSources
        dataSources.push(model)
        _this.setData({
          dataSources: dataSources
        })

        // 清空新增的数据模型
        let newModel = {
          p_id: '',
          name: '',
          percent: 0,
          type: ''
        }
        _this.setData({
          model: newModel
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '添加失败',
          duration: 2000
        })
      }
    })
  },

  verifyNewModel: function() {
    if (undefined == typeof (this.data.model.name)
      || 0 >= this.data.model.name.length) {
      wx.showToast({
        title: '请输入规则名',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.percent)
      || 0 >= this.data.model.percent) {
      wx.showToast({
        title: '请输入有效百分比，整数',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.type)
      || 0 >= this.data.model.type.length) {
      wx.showToast({
        title: '请输入编码',
        duration: 2000
      })
      return false
    }

    return true
  },

  onDeletePercent: function(e) {
    let index = e.currentTarget.dataset.index
    let model = this.data.dataSources[index]
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(model._id).remove({
      success: function(res) {
        wx.showToast({
          title: '删除成功',
          duration: 2000
        })

        let dataSources = _this.data.dataSources
        dataSources.splice(index, 1)
        _this.setData({
          dataSources: dataSources
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    })
  },

  onEditPercent: function(e) {
    let index = e.currentTarget.dataset.index
    let model = this.data.dataSources[index]
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(model._id).update({
      data: {
        percent: model.percent
      },
      success: function(res) {
        wx.showToast({
          title: '更新成功',
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '更新失败',
        })
      }
    })
  },

  radioChange: function(e) {
    this.data.model.type = e.detail.value
  }
})
