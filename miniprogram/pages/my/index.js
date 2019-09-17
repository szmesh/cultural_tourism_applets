const app = getApp();

Page({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    globalData: app.globalData
  },
  doWXLogin() {
    app.doAuthorize()
  },
  onShow() {
    this.setData({
      globalData: app.globalData
    })
    if (typeof this.getTabBar === 'function' &&
      this.getTabBar()) {
      this.getTabBar().setData({
        selected: 1
      })
    }
  },
  onLoad() {
    this.setData({
      globalData: app.globalData
    })
    // 测试openId，并显示
    if (app.globalData.access_token) {
      this.setData({
        openid: app.globalData.access_token
      })
    }

    // 获取当前用户是否管理员的信息
    if (app.globalData.currentUserAdmin) {
      this.setData({
        currentUserAdmin: app.globalData.currentUserAdmin
      })
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo,
        hasUserInfo: true,
      })
    } else if (this.data.canIUse) {
      // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
      // 所以此处加入 callback 以防止这种情况
      app.userInfoReadyCallback = (res) => {
        this.setData({
          userInfo: res,
          hasUserInfo: true
        })
      }
    } else {
      // 在没有 open-type=getUserInfo 版本的兼容处理
      wx.getUserInfo({
        success: res => {
          app.globalData.userInfo = res.userInfo
          this.setData({
            userInfo: res.userInfo,
            hasUserInfo: true
          })
        }
      })
    }
  },
  navigateTo(e) {
    if (!app.globalData.isLogin) {
      app.loginSuggest()
      return
    }
    var url = e.currentTarget.dataset.url
    wx.navigateTo({
      url
    })
    this.getTabBar().setData({
      selected: 1
    })
  },
  gotoCommentatorsAction() {
    wx.navigateTo({
      url: '../commentators/index',
    })

    this.getTabBar().setData({
      selected: 1
    })
  },
  gotoAdminPageAction() {
    wx.navigateTo({
      url: '../admin/index',
    })

    this.getTabBar().setData({
      selected: 1
    })
  },
  getUserInfo(e) {
    app.globalData.userInfo = e.detail.userInfo
    this.setData({
      userInfo: e.detail.userInfo,
      hasUserInfo: true
    })
  },
})