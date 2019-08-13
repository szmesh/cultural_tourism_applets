// miniprogram/pages/my/purchased/purchased.js
const util = require('../../../utils/util.js')
// import { timestampParse } from '../../../utils/util.js'
const app = getApp() 
Page({

  /**
   * 页面的初始数据
   */
  data: {
    openId: '',
    purchasesList: [],
    collection_trade: 'mcta_trade_records'
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.data.openId = app.globalData.userInfo.openid,
    this.getPurchasedList()
  },
  getPurchasedList() {
    const db = wx.cloud.database()
    db.collection(this.data.collection_trade).where({
      openid: this.data.openId
    }).get({
      success: res => {
        let tempArr = []
        for (let item of res.data) {
          let tradetime_format = util.timestampParse(item.trade_time)
          tempArr.push(Object.assign({tradetime_format}, item))
        }
        this.setData({
          purchasesList: tempArr
        })
  
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 点击景区进入详情
  toSpotDetail: function (e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: '../../hot/detail/index?sid=' + sid,
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