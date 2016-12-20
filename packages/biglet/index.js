'use strict'

const debug = require('debug')('biglet')
const fs = require('fs')

/**
 *
 *
 */

module.exports = class Pagelet {
  constructor () {
     this.name = 'defaultname'
     this.data = {}
     this.tpl = 'index.html'
     this.root = '.'
     this.selector = 'selector' // css
     this.location = 'location' //location
     this.isMock = false
     this.options = {} // for compiler
     this.done = false
     this.previewFile = 'biglet.html'
     this.delay = 0
     this.children = []
     this.html = ''
     this.js = ''
     this.css = ''
  }

  addChild (SubPagelet) {
    let subPagelet
    if ((SubPagelet + '').split('extends').length === 1){
      subPagelet = SubPagelet
    } else {
      subPagelet = new SubPagelet()
    }
    
    this.children.push(subPagelet)
  }

  mock (file) {
    if (file) this.previewFile = file

    this.isMock = true
    this._exec()
  }

  // private only call by bigview
  // step1: fetch data
  // step2: compile(tpl + data) => html
  // step3: write html to browser
  _exec () {
    let self = this
    
    if (this.owner && this.owner.done === true) return
    debug('  Pagelet fetch')

    self.data.po = {}
    var arr = ['name', 'tpl', 'root', 'selector', 'location', 'options', 'done', 'delay', 'children']

    for(var i in arr) {
      var k = arr[i]
      self.data.po[k] = self[k]
    }

    return self.fetch()
      .then(self.complile.bind(self))
      .then(self.finish.bind(self))
  }

  fetch () {
    let self = this
    return new Promise(function(resolve, reject){
      setTimeout(function() {
        // self.owner.end()
        resolve(self.data)
      }, self.delay)
    })
  }
  
  log () {
    let self = this
    return new Promise(function(resolve, reject){
      debug('log')
      // resolve(self.data)
    })
  }

  render (tpl, data) {
    const ejs = require('ejs')
    let self = this

    return new Promise(function(resolve, reject){
      ejs.renderFile(tpl, data, self.options, function(err, str){
          // str => Rendered HTML string
          if (err) {
            console.log(err)
            reject(err)
          }
         
          resolve(str)
      })
    })
  }

  complile () {
    if (this.owner && this.owner.done === true) return

    let self = this

    return self.render(self.root + '/' + self.tpl, self.data).then(function(str){
      self.html = str
      // writeToBrowser
      if(!self.isMock) self.owner.write(str)
      
      return Promise.resolve(true)
    }).catch(function(err) {      
      console.log('complile' + err)
    }) 
  }

  noopPromise () {
    let self = this
    return new Promise(function(resolve, reject){
      resolve(true)
    })
  }

  finish () {
    let self = this
    let q = []
    for (let i in this.children) {
      let subPagelet = this.children[i]
      subPagelet.owner = this.owner

      q.push(subPagelet._exec())
    }

    return Promise.all(q).then(function(){
      self.out()
      self.done = true
    }) 
  }

  out () {
    // 子的pagelets如何处理
    if (this.isMock && this.previewFile) fs.writeFileSync(this.previewFile, this.html,  'utf8')
  }
  
  toJsHtml (html, quotation) {
    let regexp
    if (quotation === "'") {
      regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\')|(\t)/g
    }else{
      regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\")|(\t)/g
    }
    
    return html.replace(regexp, function (word) {
      var char = word.substring(0, 1)
      
      if (char === "\r" || char === "\n") {
        return "\\n"
      }else if (char === '"') {
        return '\\"'
      }else if (char === "'") {
        return "\\'"
      }else if (char === "\t") {
        return "\\t"
      }else{
        return word
      }
    })
  }
  
  toLineHtml (html) {
    let regexp = /(\r\n(\s)*)|(\n(\s)*)|(\r(\s)*)|(\")|(\t)/g

    return html.replace(regexp, function (word) {
      var char = word.substring(0, 1)
      
      if(char === "\r" || char === "\n"){
        return ""
      }else if (char === "\t") {
        return ""
      }else{
        return word
      }
    })
  }
}
