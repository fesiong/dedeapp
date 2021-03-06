import Nerv, { Component } from 'nervjs'
import Taro from '@tarojs/taro'
import { WebView } from '@tarojs/components'
import './index.scss'

export default class BrowserPage extends Component {

  state = {
    url: ''
  }

  componentWillMount () {
    this.setState({
      url: this.$router.params.url
    })
  }

  loadError() {
    Taro.showToast({
      icon: "none",
      title: '页面加载失败',
    })
  }

  loadSuccess(e) {
    console.log(e)
  }

  render () {
    const { url } = this.state
    return (
      <WebView onError={this.loadError} onLoad={this.loadSuccess} src={url} />
    )
  }
}

