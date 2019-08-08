//app.js
var QQMapWX = require('./libs/qqmap/qqmap-wx-jssdk.js');
var qqmapsdk;

App({
  data: {
    mapKey: 'TNABZ-4BYK3-V7J36-Y5WH7-46RCV-E7FCQ',
    accessTokenUrl: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wxb62bb3a704a7d662&secret=899a0bc306a62d34cda63d3e8bd8dedc'
  },

  onLaunch: function () {
    var _this = this;

    // 本地缓存服务
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        traceUser: true,
      })
    }

    wx.getSetting({
      success: function (res) {
        // 用户信息授权
        if (res.authSetting['scope.userInfo']) {
          _this.getUserInfo()
        } else {
          // 没有授权，重定向到 loading 启动页
          wx.navigateTo({
            url: '/pages/loading/index'
          })
        }

        // 用户位置授权
        if (res.authSetting['scope.userLocation']) {
          _this.getUserCurrentLocation()
        } else {
          _this.authLocationModal()
        }
      },
      fail: e => {
        wx.hideToast()
      }
    })

    // 实例化API核心类
    qqmapsdk = new QQMapWX({
      key: _this.data.mapKey
    })

    // app全局保存数据
    this.globalData = {
      access_token: '',
      admins: [],
      locationCallBacks: [],
      parentId: '-1', // 上级用户ID
      userLocation: {}
    },
    this.getAccessToken()
    const { query } = wx.getLaunchOptionsSync()
    if (query.userID) {
      this.globalData.parentId = query.userID
    }
  },
  
  getUserInfo: function() {
    let _this = this
    wx.getUserInfo({
      success: function (res) {
        console.log('用户信息获取成功：')
        console.log(res)
        let userInfo = res.userInfo
        userInfo.parentId = _this.globalData.parentId
        _this.globalData.userInfo = userInfo
        _this.onGetOpenid()

        if (_this.userInfoReadyCallback) {
          _this.userInfoReadyCallback(res.userInfo)
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '获取用户信息失败！',
          duration: 1000
        })
      }
    })
  },

  // 获取用户的openID
  onGetOpenid: function () {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        this.globalData.userInfo.openid = res.result.userInfo.openId
        this.onAddUser()
        this.getAdminList()
      },
      fail: err => {
        wx.showToast({
          title: 'openid获取失败',
          duration: 1000
        })
      }
    })
  },

  // 保存用户信息
  onAddUser: function () {
    const db = wx.cloud.database()

    // 先查询有没有数据
    db.collection('mcta_users').where({
      _openid: this.globalData.userInfo.openid,
    }).get({
      success: res => {
        if (0 < res.data.length) {
          this.globalData.userInfo.userId = res.data[0]._id
        } else {
          this.insertUser()
        }
      },
      fail: err => {
        this.insertUser()
      }
    })
  },

  // 真正插入数据到数据库中
  insertUser: function () {
    const db = wx.cloud.database()

    let userInfo = this.globalData.userInfo

    db.collection('mcta_users').add({
      data: userInfo,
      success: res => {
        // 在返回结果中会包含新创建的记录的 _id
        this.globalData.userInfo.userId = res._id
      },
      fail: err => {
        wx.showToast({
          title: '插入会员失败！',
          duration: 1000
        })
      }
    })
  },

  // 应用一开始就获取了所有的管理员
  getAdminList: function () {
    const db = wx.cloud.database()

    db.collection('mcta_admins').get({
      success: res => {
        if (0 < res.data.length) {
          this.globalData.admins = res.data
          let admin = this.getAdminData()
          this.globalData.currentUserAdmin = admin
        }
      }
    })
  },

  // 检查是否是管理员
  getAdminData: function () {
    let openid = this.globalData.userInfo.openid
    let res = this.globalData.admins.filter(item => item.openid == openid)
    if (undefined == res || 0 >= res.length) {
      return undefined
    }

    return res[0]
  },

  // 获取用户位置
  getUserCurrentLocation: function () {
    let _this = this
    wx.getLocation({
      type: 'wgs84',
      success(res) {
        const latitude = res.latitude
        const longitude = res.longitude
        const speed = res.speed
        const accuracy = res.accuracy

        // 保存经纬度
        let userLocation = {
          latitude: latitude,
          longitude: longitude
        }
        _this.globalData.userLocation = userLocation

        _this.getReverseGeocoderLocation(longitude, latitude)
      }
    })
  },

  // 根据经纬度返回具体地址
  getReverseGeocoderLocation: function(lon, lat) {
    let _this = this
    qqmapsdk.reverseGeocoder({
      location: {
        latitude: lat,
        longitude: lon
      },
      success: function(res) {
        _this.globalData.location = res.result
        for(let i in _this.globalData.locationCallBacks) {
          let callback = _this.globalData.locationCallBacks[i]
          callback(_this.globalData.location)
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '地址信息查找失败',
          duration: 2000
        })
      }
    })
  },

  // 返回当前用户的地址信息对象
  getCacheUserCurrentLocation: function(callback) {
    this.globalData.locationCallBacks.push(callback)
  },

  // 显示获取当前位置的授权
  authLocationModal: function() {
    let _this = this
    wx.authorize({
      scope: 'scope.userLocation',
      success: function() {
        wx.showToast({
          title: '授权成功',
          icon: 'success',
          duration: 1000
        })

        _this.getUserCurrentLocation()
      }
    })
  },

  // 将地址切割为省市区
  getArea: function (str) {
    let area = {}
    let index11 = 0
    let index1 = str.indexOf("省")
    if (index1 == -1) {
      index11 = str.indexOf("自治区")
      if (index11 != -1) {
        area.province = str.substring(0, index11 + 3)
      } else {
        area.province = str.substring(0, 0)
      }
    } else {
      area.province = str.substring(0, index1 + 1)
    }

    let index2 = str.indexOf("市")
    if (index11 == -1) {
      area.city = str.substring(index11 + 1, index2 + 1)
    } else {
      if (index11 == 0) {
        area.city = str.substring(index1 + 1, index2 + 1)
      } else {
        area.city = str.substring(index11 + 3, index2 + 1)
      }
    }

    let index3 = str.lastIndexOf("区")
    if (index3 == -1) {
      index3 = str.indexOf("县")
      area.zone = str.substring(index2 + 1, index3 + 1)
    } else {
      area.zone = str.substring(index2 + 1, index3 + 1)
    }

    area.address = str.replace(area.province + area.city + area.zone, '')

    return area;
  },

  getAccessToken() {
    wx.request({
      url: this.data.accessTokenUrl,
      success: res => {
        this.globalData.access_token = res.data.access_token
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  
  geoDistance: function(lat2, lng2) {
    if (!this.globalData.userLocation.latitude) {
      return
    }

    let lat1 = this.globalData.userLocation.latitude
    let lng1 = this.globalData.userLocation.longitude

    let radLat1 = this.rad(lat1);
    let radLat2 = this.rad(lat2);
    let a = radLat1 - radLat2;
    let b = this.rad(lng1) - this.rad(lng2);
    let s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)));
    s = s * 6378.137;// EARTH_RADIUS;
    s = Math.round(s * 10000) / 10000; //输出为公里
    return s.toFixed(2);
  },

  rad: function(d) {
    return d * Math.PI / 180.0;
  }
})
