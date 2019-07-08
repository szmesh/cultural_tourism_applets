var app = getApp();

Component({
  data: {
    location: {address_component: {city: '未知'}},
    banners: [
      'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/banner/1.jpg',
      'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/banner/2.jpg',
      'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/banner/3.jpg',
      'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/banner/4.jpg'
    ],
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
    mocks: [
      {
        point: 40,
        image: 'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/city_background/1.jpg',
        owner: '广东民间工艺博物馆',
        distance: '2232',
        sell: 167800,
        view: 5030
      },
      {
        point: 21,
        image: 'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/city_background/2.jpg',
        owner: '黄埔军校旧址纪念馆',
        distance: '3950',
        sell: 37800,
        view: 6810
      },
      {
        point: 15,
        image: 'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/city_background/3.jpg',
        owner: '北京路文化旅游区',
        distance: '200000',
        sell: 2250,
        view: 187
      },
      {
        point: 37,
        image: 'cloud://mesh-7ams1.6d65-mesh-7ams1/poc/images/city_background/4.jpg',
        owner: '广东近代革命历史博物馆',
        distance: '1852',
        sell: 3092,
        view: 1670
      }
    ],
    indicatorDots: true,
    vertical: false,
    autoplay: false,
    circular: false,
    interval: 2000,
    duration: 500,
    previousMargin: 0,
    nextMargin: 0,
  },
  pageLifetimes: {
    show() {
      if (typeof this.getTabBar === 'function' &&
        this.getTabBar()) {
        this.getTabBar().setData({
          selected: 0
        })
      }
    }
  },
  methods: {
    onLoad() {
      let _this = this
      // 注册地址回调
      app.getCacheUserCurrentLocation(loc => {
        _this.setData({
          location: loc
        })
      })
    },
  },
})
