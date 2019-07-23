const app = getApp()

Page({
  data: {
    dataSources: [],
    selectDataSources: []
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: 'chooseLib/chooseLib',
      })
      return
    }

    if (undefined != options.s_table && 0 < options.s_table.length) {
      this.setData({
        s_table: options.s_table
      })
    }

    if (undefined != options.s_name_key && 0 < options.s_name_key.length) {
      this.setData({
        s_name_key: options.s_name_key
      })
    }

    if (undefined != options.s_detail_key && 0 < options.s_detail_key.length) {
      this.setData({
        s_detail_key: options.s_detail_key
      })
    }
    
    if (undefined != options.call_back && 0 < options.call_back.length) {
      this.setData({
        call_back: options.call_back
      })
    }
    
    if (undefined != options.search_key && 0 < options.search_key.length) {
      this.setData({
        search_key: options.search_key
      })
    }

    if (undefined != options.search_value && 0 < options.search_value.length) {
      this.setData({
        search_value: options.search_value
      })
    }

    // 请求列表数据
    if (this.data.s_table) {
      this.getDataSources()
    }
  },

  getDataSources: function () {
    let _this = this
    const db = wx.cloud.database()

    let searchModel = {}
    if(this.data.search_key && this.data.search_value) {
      searchModel[this.data.search_key] = this.data.search_value
    }

    db.collection(this.data.s_table).where(searchModel).get({
      success: function (res) {
        _this.resetDataSources(res.data)
      },
      fail: function (err) {
        wx.showToast({
          title: '查找选择数据失败',
          duration: 2000
        })
      }
    })
  },

  resetDataSources: function (selectDataSources) {
    let dataSources = []
    this.data.selectDataSources = selectDataSources
    for (i = 0; i < selectDataSources.length; i++) {
      let item = selectDataSources[i]
      let model = {}

      if (this.data.s_detail_key) {
        model.detail = item[this.data.s_detail_key]
      }

      if (this.data.s_name_key) {
        model.name = item[this.data.s_name_key]
        model._id = item._id
        dataSources.push(model)
      }
    }

    this.setData({
      dataSources: dataSources
    })
  },

  selectAction: function(e) {
    let model = this.data.dataSources[e.currentTarget.dataset.index]
    let filterArray = this.data.selectDataSources.filter(item => {
      return item._id == model._id
    })

    let callBackModel = {}
    if (filterArray && 0 < filterArray.length) {
      callBackModel = filterArray[0]
    }

    let _this = this
    var pagesArr = getCurrentPages()
    wx.navigateBack({
      delta: 1,   //回退前 delta 页面
      success: function (res) {
        let parentPage = pagesArr[pagesArr.length - 2]
        let data = parentPage.data
        data[_this.data.call_back] = callBackModel
        parentPage.setData(data)
      }
    })
  }
})