var app = getApp();

Component({
  data: {
    location: {address_component: {city: '未知'}},
    bannerCollection: 'mcta_home_banners',
    spot_table_view: 'mcta_scenic_spots',
    image_table_view: 'mcta_images',
    item_table_view: 'mcta_scenic_spots_items',
    banners: [],
    hotCities: [
      '广东',
      '四川',
      '海南',
      '云南',
      '贵州',
      '重庆',
      '广西',
      '新疆',
      '西藏',
      '湖南'
    ],
    dataSources: [],
    indicatorDots: true,
    vertical: false,
    autoplay: true,
    circular: false,
    interval: 3000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
    pagination: {
      current: 1,
      size: 10,
      total: 0,
      prev: 1,
      next: 1
    }
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
      this.getBanners()
    }
  },
  methods: {
    onLoad(option) {
      if (option.userID) {
        app.globalData.parentId = option.userID
      }

      let _this = this

      // 注册当前城市回调，定位有一定延时，所以需要订阅，定位有结果就会回调并刷新界面
      app.getCacheUserCurrentLocation(loc => {
        let dataSources = _this.data.dataSources

        // 计算距离当前用户
        dataSources.forEach(item => {
          let distance = app.geoDistance(item.latitude, item.longitude)
          item.distance = distance
        })

        _this.setData({
          location: loc,
          dataSources: dataSources
        })
      })

      // 查询所有的景区列表
      this.getSpotsDataSources()
    },

    getBanners() {
      const db = wx.cloud.database()
      db.collection(this.data.bannerCollection).get({
        success: res => {
          this.setData({
            banners: res.data
          })
        },
        fail: err => {
          console.log(err)
        }
      })
    },

    getSpotsDataSources() {
      let _this = this
      const db = wx.cloud.database()
      
      // 获取景区主数据
      db.collection(_this.data.spot_table_view).get({
        success: res => {
          if(res && 0 < res.data.length) {
            _this.setData({
              dataSources: res.data
            })

            // 如果已有位置信息，则计算距离
            if (_this.data.location.address) {
              _this.data.dataSources.forEach(item => {
                let distance = app.geoDistance(item.latitude, item.longitude)
                item.distance = distance
              })
            }

            // 查询图片集和讲解点
            _this.data.dataSources.forEach((item, index) => {
              _this.getImagesSetForSpot(item._id, index)
            })
          } else {
            _this.setData({
              dataSources: []
            })
          }
        },
        fail: err => {
          wx.showToast({
            title: '未找到景区记录',
            duration: 2000
          })

          _this.setData({
            dataSources: []
          })
        }
      })
    },

    // 查询景区的图片集
    getImagesSetForSpot(sid, index) {
      let _this = this
      const db = wx.cloud.database()
      db.collection(_this.data.image_table_view).where({
        s_id: sid,
        type: 2000
      }).get({
        success: res => {
          if (res && res.data) {
            let dataSources = _this.data.dataSources
            let model = dataSources[index]
            model.imagessDataSources = res.data

            _this.setData({
              dataSources: dataSources
            })

            _this.getItemsSetForSpot(sid, index)
          }
        },
        fail: err => {
          console.log(err)
        }
      })
    },

    // 查询景区的讲解点集
    getItemsSetForSpot(sid, index) {
      let _this = this
      let db = wx.cloud.database()
      db.collection(_this.data.item_table_view).where({
        s_id: sid
      }).get({
        success: res => {
          if(res && res.data) {
            let dataSources = _this.data.dataSources
            let model = dataSources[index]
            model.itemsDataSources = res.data

            _this.setData({
              dataSources: dataSources
            })
          }
        },
        fail: err => {
          console.log(err)
        }
      })
    },

    // 点击景区进入详情
    onSpotDetailButtonAction: function (e) {
      let sid = e.currentTarget.dataset.sid
      wx.navigateTo({
        url: 'detail/index?sid=' + sid,
      })
    }
  }
})
