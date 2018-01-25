import test from 'ava'
import BigView from '../../bigview'
import Biglet from '../../biglet'
import ctx from '../../../test/fixtures/context'

/**
 * 随机，先完成的先写入，即pipeline模式(当前)
 *
 * 检查点：
 *
 *  - 1) 写入模块，检查cache为空
 *  - 2）检查p1和p2的顺序
 */

test('MODE pipeline', t => {

  let bigview = new BigView(ctx, 'tpl', {})
  bigview.mode = 'pipeline'

  let result = []

  var p1 = new Biglet()
  p1.owner = bigview
  p1.fetch = function () {
    return sleep(3000).then(() => {
      // console.log('p1')
      result.push('p1')
    })
  }

  p1.parse = function () {
    return Promise.reject(new Error('p1 reject'))
  }

  var p2 = new Biglet()
  p2.owner = bigview
  p2.fetch = function () {
    return sleep(1000).then(() => {
      // console.log('p2')
      result.push('p2')
    })
  }

  p2.parse = function () {
    return Promise.reject(new Error('p2 reject'))
  }

  let pagelets = [p1, p2]

  return bigview.getModeInstanceWith('pipeline').execute(pagelets).then(function(){
    // console.log(result)
    t.is(result[0], 'p2')
    t.is(result[1], 'p1')
  })
})

function sleep (time) {
  return new Promise((resolve) => setTimeout(resolve, time))
}