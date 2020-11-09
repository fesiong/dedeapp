import { Component } from 'nervjs'
import Taro, { getCurrentPages } from '@tarojs/taro'

import 'taro-ui/dist/style/components/activity-indicator.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/divider.scss'
import 'taro-ui/dist/style/components/flex.scss'
import 'taro-ui/dist/style/components/load-more.scss'
import 'taro-ui/dist/style/components/loading.scss'
import 'taro-ui/dist/style/components/tabs.scss'

import './app.scss'

class App extends Component {

  navigate = (t) => {
    (getCurrentPages() || []).length >= 5 ? Taro.redirectTo(t) : Taro.navigateTo(t)
  }

  getCache = (t) => {
    return this.cacheData[t]
  }

  setCache = (t, a) => {
    this.cacheData[t] = a
  }

  cacheData = {}

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App