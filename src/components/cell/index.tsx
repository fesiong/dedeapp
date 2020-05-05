import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import './index.scss'

export default class Empty extends Component {
  static defaultProps = {
    title: '',
    value: '',
    onClick: () => {}
  }

  static options = {
    addGlobalClass: true,
  }

  render() {
    const { title, value } = this.props

    return (
      <View className='cell' onClick={this.props.onClick}>
        <View className='cell-title'>{title}</View>
        <View className='cell-value'>{value}</View>
      </View>
    )
  }
}