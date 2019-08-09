var app = getApp();

Component({
  data: {
    userInfo: {},
    hasUserInfo: false,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 1
        })
      }
    }
  },
  methods: {
    onLoad() {
      // 测试openId，并显示
      if (app.globalData.userInfo.openid) {
        this.setData({
          openid: app.globalData.userInfo.openid
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
    myBill() {
      console.log('调用支付')
      app.unitedPayRequest('支付测试', 0.01)
    },
    gotoCommentatorsAction() {
      wx.navigateTo({
        url: '../commentators/index',
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
    showQRcode() {
      const path = getCurrentPages()
      console.log(path)
      wx.request({
        url: `https://api.weixin.qq.com/wxa/getwxacode?access_token=${app.globalData.access_token}`,
        method: 'POST',
        responseType: 'arraybuffer',
        data: {
          path: `pages/hot/index?userID=${this.data.openid}`
        },
        success: res => {
          console.log(res)
          const baseData = 'data:image/png;base64,'+ wx.arrayBufferToBase64(res.data)
          wx.previewImage({
            urls: [baseData],
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    }
  }
})
