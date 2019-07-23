// miniprogram/pages/admin/home_banners/banner_add/index.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    describe: '',
    imgChoosed: false,
    imgPath: '',
    region: ['未知'],
    cloudPath: 'cultural_tourism/banners/',
    collectionName: 'mcta_home_banners'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },
  // 选择本地照片
  chooseImage() {
    var _this = this
    wx.chooseImage({
      count: 1,
      sizeType: ['original', 'compressed'],
      sourceType: ['album'],
      success: function(res) {
        _this.setData({
          imgChoosed: true,
          imgPath: res.tempFilePaths[0]
        })
        console.log(res)
      },
      fail: function(res) {},
      complete: function(res) {},
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
      imgChoosed: false,
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
  bindRegionChange(e) {
    console.log(e)
    this.setData({
      region: e.detail.value
    })
  },
  // 保存数据
  saveBanner() {
    if (this.checkNotNull()) {
      wx.showLoading({
        title: '保存中',
      })
      const matchArray = this.data.imgPath.match(/\.[^.]+?$/)
      const suffix = matchArray[0]
      const timestamp = (new Date()).valueOf()
      wx.cloud.uploadFile({
        cloudPath: `${this.data.cloudPath}banner_${timestamp}${suffix}`,
        filePath: this.data.imgPath,
        success: res => {
         this.doSaveData(res.fileID)
        },
        fail: err => {
          wx.hideLoading()
        }
      })
      
    }
  },
  // 执行数据库保存
  doSaveData(fileID) {
    if (fileID) {
      const db = wx.cloud.database()
      db.collection(this.data.collectionName).add({
        data: {
          region: this.data.region,
          city: this.data.region[0] + this.data.region[1],
          title: this.data.title,
          describe: this.data.describe,
          date: (new Date()).valueOf(),
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
              title: '添加成功！',
            })
          }, 100)
         
        },
        fail: err => {
          wx.showToast({
            title: '新增失败！',
          })
          wx.hideLoading()
        }
      })
    }
  },
  // 检查数据是否合法
  checkNotNull() {
    if (this.data.region.length < 3) {
      wx.showToast({
        title: '请选择地区',
        icon: 'none'
      })
      return false
    }
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
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})