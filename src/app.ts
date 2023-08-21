import { Component } from 'react'
import 'taro-ui/dist/style/components/activity-indicator.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/divider.scss'
import 'taro-ui/dist/style/components/flex.scss'
import 'taro-ui/dist/style/components/load-more.scss'
import 'taro-ui/dist/style/components/loading.scss'
import 'taro-ui/dist/style/components/tabs.scss'

import './app.scss'

class App extends Component {

  // this.props.children 是将要会渲染的页面
  render () {
    return this.props.children
  }
}

export default App
