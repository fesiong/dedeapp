import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { WebView } from '@tarojs/components'
import './index.scss'
import { getCurrentInstance } from '@tarojs/runtime'

export default class BrowserPage extends Component {

  state = {
    url: ''
  }

  componentWillMount () {
    let params: any = getCurrentInstance().router?.params;
    this.setState({
      url: params.url
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

