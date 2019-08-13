const app = getApp()

Page({
  data: {
    adminLevel: {
      s: 1000,
      n: 2000
    },
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
    let adminsDataSource = this.data.adminsDataSource
    for (i = 0; i < usersDataSource.length; i++) {
      let user = usersDataSource[i]
      for (j = 0; j < adminsDataSource.length; j++) {
        let admin = adminsDataSource[j]
        if (admin.openid == user.openid) {
          user.adminIndex = j
          user.adminId = admin._id
          usersDataSource[i] = user
        }
      }
    }

    this.setData({
      usersDataSource: usersDataSource
    })
  },

  // 根据用户的openid查找存在的管理员对象
  getAdminModelWithOpenId: function(openId) {
    let res = this.data.adminsDataSource.filter(item => item.openid == openid)
    if (undefined == res || 0 >= res.length) {
      return undefined
    }

    return res[0]
  },

  // 用户名输入时，保存到当前数据模型
  onNameMarkInputAction: function(e) {
    let value = e.detail.value
    let index = e.target.dataset.index
    if (value) {
      let user = this.data.usersDataSource[index]
      let adminIndex = user.adminIndex
      let admin = this.data.adminsDataSource[adminIndex]
      admin.mark_name = value
      this.data.adminsDataSource[adminIndex] = admin
    }
  },

  // 修改备注名
  onEditMarkName: function(e) {
    let index = e.target.dataset.index
    let user = this.data.usersDataSource[index]
    let adminIndex = user.adminIndex
    let admin = this.data.adminsDataSource[adminIndex]

    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.admins_table_view).doc(admin._id).update({
      data: {
        mark_name: admin.mark_name
      },
      success: function(res) {
        wx.showToast({
          title: '修改成功',
          duration: 2000
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '修改失败',
          duration: 2000
        })
      }
    })
  },

  // 将用户设置为管理员
  onChangeAdminSetting: function(e) {
    let index = e.target.dataset.index
    let user = this.data.usersDataSource[index]

    const db = wx.cloud.database()
    let _this = this

    if (user.adminId) {
      db.collection(_this.data.admins_table_view).doc(user.adminId).remove({
        success: function (res) {
          wx.showToast({
            title: '删除成功',
            duration: 2000
          })

          let usersDataSource = _this.data.usersDataSource
          user.adminId = undefined
          user.adminIndex = undefined
          usersDataSource[index] = user
          _this.setData({
            usersDataSource: usersDataSource
          })
        },
        fail: function(e) {
          wx.showToast({
            title: '删除失败',
            duration: 2000
          })
        }
      })

      return
    }

    let admin = {
      openid: user.openid,
      level: _this.data.adminLevel.s,
      mark_name: user.nickName
    }

    db.collection(_this.data.admins_table_view).add({
      // data 字段表示需新增的 JSON 数据
      data: admin,
      success: function (res) {
        wx.showToast({
          title: '设置成功',
          duration: 2000
        })

        let usersDataSource = _this.data.usersDataSource
        let adminsDataSource = _this.data.adminsDataSource

        user.adminId = res._id
        admin._id = res._id
        user.adminIndex = adminsDataSource.length

        // 放在设置adminIndex后面，是因为这样刚好使得新下标等于原来的数组长度
        adminsDataSource.push(admin)
        usersDataSource[index] = user
        _this.setData({
          usersDataSource: usersDataSource,
          adminsDataSource: adminsDataSource
        })
      },
      fail: function(e) {
        wx.showToast({
          title: '设置失败',
          duration: 2000
        })
      }
    })
  },
})
