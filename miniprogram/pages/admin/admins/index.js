const app = getApp()

Page({
  data: {
    admins_table_view: 'mcta_admins',
    users_table_view: 'mcta_users',
    userInfo: {},
    commetatorModel: {}
  },

  onLoad: function () {
    let _this = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      
    }
  },
})
