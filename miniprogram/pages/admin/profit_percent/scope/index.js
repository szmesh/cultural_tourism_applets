
const app = getApp()

Page({
  data: {
    table_view: 'mcta_profit_percent_scope',
    spot_table_view: 'mcta_scenic_spots',
    dataSources: [],
    spot_model: {}
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../../chooseLib/chooseLib',
      })
      return
    }

    if(options.sid) {
      this.setData({
        sid: options.sid
      })

      this.getDataSources()
    }

    // 监测景区的对象变化
    let _this = this
    Object.defineProperty(this.data, 'spot_model', {
      get: function() {
        
      },
      set: function(newVal) {
        if(newVal) {
          _this.saveScope(newVal)
        }
      }
    })
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
      fail: function(err) {
        wx.showToast({
          title: '查询列表失败',
          duration: 2000
        })

        _this.setData({
          dataSources: []
        })
      }
    })
  },

  saveScope: function(spotModel) {
    // 判断原来是否已经有了
    for(let i = 0; i < this.data.dataSources.length; i++) {
      let tmpModel = this.data.dataSources[i]
      if (tmpModel.s_id == spotModel._id) {
        wx.showToast({
          title: '景点已有',
          duration: 2000
        })
        return
      }
    }

    let model = {
      p_id: this.data.sid,
      s_id: spotModel._id,
      s_name: spotModel.name,
      s_province: spotModel.province,
      s_city: spotModel.city,
      status: 2000
    }

    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).add({
      data: model,
      success: function(res) {
        wx.showToast({
          title: '添加景点成功',
          duration: 2000
        })

        model._id = res._id
        let dataSources = _this.data.dataSources
        dataSources.push(model)
        _this.setData({
          dataSources: dataSources
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '添加景点失败',
          duration: 2000
        })
      }
    })
  },

  onDeleteAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    let index = e.currentTarget.dataset.index
    
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(sid).remove({
      success: function(res) {
        wx.showToast({
          title: '移除成功',
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
          title: '移除失败',
          duration: 2000
        })
      }
    })
  },

  onAddButtonAction: function() {
    // 选择景区
    wx.navigateTo({
      url: '../../../selectors/index?s_table='
        + this.data.spot_table_view
        + '&s_name_key=name'
        + '&s_detail_key=des'
        + '&call_back=spot_model'
    })
  }
})
