// miniprogram/pages/admin/home_banners/banner_edit/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    targetID: '',
    title: '',
    describe: '',
    imgPath: '',
    oldImage: '', // 用于记录原来的封面图，没有变化则无需重新上传
    cloudPath: 'cultural_tourism/banners/',
    collectionName: 'mcta_home_banners',
    imgBlured: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    console.log(options)
    if (options.id) {
      this.data.targetID = options.id
      this.getBannerDetail()
    }
  },
  // 根据id获取详情信息
  getBannerDetail(){
    if (!this.data.targetID) return
    const db = wx.cloud.database()
    db.collection(this.data.collectionName).doc(this.data.targetID).get({
      success: res => {
        this.setData({
          title: res.data.title,
          describe: res.data.describe,
          imgPath: res.data.bannerUrl
        })
        this.data.oldImage = res.data.bannerUrl
      }
    })
  },
  // 选择本地照片
  chooseImage() {
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: res => {
        this.setData({
          imgPath: res.tempFilePaths[0]
        })
        console.log(res)
      },
      fail: function (res) { },
      complete: function (res) { },
    })
  },
  // 点击放大预览
  pieviewImg() {
    if (!this.data.imgChoosed) return
    wx.previewImage({
      urls: [this.data.imgPath],
    })
  },
  clearImg() {
    this.setData({
      imgPath: ''
    })
  },
  bindTitleInput(e) {
    this.setData({
      title: e.detail.value
    })
  },
  bindContentInput(e) {
    this.setData({
      describe: e.detail.value
    })
  },
  // 保存数据
  saveBanner() {
    if (this.checkNotNull()) {
      wx.showLoading({
        title: '保存中',
      })
      // 与旧的图不等才要重新上传
      if (this.data.imgPath && this.data.oldImage != this.data.imgPath) {
        const matchArray = this.data.imgPath.match(/\.[^.]+?$/)
        const suffix = matchArray[0]
        const timestamp = (new Date()).valueOf()
        wx.cloud.uploadFile({
          cloudPath: `${this.data.cloudPath}banner_${timestamp}${suffix}`,
          filePath: this.data.imgPath,
          success: res => {
            this.doSaveData(res.fileID)
            // 可以将旧图片删除了！
            this.deleteOldImg()
          },
          fail: err => {
            wx.hideLoading()
          }
        })
      } else {
        this.doSaveData(this.data.oldImage)
      }
    }
  },
  // 删除原来数据库中的图片 
  deleteOldImg() {
    wx.cloud.deleteFile({
      fileList: [this.data.oldImage],
      success: res => {
        console.log('旧图片已删除！')
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 执行数据库update
  doSaveData(fileID) {
    if (fileID) {
      const db = wx.cloud.database()
      db.collection(this.data.collectionName).doc(this.data.targetID).update({
        data: {
          title: this.data.title,
          describe: this.data.describe,
          update_date: new Date().toLocaleDateString(),
          bannerUrl: fileID
        },
        success: res => {
          console.log(res)
          wx.hideLoading()
          wx.navigateBack({
            delta: 1
          })
          setTimeout(() => {
            wx.showToast({
              title: ' 保存成功！',
            })
          }, 100)

        },
        fail: err => {
          wx.showToast({
            title: '保存失败！',
          })
          wx.hideLoading()
        }
      })
    }
  },
  // 检查数据是否合法
  checkNotNull() {
    if (this.data.title == '') {
      wx.showToast({
        title: '标题不能为空',
        icon: 'none'
      })
      return false
    }
    if (this.data.content == '') {
      wx.showToast({
        title: '请输入描述内容',
        icon: 'cancel'
      })
      return false
    }
    if (this.data.imgPath == '') {
      wx.showToast({
        title: '请选择封面图',
        icon: 'cancel'
      })
      return false
    }
    return true
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})