const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    comments_table_view: 'mcta_commentators_comments',
    action_types: {
      n: 1000,
      e: 2000,
      a: 3000
    },
    status: {
      apply: 1000,
      accept: 2000,
      reject: 3000
    },
    dataSource: []
  },

  onLoad: function () {
    if (!wx.cloud) {
      wx.redirectTo({
        url: '../../../chooseLib/chooseLib',
      })
      return
    }

    this.getWaitApprovalDataSource()
  },

  // 查询未审批的导游
  getWaitApprovalDataSource: function() {
    const db = wx.cloud.database()
    let _this = this
    db.collection(_this.data.table_view).where({
      status: _this.data.status.apply
    }).get({
      success: function(res) {
        _this.setData({
          dataSource: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '获取审批列表失败',
          duration: 2000
        })
      }
    })
  },

  detailButtonAction: function(e) {
    let sid = e.currentTarget.dataset.sid
    wx.navigateTo({
      url: '../../commentators/verify/index?sid=' + sid + '&action_type=' + this.data.action_types.a,
    })
  }
})
