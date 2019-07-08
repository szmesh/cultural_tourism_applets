const app = getApp()

Page({
  data: {
    sid: '',
    openid: '',
    imagesCloundPath: 'cultural_tourism/spots/banner/',
    model: {
      file_type: 'png',
      s_id: '',
      save_type: 1000,
      type: 2000,
      url: ''
    },
    dataSource: []
  },

  onLoad: function (options) {
    this.setData({
      sid: options.spotId,
      model: {
        file_type: 'png',
        s_id: options.spotId,
        save_type: 1000,
        type: 2000,
        url: ''
      }
    })

    if (app.globalData.userInfo.openid) {
      this.setData({
        openid: app.globalData.userInfo.openid
      })
    }

    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../../chooseLib/chooseLib',
      })
      return
    }

    this.onGetBanners()
  },

  // 获取数据库中的图片集
  onGetBanners: function() {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    const db = wx.cloud.database()

    // 先查询有没有数据
    db.collection('mcta_images').where({
      s_id: this.data.sid,
      type: 2000
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

  // 选择图片
  chooseImage() {
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
        })

        let matchArray = filePath.match(/\.[^.]+?$/)
        let suffix = matchArray[0]
        that.data.model.file_type = suffix.substr(1)
        var timestamp = (new Date()).valueOf()
        let cloudPath = that.data.imagesCloundPath
          + 'xox' + that.data.openid
          + '-' + timestamp
          + 'xox' + suffix
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            that.onAddBannerImageRecord(res.fileID)
          },
          fail: err => {
            wx.hideToast()
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          }
        })
      }
    })
  },

  // 插入图片数据库记录
  onAddBannerImageRecord: function(fileID) {
    const db = wx.cloud.database()
    this.data.model.url = fileID
    let model = this.data.model
    db.collection('mcta_images').add({
      data: model,
      success: res => {
        wx.hideToast()
        wx.showToast({
          title: '上传成功',
          duration: 2000
        })
        
        this.onGetBanners()
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '上传失败',
          duration: 2000
        })
      }
    })
  },

  previewImage(e) {
    const current = e.target.dataset.src
    let urls = []
    for(let index in this.data.dataSource) {
      let item = this.data.dataSource[index]
      urls.push(item.url)
    }
    wx.previewImage({
      current,
      urls: urls
    })
  },

  // 删除图片
  onDeleteImage: function(e) {
    wx.showToast({
      title: 'loading',
      icon: 'loading',
    })

    let sid = e.target.dataset.sid
    let fileid = e.target.dataset.fileid
    let db = wx.cloud.database()
    db.collection('mcta_images').doc(sid).remove({
      success: res => {
        // 删除文件
        this.deleteFile(fileid)
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      }
    })
  },

  deleteFile(fileId) {
    if (!fileId) {
      return
    }
    const self = this
    wx.cloud.deleteFile({
      fileList: [fileId],
      success: res => {
        wx.hideToast()
        wx.showToast({
          title: '删除成功',
          duration: 2000
        })

        this.onGetBanners()
      },
      fail: err => {
        wx.hideToast()
        wx.showToast({
          title: '删除失败',
          duration: 2000
        })
      },
      complete: () => {
        wx.hideToast()
      }
    })
  }
})
