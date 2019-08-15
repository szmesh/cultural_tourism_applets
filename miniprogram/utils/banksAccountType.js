/* 收款帐号类型 */
const types = [
  { type: 1000, name: '储蓄卡' },
  { type: 2000, name: '信用卡' },
  { type: 3000, name: '支付宝帐号' },
  { type: 4000, name: '微信帐号' }
]

const type = {
  debit_card: 1000,
  credit_card: 2000,
  ali: 3000,
  wechat: 4000
}

function getTypeName (type) {
  for (let i = 0; i < types.length; i++) {
    let item = types[i]
    if (item.type === type) {
      return item.name
    }
  }

  return ''
}

module.exports = {
  types,
  type,
  getTypeName
}