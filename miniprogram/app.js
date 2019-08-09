//app.js
var QQMapWX = require('./libs/qqmap/qqmap-wx-jssdk.js');
var md5 = require('./utils/md5.js')
var util = require('./utils/util.js')
var qqmapsdk;

App({
  data: {
    mapKey: 'TNABZ-4BYK3-V7J36-Y5WH7-46RCV-E7FCQ',
    cip: ''
  },

  onLaunch: function () {
    var _this = this;
    this.getCIP()
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
      appId: 'wx0c72bf852316254c',
      appSecret: 'f826a0aff906145032a3811c097f2a96',
      access_token: '',
      admins: [],
      locationCallBacks: [],
      parentId: '' // 上级用户ID
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
        _this.globalData.userInfo = res.userInfo
        _this.onGetOpenid()

        if (_this.userInfoReadyCallback) {
          _this.userInfoReadyCallback(res.userInfo)
        }
      },
      fail: function(e) {
        wx.showToast({
          title: '获取用户信息失败！',
          icon: none,
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
          icon: none,
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
          icon: none,
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
          icon: none,
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
  // 获取access token
  getAccessToken() {
    wx.request({
      url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.globalData.appId}&secret=${this.globalData.appSecret}`,
      success: res => {
        this.globalData.access_token = res.data.access_token
        console.log(res)
      },
      fail: err => {
        console.log(err)
      }
    })
  },
  // 统一支付接口，发起微信支付前调用
  unitedPayRequest(tradeId, price, description) {
    const _this = this
    const appid = 'wx0c72bf852316254c',
      openid = this.globalData.userInfo.openid,
    mch_id = '1549025261', //商户ID
    nonce_str = util.randomString(), //随机字符串
    body = description || 'JSAPI 支付测试', // 描述信息
    out_trade_no = util.createTradeNo(), // 商户订单号
    total_fee = parseInt(price * 100) || 1,  //支付金额，单位为分
    spbill_create_ip = this.data.cip, // 客户端IP地址
    notify_url = '192.168.3.12', // 通知地址
    trade_type = 'JSAPI', //交易类型
    key = 'starsys2019080811111111111111111' //商户平台设置的密钥
    // 签名拼接
    let paymentStr = `appid=${appid}&body=${body}&mch_id=${mch_id}&nonce_str=${nonce_str}&notify_url=${notify_url}&openid=${openid}&out_trade_no=${out_trade_no}&spbill_create_ip=${spbill_create_ip}&total_fee=${total_fee}&trade_type=${trade_type}`
    paymentStr += `&key=${key}`
    const sign = util.md5(paymentStr).toUpperCase()
    var formData = `<xml>
    <appid>${appid}</appid>
    <body>${body}</body>
    <mch_id>${mch_id}</mch_id>
    <nonce_str>${nonce_str}</nonce_str>
    <notify_url>${notify_url}</notify_url>
    <out_trade_no>${out_trade_no}</out_trade_no>
    <openid>${openid}</openid>
    <spbill_create_ip>${spbill_create_ip}</spbill_create_ip>
    <total_fee>${total_fee}</total_fee>
    <trade_type>${trade_type}</trade_type>
    <sign>${sign}</sign>
    </xml>`
    // 调用统一支付接口
    wx.request({
      url: 'https://api.mch.weixin.qq.com/pay/unifiedorder',
      method: 'POST',
      header: {'Content-Type': 'text/xml;charset=utf-8'},
      data: formData,
      success(res) {
        console.log('返回商户', res.data)
        var result_code = util.getXMLNodeValue('result_code', res.data);
        var resultCode = result_code.split('[')[2].split(']')[0];
        if (resultCode == 'FAIL') {
          var err_code_des = util.getXMLNodeValue('err_code_des', res.data);
          var errDes = err_code_des.split('[')[2].split(']')[0];
          wx.showToast({
            title: errDes,
            icon: 'none'
          })
        } else {
        // 准备发起支付
        const prepay_id = util.getXMLNodeValue('prepay_id', res.data)
      
       // this.data.prepay_id = prepay_id
        let tempStr = prepay_id.split('[')
        let prepayId = tempStr[2].split(']')[0]
        // sign
        let appId = 'wx0c72bf852316254c',
          nonceStr = util.randomString(),
          timeStamp = util.createTimeStamp(),
          signType = 'MD5'
          let stringSignTemp = `appId=${appId}&nonceStr=${nonceStr}&package=prepay_id=${prepayId}&signType=${signType}&timeStamp=${timeStamp}&key=${key}`;
          console.log(stringSignTemp)
        let paySign = md5(stringSignTemp).toUpperCase()
        const params = {
          timeStamp,
          nonceStr,
          prepayId,
          signType,
          paySign
        }
        // 正式发起支付
        _this.weixinPayment(params)
        }

      },
      fail(err) {
        wx.showToast({
          title: err,
          icon: 'none'
        })
        console.log(err)
      }
    })
  },
  // 发起微信支付
  weixinPayment({ timeStamp,
    nonceStr,
    prepayId,
    signType,
    paySign}) {
    wx.requestPayment({
      timeStamp,
      nonceStr,
      package: `prepay_id=${prepayId}`,
      signType,
      paySign,
      success: function (res) { 
        console.log(res)
      },
      fail: function (res) {
        console.log(res)
       }
    })
  },
  
  // 获取终端IP
  getCIP() {
    wx.request({
      url: 'https://pv.sohu.com/cityjson?ie=utf-8',
      success: res => {
        var temp = res.data
        var result = temp.substring(temp.indexOf(':') + 1, temp.indexOf(',')).trim()
        console.log(result.split('"')[1])
        this.data.cip = result.split('"')[1]
      }
    })
  }
})
