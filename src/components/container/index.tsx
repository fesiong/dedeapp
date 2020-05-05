import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import Header from '../header'
import Footer from '../footer'
import appConfig from '../../config'
import Api from '../../api'
import './index.scss'

export default class Container extends Component {
  static defaultProps = {
    showHeader: false,
    showFooter: false,
  }

  static options = {
    addGlobalClass: true,
  }

  state = {
    setting: {
      mobile: appConfig.mobile,
      company: appConfig.company,
      address: appConfig.address,
    }
  }

  componentDidMount() {
    let { setting } = this.state
    Api.setting().then(res => {
      this.setState({
        setting: Object.assign(setting, res.data.setting)
      })
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: err.msg || err.message
      })
    })
    Api.update().then(res => {
    }).catch(err => {
      if(err.code == 101){
        Taro.showModal({
          title: '授权提示',
          showCancel: !1,
          content: err.msg || err.message,
        })
      }else if(err.code == 102){
        Taro.showModal({
          title: '新版提示',
          showCancel: !1,
          content: err.msg || err.message,
        })
      }
    })
  }

  render() {
    const { showHeader, showFooter, children } = this.props
    const { setting } = this.state

    return (
      <View className='container network-theme'>
        {this.props.showHeader && <Header logo={setting.logo} headerText={setting.headerText} mobile={setting.mobile}/>}
        {children}
        {this.props.showFooter && <Footer company={setting.company} address={setting.address} copyright={setting.copyright} footerText={setting.footerText} mobile={setting.mobile}/>}
      </View>
    )
  }
}