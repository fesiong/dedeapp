import Taro, { Component } from '@tarojs/taro'
import { View, Image } from '@tarojs/components'
import './index.scss'

export default class Header extends Component {
  static defaultProps = {
    logo: '',
    headerText: '',
    mobile: ''
  }

  static options = {
    addGlobalClass: true,
  }

  gotoHome = () => {
    Taro.natigateTo({
      url: '/pages/index/index'
    })
  }

  phoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.mobile
    })
  }

  render() {
    const { logo, headerText, mobile } = this.props
    return (
      <View className='header'>
        <View className='header-logo' onClick={this.gotoHome}><Image className='logo' mode='aspectFill' src={logo}/></View>
        <View className='header-text'>{headerText}</View>
        <View className='header-contact' onClick={this.phoneCall}>
          <View className='mobile-tips'>联系电话：</View>
          <View className='mobile'>{mobile}</View>
        </View>
      </View>
    )
  }
}