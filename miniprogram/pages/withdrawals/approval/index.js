
const app = getApp()
const util = require('../../../utils/util.js')
const recordDetailStatus = require('../../../utils/recordDetailStatus.js')

Page({
  data: {
    table_view: 'mcta_profit_records_approval',
    imagesCloundPath: 'cultural_tourism/withdrawals',
    status: recordDetailStatus.status.add,
    isEditable: false,
    userInfo: {},
    model: {
      s_id: '',
      a_name: '',
      a_phone: '',
      des: '',
      img: '',
      time: '',
      type: 0
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

    if (options.sid) {
      this.setData({
        sid: options.sid
      })

      this.data.model.s_id = options.sid
    }

    if(options.status) {
      this.setData({
        status: parseInt(options.status)
      })
    }

    if (options.index) {
      this.setData({
        index: options.index
      })
    }

    // 判断如果是查看则查询详情并显示
    if (this.data.status === recordDetailStatus.status.view) {
      this.setData({
        isEditable: true
      })
      this.getDetail()
    }
  },

  getDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).where({
      s_id: _this.data.sid
    }).get({
      success: function(res) {
        _this.setData({
          model: res.data[0]
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

  // 回复提现处理记录
  onAddButtonAction: function() {
    if (!this.verify()) {
      return
    }

    let _this = this
    const db = wx.cloud.database()
    let model = _this.data.model
    model.time = (new Date()).valueOf()
    model.type = _this.data.status
    let pagesArr = getCurrentPages()
    db.collection(_this.data.table_view).add({
      data: model,
      success: function(res) {
        model._id = res._id

        wx.navigateBack({
          delta: 1,
          success: function (res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            let dataSources = parentPage.data.dataSources
            let originModel = dataSources[_this.data.index]
            originModel.approval = model
            dataSources[_this.data.index] = originModel
            parentPage.setData({
              dataSources: dataSources
            })
          }
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '保存失败',
          duration: 2000
        })
      }
    })
  },

  onInputAname: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.a_name = ''
    } else {
      this.data.model.a_name = info
    }
  },

  onInputAphone: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.a_phone = ''
    } else {
      this.data.model.a_phone = info
    }
  },

  onInputDes: function(e) {
    let info = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.des = ''
    } else {
      this.data.model.des = info
    }
  },

  // 选择图片
  chooseImage() {
    if(this.data.isEditable) {
      return
    }

    let that = this
    wx.chooseImage({
      sourceType: ['camera', 'album'],
      sizeType: ['original'],
      count: 1,
      success(res) {
        let filePaths = res.tempFilePaths
        let filePath = filePaths[0]

        wx.showToast({
          title: '上传中...',
          icon: 'loading',
          duration: 10000
        })

        let matchArray = filePath.match(/\.[^.]+?$/)
        let suffix = matchArray[0]
        var timestamp = (new Date()).valueOf()
        let cloudPath = that.data.imagesCloundPath
          + '/' + timestamp
          + suffix
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            wx.hideToast()
            wx.showToast({
              title: '上传成功',
              duration: 1000
            })

            let model = that.data.model
            model.img = res.fileID
            that.setData({
              model: model
            })
          },
          fail: err => {
            wx.hideToast()
            wx.showToast({
              icon: 'none',
              title: '上传失败',
              duration: 1000
            })
          }
        })
      }
    })
  },

  verify: function() {
    if (undefined == typeof (this.data.model.a_name)
      || 0 >= this.data.model.a_name.length) {
      wx.showToast({
        title: '请输入处理人姓名',
        duration: 2000
      })

      return false
    }

    if (undefined == typeof (this.data.model.a_phone)
      || 0 >= this.data.model.a_phone.length) {
      wx.showToast({
        title: '请输入处理人联系电话',
        duration: 2000
      })

      return false
    }

    return true
  }
})
