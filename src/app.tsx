import Taro, { Component, Config, getCurrentPages } from '@tarojs/taro'
import Index from './pages/index'
import appConfig from './config'

import 'taro-ui/dist/style/components/activity-indicator.scss'
import 'taro-ui/dist/style/components/button.scss'
import 'taro-ui/dist/style/components/divider.scss'
import 'taro-ui/dist/style/components/flex.scss'
import 'taro-ui/dist/style/components/load-more.scss'
import 'taro-ui/dist/style/components/loading.scss'
import 'taro-ui/dist/style/components/tabs.scss'

import './app.scss'

class App extends Component {

  config: Config = {
    pages: [
      'pages/index/index',
      'pages/category/index',
      'pages/articles/index',
      'pages/article/index',
      'pages/products/index',
      'pages/product/index',
      'pages/about/index',
      'pages/contact/index',
      'pages/browser/index',
    ],
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#3998fc',
      defaultTitle: appConfig.title,
      titleBarColor: "#3998fc",
      gestureBack: "YES",
      navigationBarTitleText: appConfig.title,
      navigationBarTextStyle: 'white'
    },
    tabBar: {
      color: "#666",
      selectedColor: "#f44",
      backgroundColor: "#fafafa",
      borderStyle: 'black',
      list: [{
        pagePath: "pages/index/index",
        iconPath: "./assets/home.png",
        selectedIconPath: "./assets/home-selected.png",
        text: "首页"
      },
      {
        pagePath: "pages/products/index",
        iconPath: "./assets/shop.png",
        selectedIconPath: "./assets/shop-selected.png",
        text: "产品中心"
      },
      {
        pagePath: "pages/articles/index",
        iconPath: "./assets/article.png",
        selectedIconPath: "./assets/article-selected.png",
        text: "文章中心"
      },
      {
        pagePath: "pages/about/index",
        iconPath: "./assets/about.png",
        selectedIconPath: "./assets/about-selected.png",
        text: "关于我们"
      },
      {
        pagePath: "pages/contact/index",
        iconPath: "./assets/contact.png",
        selectedIconPath: "./assets/contact-selected.png",
        text: "联系我们"
      }]
    }
  }

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

  // 在 App 类中的 render() 函数没有实际作用
  // 请勿修改此函数
  render () {
    return (
      <Index />
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
