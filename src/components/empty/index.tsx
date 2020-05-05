import Taro, { Component } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import './index.scss'

export default class Empty extends Component {
  static defaultProps = {
    image: '',
    title: '没有内容',
    description: ''
  }

  static options = {
    addGlobalClass: true,
  }

  render() {
    const { image, title, description } = this.props

    return (
      <View className='empty'>
        {image && <Image mode='widthFix' src={image} />}
        <Text className='image-text2'>{title}</Text>
        {description && <Text className='image-text2'>{description}</Text>}
      </View>
    )
  }
}