Page({
  onShareAppMessage() {
    return {
      title: 'map',
      path: '/pages/map/map'
    }
  },

  data: {
    latitude: 23.099994,
    longitude: 113.324520,
    showLocation: true,
    markers: [{
      latitude: 23.099994,
      longitude: 113.324520,
      name: 'T.I.T 创意园'
    }],
    covers: [{
      latitude: 23.099994,
      longitude: 113.344520,
      iconPath: '/images/map/location.png'
    }, {
      latitude: 23.099994,
      longitude: 113.304520,
        iconPath: '/images/map/location.png'
    }],
    polygons: [{
      points: [
        {
          latitude: 23.099994,
          longitude: 113.324520,
        },
        {
          latitude: 23.098994,
          longitude: 113.323520,
        },
        {
          latitude: 23.098994,
          longitude: 113.325520,
        }
      ],
      strokeWidth: 3,
      strokeColor: '#FFFFFFAA',
    }],
    subKey: 'TNABZ-4BYK3-V7J36-Y5WH7-46RCV-E7FCQ',
    enable3d: false,
    showCompass: false,
    enableOverlooking: false,
    enableZoom: true,
    enableScroll: true,
    enableRotate: false,
    drawPolygon: false,
    enableSatellite: false,
    enableTraffic: false,
  },
  toggle3d() {
    this.setData({
      enable3d: !this.data.enable3d
    })
  },
  toggleShowCompass() {
    this.setData({
      showCompass: !this.data.showCompass
    })
  },
  toggleOverlooking() {
    this.setData({
      enableOverlooking: !this.data.enableOverlooking
    })
  },
  toggleZoom() {
    this.setData({
      enableZoom: !this.data.enableZoom
    })
  },
  toggleScroll() {
    this.setData({
      enableScroll: !this.data.enableScroll
    })
  },
  toggleRotate() {
    this.setData({
      enableRotate: !this.data.enableRotate
    })
  },
  togglePolygon() {
    this.setData({
      drawPolygon: !this.data.drawPolygon
    })
  },
  toggleSatellite() {
    this.setData({
      enableSatellite: !this.data.enableSatellite
    })
  },
  toggleTraffic() {
    this.setData({
      enableTraffic: !this.data.enableTraffic
    })
  }
})
