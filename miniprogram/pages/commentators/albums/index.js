
const app = getApp()

Page({
  data: {
    table_view: 'mcta_albums',
    spots_table_view: 'mcta_scenic_spots',
    model: {
      name: '',
      price: 0,
      s_id: '',
      s_name: ''
    },
    userInfo: {},
    spot_model: {},
    onSelectedSpotsCallBack: function (item) {
      if (item) {
        this.setData({
          spot_model: item
        })
      }
    }
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },

  // 选择景区
  onSelectSpotsButtonAction: function () {
    wx.navigateTo({
      url: '../../selectors/index?s_table='
      + this.data.spots_table_view
      + '&s_name_key=name'
      + '&s_detail_key=des'
        + '&call_back=spot_model'
    })
  },

  // 保存
  onSaveButtonAction: function() {
    if (!this.veridate()) {
      return
    }

    let model = this.data.model
    model.s_id = this.data.spot_model._id
    model.s_name = this.data.spot_model.name

    let _this = this
    let db = wx.cloud.database()
    db.collection(this.data.table_view).add({
      data: model,
      success: function(res) {
        wx.showToast({
          title: '新增专辑成功',
          duration: 2000
        })
        model._id = res._id

        var pagesArr = getCurrentPages()
        wx.navigateBack({
          delta: 1,
          success: function(res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            let albumsDataSources = parentPage.data.albumsDataSources
            albumsDataSources.push(model)
            parentPage.setData({
              albumsDataSources: albumsDataSources
            })
          }
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '新增专辑失败',
          duration: 2000
        })
      }
    })
  },

  // 数据校验
  veridate: function() {
    if (undefined == typeof (this.data.model.name)
      || 0 >= this.data.model.name.length) {
      wx.showToast({
        title: '请输入专辑名',
        duration: 2000
      })
      return false
    }

    if (undefined == this.data.spot_model._id || 0 >= this.data.spot_model._id.length) {
      wx.showToast({
        title: '请选择景区',
        duration: 2000
      })
      return false
    }

    return true
  },

  // 专辑名
  onInputName: function (e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = info
    }
  },

  onInputPrice: function (e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.price = 0
    } else {
      this.data.model.price = value
    }
  },
})
