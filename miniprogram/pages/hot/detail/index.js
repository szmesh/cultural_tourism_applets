
const app = getApp()

Page({
  data: {
    spots_table_view: 'mcta_scenic_spots',
    spot_items_table_view: 'mcta_scenic_spots_items',
    userInfo: {}
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../chooseLib/chooseLib',
      })
      return
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })
    }
  },
})
