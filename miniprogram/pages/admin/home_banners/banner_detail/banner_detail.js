// miniprogram/pages/admin/home_banners/banner_detail/banner_detail.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    title: '',
    imgPath: '',
    description: '',
    region: '',
    openTime: '',
    targetID: '',
    collectionName: 'mcta_home_banners'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.targetID = options.id
    this.getBannerDetail()
  },
  // 根据id获取详情信息
  getBannerDetail() {
    if (!this.data.targetID) return
    const db = wx.cloud.database()
    db.collection(this.data.collectionName).doc(this.data.targetID).get({
      success: ({ data }) => {
        console.log(data)
        this.setData({
          region: data.region || [],
          title: data.title,
          description: data.describe,
          imgPath: data.bannerUrl
        })
      }
    })
  },
  // 放大预览
  previewImg(e) {
    const imgPath = e.currentTarget.dataset.path
    wx.previewImage({
      urls: [imgPath],
    })
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
