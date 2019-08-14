// miniprogram/pages/my/promotion/promotion.js
const app = getApp()
Page({

  /**
   * 页面的初始数据
   */
  data: {
    imgURL: '',
    userInfo: {},
    profitPercentType: {}
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }

    if (app.globalData.profitPercentType) {
      this.setData({
        profitPercentType: app.globalData.profitPercentType
      })
    }

    this.getQRcode()
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
  // 获取推广二维码
  getQRcode() {
    wx.request({
      url: `https://api.weixin.qq.com/cgi-bin/wxaapp/createwxaqrcode?access_token=${app.globalData.access_token}`,
      method: 'POST',
      responseType: 'arraybuffer',
      data: {
        path: `pages/hot/index?userID=${app.globalData.userInfo.openid}`
      },
      success: res => {
        console.log(res)
        // 将Buffer转成图片显示
        const baseData = 'data:image/png;base64,' + wx.arrayBufferToBase64(res.data)
        this.setData({
          imgURL: baseData
        })
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  saveQRcode() {
    // 测试用
    // wx.reLaunch({
    //   url: `../../hot/index?userID=${app.globalData.userInfo.openid}`,
    // })
    // return
    wx.saveImageToPhotosAlbum({
      filePath: this.data.imgURL,
      success(res) {
        console.log(res)
      },
      fail(err) {
        console.log(err)
      }
    })
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

  },

  // 我的收益
  onProfitButtonAction: function() {
    wx.navigateTo({
      url: '../../profit/index?sid=' + this.data.userInfo.userId + '&type=' + this.data.profitPercentType.parent,
    })
  }
})