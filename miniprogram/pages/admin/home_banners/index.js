// miniprogram/pages/admin/home_banners/home_banners.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bannerList: [],
    collectionName: 'mcta_home_banners'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },
  // 每次进入页面获取banner列表
  getBannerList() {
    const db = wx.cloud.database()
    db.collection(this.data.collectionName).get({
      success: res => {
        console.log(res)
        this.setData({
          bannerList: res.data
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
  // 删除前确认提示
  deleteConfirm(e) {
    const id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '确定要删除吗？',
      success: res => {
        if (res.confirm) {
          this.doDelete(id)
        }
      }
    })
  },
  // 确认删除
  doDelete(id) {
    const db = wx.cloud.database()
    db.collection(this.data.collectionName).doc(id).remove({
      success: res => {
        console.log(res.data)
        wx.showToast({
          title: '删除成功！',
        })
        this.getBannerList()
      }
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
    this.getBannerList()
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