const app = getApp()

Page({
  data: {
    table_view: 'mcta_commentators',
    comments_table_view: 'mcta_commentators_comments',
    imagesCloundPath: 'cultural_tourism/commentators/',
    action_types: {
      n: 1000,
      e: 2000,
      a: 3000
    },
    img_type: {
      icon: 1000,
      id_card_img_front: 2000,
      id_card_img_back: 3000
    },
    status: {
      apply: 1000,
      accept: 2000,
      reject: 3000
    },
    genders: ['保密','女','男'],
    userInfo: {},
    model: {
      name: '',
      u_id: '',
      openid: '',
      gender: '保密',
      id_card: '',
      label: '',
      intr: '',
      img: '',
      id_card_img_front: '',
      id_card_img_back: '',
      status: 1000,
      province: '',
      city: '',
      zone: '',
      latitude: '',
      longitude: '',
      b_count: 0,
      l_count: 0,
      c_count: 0,
      des: ''
    },
    comments: {
      c_id: '',
      a_user_id: '',
      a_user_openid: '',
      a_user_name: '',
      des: '',
      time: ''
    }
  },

  onLoad: function (options) {
    if (undefined != options.sid && 0 < options.sid.length) {
      this.setData({
        sid: options.sid
      })

      this.data.comments.c_id = options.sid
    }

    // 进入详细或新增，或审批类型
    if (undefined != options.action_type) {
      this.setData({
        action_type: options.action_type
      })
    }

    if (app.globalData.userInfo) {
      this.setData({
        userInfo: app.globalData.userInfo
      })

      this.data.model.u_id = this.data.userInfo.userId
      this.data.model.openid = this.data.userInfo.openid
      this.data.comments.a_user_id = this.data.userInfo.userId
      this.data.comments.a_user_openid = this.data.userInfo.openid
    }

    if (app.globalData.currentUserAdmin) {
      this.setData({
        currentUserAdmin: app.globalData.currentUserAdmin
      })

      this.data.comments.a_user_name = this.data.currentUserAdmin.mark_name
    }

    // 判断是否是编辑或审批
    if(undefined == this.data.sid || 0 >= this.data.sid.length) {
      return
    }

    // 获取数据
    this.getDetail()
  },

  // 根据给的记录id，查询对应记录的详情
  getDetail: function() {
    let _this = this
    const db = wx.cloud.database()
    db.collection(_this.data.table_view).doc(_this.data.sid).get({
      success: function(res) {
        _this.setData({
          model: res.data
        })
      },
      fail: function(err) {
        wx.showToast({
          title: '没找到对应数据',
          duration: 2000
        })
      }
    })
  },

  // 真名
  onInputName: function (e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.name = ''
    } else {
      this.data.model.name = value
    }
  },

  // 个人标签
  onInputLabel: function(e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.label = ''
    } else {
      this.data.model.label = value
    }
  },

  // 个人简介
  onInputIntr: function(e) {
    let value = e.detail.value
    if (undefined == typeof (info)) {
      this.data.model.intr = ''
    } else {
      this.data.model.intr = value
    }
  },

  // 审批意见
  onDes: function(e) {
    let value = e.detail.value
    if(value) {
      this.data.comments.des = value
    } else {
      this.data.comments.des = ''
    }
  },

  onSaveButtonAction: function() {
    if(!this.verifyInput()) {
      return
    }

    if(this.data.sid) {
      this.updateItem()
    } else {
      this.addItem()
    }
  },

  onApprovalButtonAction: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    model.status = this.data.status.accept
    db.collection(this.data.table_view).doc(this.data.sid).update({
      data: {
        status: model.status
      },
      success: function (res) {
        wx.showToast({
          title: '通过成功',
          duration: 2000
        })

        wx.navigateBack({
          delta: 1
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '通过失败',
          duration: 2000
        })
      }
    })
  },

  onRejectButtonAction: function() {
    const db = wx.cloud.database()

    // 先检测回绝说明
    if(!this.data.comments.des) {
      wx.showToast({
        title: '请填写回绝理由',
        duration: 2000
      })
      return
    }

    let model = this.data.comments
    model.time = (new Date()).valueOf()
    let _this = this
    db.collection(this.data.comments_table_view).add({
      data: model,
      success: function (res) {
        _this.rejectActionAfterComments()
      },
      fail: function (err) {
        wx.showToast({
          title: '回绝失败',
          duration: 2000
        })
      }
    })
  },

  rejectActionAfterComments: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    model.status = this.data.status.reject

    db.collection(this.data.table_view).doc(this.data.sid).update({
      data: {
        status: this.data.status.reject
        },
      success: function (res) {
        wx.showToast({
          title: '回绝成功',
          duration: 2000
        })

        wx.navigateBack({
          delta: 1
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '回绝失败',
          duration: 2000
        })
      }
    })
  },

  addItem: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    let pagesArr = getCurrentPages()
    db.collection(this.data.table_view).add({
      data: model,
      success: function (res) {
        wx.showToast({
          title: '增加成功',
          duration: 2000
        })

        model._id = res._id
        wx.navigateBack({
          delta: 1,
          success: function(res) {
            let parentPage = pagesArr[pagesArr.length - 2]
            parentPage.setData({
              commetatorModel: model
            })
          }
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '增加失败',
          duration: 2000
        })
      }
    })
  },

  updateItem: function() {
    const db = wx.cloud.database()
    let model = this.data.model
    model.status = this.data.status.apply
    delete model._id
    delete model._openid
    db.collection(this.data.table_view).doc(this.data.sid).update({
      data: model,
      success: function (res) {
        wx.showToast({
          title: '重新申请成功',
          duration: 2000
        })

        wx.navigateBack({
          delta: 1
        })
      },
      fail: function (err) {
        wx.showToast({
          title: '重新申请失败',
          duration: 2000
        })
      }
    })
  },

  // 检查数据
  verifyInput: function() {
    if (undefined == typeof (this.data.model.name)
      || 0 >= this.data.model.name.length) {
      wx.showToast({
        title: '请输入真实姓名',
        duration: 2000
      })
      return false
    }

    if(undefined == typeof(this.data.model.city) ||
    0 >= this.data.model.city.length) {
      wx.showToast({
        title: '请选择所在城市',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.label) ||
      0 >= this.data.model.label.length) {
      wx.showToast({
        title: '请填写个人标签',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.intr) ||
      0 >= this.data.model.intr.length) {
      wx.showToast({
        title: '请填写个人简介',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.img)
      || 0 >= this.data.model.img.length) {
      wx.showToast({
        title: '请上传真实头像',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.id_card_img_front)
      || 0 >= this.data.model.id_card_img_front.length) {
      wx.showToast({
        title: '请上传身份证正面',
        duration: 2000
      })
      return false
    }

    if (undefined == typeof (this.data.model.id_card_img_back)
      || 0 >= this.data.model.id_card_img_back.length) {
      wx.showToast({
        title: '请上传身份证反面',
        duration: 2000
      })
      return false
    }

    return true
  },

  // 选择图片
  chooseImage(e) {
    // 判断是否是审批
    if (this.data.action_types.a == this.data.action_type) {
      return
    }

    let that = this
    let type = e.currentTarget.dataset.type
    wx.chooseImage({
      sourceType: ['camera', 'album'],
      sizeType: ['original'],
      count: 1,
      success(res) {
        let filePaths = res.tempFilePaths
        let filePath = filePaths[0]

        wx.showToast({
          title: '上传中...',
          icon: 'loading',
        })

        let matchArray = filePath.match(/\.[^.]+?$/)
        let suffix = matchArray[0]
        that.data.model.file_type = suffix.substr(1)
        var timestamp = (new Date()).valueOf()
        let cloudPath = that.data.imagesCloundPath
          + '/' + timestamp + suffix
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            let model = that.data.model
            if (that.data.img_type.icon == type) {
              model.img = res.fileID
            }

            if (that.data.img_type.id_card_img_front == type) {
              model.id_card_img_front = res.fileID
            }

            if (that.data.img_type.id_card_img_back == type) {
              model.id_card_img_back = res.fileID
            }

            that.setData({
              model: model
            })
          },
          fail: err => {
            wx.hideToast()
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          }
        })
      }
    })
  },

  // 选择性别
  bindPickerChange: function(e) {
    // 判断是否是审批
    if (this.data.action_types.a == this.data.action_type) {
      return
    }

    let model = this.data.model
    model.gender = this.data.genders[e.detail.value]
    this.setData({
      model: model
    })
  },

  // 进入地图
  onOpenMap: function () {
    // 判断是否是审批
    if(this.data.action_types.a == this.data.action_type) {
      return
    }

    let _this = this
    wx.chooseLocation({
      success: function (res) {
        let add = app.getArea(res.address)
        let model = _this.data.model
        model.province = add.province
        model.city = add.city
        model.zone = add.zone
        model.latitude = add.latitude
        model.longitude = add.longitude

        _this.setData({
          model: model
        })
      },
      fail: function (e) {
        wx.showToast({
          title: '无法打开地图',
          icon: none,
          duration: 2000
        })
      }
    })
  },
})
