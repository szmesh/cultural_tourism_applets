Component({
  data: {
    selected: 0,
    color: "#7A7E83",
    selectedColor: "#000000",
    list: [{
      pagePath: "/pages/hot/index",
      iconPath: "/images/tabs/hot_normal.png",
      selectedIconPath: "/images/tabs/hot_highlight.png",
      text: "解说 "
    }, {
        pagePath: "/pages/my/index",
        iconPath: "/images/tabs/my_normal.png",
        selectedIconPath: "/images/tabs/my_highlight.png",
      text: "我的"
    }]
  },
  attached() {
  },
  methods: {
    switchTab(e) {
      const data = e.currentTarget.dataset
      const url = data.path
      wx.switchTab({url})
      this.setData({
        selected: data.index
      })
    },
    gotoPageAction(url) {
      console.log(2)
      wx.navigateTo({
        url: url,
      })
    }
  }
})