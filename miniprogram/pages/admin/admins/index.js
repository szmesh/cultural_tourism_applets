const app = getApp()

Page({
  data: {
    admins_table_view: 'mcta_admins',
    users_table_view: 'mcta_users',
    usersDataSource: [],
    adminsDataSource: []
  },

  onLoad: function () {
    let _this = this

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      // 获取所有用户
      this.getUsersDataSource()
    }
  },

  getUsersDataSource: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.users_table_view).get({
      success: res => {
        if (0 < res.data.length) {
          this.setData({
            usersDataSource: res.data
          })

          // 获取所有管理员
          this.getAdminsDataSource()
        } else {
          this.setData({
            usersDataSource: []
          })
        }
      },
      fail: err => {
        this.setData({
          usersDataSource: []
        })
      }
    })
  },

  getAdminsDataSource: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.admins_table_view).get({
      success: res => {
        if (0 < res.data.length) {
          _this.setData({
            adminsDataSource: res.data
          })

          // 根据管理员列表重置用户列表
          _this.resetUsersDataSourceWithAdmins()
        } else {
          _this.setData({
            adminsDataSource: []
          })
        }
      },
      fail: err => {
        _this.setData({
          adminsDataSource: []
        })
      }
    })
  },

  resetUsersDataSourceWithAdmins: function() {
    let usersDataSource = this.data.usersDataSource
    for (let i = 0; i < usersDataSource.length; i++) {
        let user = usersDataSource[i]
      let adminsFilter = this.data.adminsDataSource.filter(item => item._openid == user._openid)
      if(undefined == adminsFilter || 0 >= adminsFilter.length) {
        continue
      }

      user.adminIndex = i
      user.adminId = adminsFilter[i]._id
      usersDataSource[i] = user
    }

    this.setData({
      usersDataSource: usersDataSource
    })
  },

  // 根据用户的openid查找存在的管理员对象
  getAdminModelWithOpenId: function(openId) {
    let res = this.data.adminsDataSource.filter(item => item._openid == openid)
    if (undefined == res || 0 >= res.length) {
      return undefined
    }

    return res[0]
  }
})
