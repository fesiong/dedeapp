import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import Version from '../../version'
import './index.scss'

export default class Footer extends Component {
  static defaultProps = {
    company: '',
    address: '',
    mobile: '',
    // footerText: '',
    // copyright: '',
  }

  static options = {
    addGlobalClass: true,
  }

  phoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.props.mobile
    })
  }

  showPath = () => {
    let a = Taro.getCurrentPages(),
    n = {},
    r = a[a.length - 1],
    g = r.route,
    s = r.options || {},
    c = s && JSON.stringify(s),
    v = Version;
    let u = ["该小程序由邦权小程序开发团队开发并提供技术支持，联系电话：17097218761","小程序版本号：" + v, "页面路径", g]
    c && "{}" !== c && u.push("页面参数", c), n.page = g, n.query = s;
    Taro.showModal({
      title: "小程序信息",
      content: u.join("\n"),
      confirmText: "确定",
      showCancel: !1,
      success: function() {
        Taro.setClipboardData({
          data: JSON.stringify(n)
        });
      }
    });
  }

  render() {
    //const { company, address, mobile, footerText, copyright } = this.props

    return (
      <View className='footer'>
        <View className='footer-service' onClick={this.showPath}>邦权小程序开发团队提供技术支持</View>
        <View className='fixed-fab' onClick={this.phoneCall}>
          <Image mode='aspectFit' className='fab-icon' src='/assets/phone.png' />
        </View>
      </View>
    )
  }
}