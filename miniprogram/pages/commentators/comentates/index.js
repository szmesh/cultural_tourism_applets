const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentates',
    files_path: 'cultural_tourism/commentates/images',
    audio_files_path: 'cultural_tourism/commentates/audio',
    playStatus: 1000,
    innerAudioContext: undefined,
    types: {
      video: 1000,
      audio: 2000
    },
    model: {
      name: '',
      type: '',
      src: '',
      img: '',
      time: 0,
      size: 0,
      price: 0,
      b_count: 0,
      l_count: 0,
      s_id: ''
    }
  },

  onLoad: function (options) {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    // 保存专辑id
    if (options.sid) {
      this.setData({
        sid: options.sid
      })
    }

    // 设置音频回调
    this.data.innerAudioContext = wx.createInnerAudioContext()

    this.data.innerAudioContext.onPlay(() => {
      console.log('开始播放')
    })
    this.data.innerAudioContext.onError((res) => {
      console.log(res.errMsg)
      console.log(res.errCode)
    })
  },

  // 保存讲解记录
  onSaveButtonAction: function() {
    if (!this.veridate()) {
      return
    }

    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.table_view).add({
      data: _this.data.model,
      success: function(res) {
        wx.showToast({
          title: '新增成功',
          duration: 2000
        })

        wx.navigateBack({
          delta: 1
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '新增失败',
          duration: 2000
        })
      }
    })
  },

  veridate: function() {
    if(!this.data.model.name) {
      wx.showToast({
        title: '请填写讲解点标题',
        duration: 2000
      })
      return false
    }

    if (!this.data.model.src) {
      wx.showToast({
        title: '请上传讲解文件',
        duration: 2000
      })
      return false
    }

    if (!this.data.model.img) {
      wx.showToast({
        title: '请上传背景图片',
        duration: 2000
      })
      return false
    }

    return true
  },

  onInputName: function (e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = value
    }
  },

  onInputPrice: function(e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.price = 0
    } else {
      this.data.model.price = value
    }
  },

  // 选择图片
  chooseImage: function() {
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
        var timestamp = (new Date()).valueOf()
        let cloudPath = that.data.files_path
          + '/' + timestamp
          + '_' + suffix
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
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
            })
          }
        })
      }
    })
  },

  uploadFiles: function() {
    const that = this
    wx.chooseMessageFile({
      count: 1,
      type: 'file',
      extension: ['m4a', 'wav', 'mp3', 'aac'],
      success(res) {
        let filePaths = res.tempFiles
        let fileObject = filePaths[0]
        let filePath = fileObject.path
        let size = fileObject.size
        let time = fileObject.time

        wx.showToast({
          title: '上传中...',
          icon: 'loading',
          duration: 10000
        })

        let matchArray = filePath.match(/\.[^.]+?$/)
        let suffix = matchArray[0]
        var timestamp = (new Date()).valueOf()
        let cloudPath = that.data.audio_files_path
          + '/' + timestamp + suffix

        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            let model = that.data.model
            model.src = res.fileID
            model.size = size
            model.type = suffix.substring(1)

            that.setData({
              model: model
            })

            wx.hideToast()
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

  playAudioAction: function() {
    if(1000 == this.data.playStatus) {
      if (this.data.innerAudioContext.src != this.data.model.src) {
        this.data.innerAudioContext.src = this.data.model.src
        this.data.model.time = this.data.innerAudioContext.duration
      }
      
      this.data.innerAudioContext.play()
      this.setData({playStatus: 2000})
    } else {
      this.data.innerAudioContext.pause()
      this.setData({ playStatus: 1000 })
    }
  },
})
