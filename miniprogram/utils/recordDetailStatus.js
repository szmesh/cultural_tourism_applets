/* 进入记录详情界面，或者编辑界面的状态 */
const status = {
  view: 1000,
  edit: 2000,
  add: 3000,
  reject: 4000
}

function getStatusName (status) {
  if (status.view === status) {
    return '查看'
  }

  if (status.edit === status) {
    return '编辑'
  }

  if (status.add === status) {
    return '新增'
  }

  if (status.reject === status) {
    return '拒绝'
  }

  return ''
}

module.exports = {
  status,
  getStatusName
}