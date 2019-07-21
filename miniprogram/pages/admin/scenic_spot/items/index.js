const app = getApp()

Page({
  data: {
    table_view: 'mcta_scenic_spots_items',
    sid: '',
    name: '',
    dataSource: []
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

    this.onGetItems()
  },

  // 获取默认的讲解点列表
  onGetItems: function() {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    const db = wx.cloud.database()

    // 先查询有没有数据
    db.collection(this.data.table_view).where({
      s_id: this.data.sid
    }).get({
      success: res => {
        if (0 < res.data.length) {
          this.setData({
            dataSource: res.data
          })
        } else {
          this.setData({
            dataSource: []
          })
        }
        wx.hideToast()
      },
      fail: err => {
        this.setData({
          dataSource: []
        })
        wx.hideToast()
      }
    })
  },

  onInputItemName: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.name = ''
    } else {
      this.data.name = info
    }
  },

  onAddItemButtonAction: function(e) {
    if(undefined == typeof(this.data.name) || 0 >= this.data.name.length) {
      wx.showToast({
        title: '请填写有效的讲解点说明',
      })
      return
    }

    const db = wx.cloud.database()

    let model = {
      s_id: this.data.sid,
      name: this.data.name
    }

    db.collection(this.data.table_view).add({
      data: model,
      success: res => {
        wx.hideToast()
        wx.showToast({
          title: '增加成功',
          duration: 2000
        })

        // 刷新列表
        this.onGetItems()
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '增加失败',
          duration: 2000
        })
      }
    })
  },

  onItemDeleteButtonAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    const db = wx.cloud.database()
    db.collection(this.data.table_view).doc(sid).remove({
      success: res => {
        wx.hideToast()
        wx.showToast({
          title: '删除成功',
          duration: 2000
        })

        // 刷新列表
        this.onGetItems()
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    })
  }
})
