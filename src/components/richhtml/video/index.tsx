import Taro, { Component, Config } from '@tarojs/taro'
import { Video } from '@tarojs/components'
import './index.scss'

export default class RichVideo extends Component {

  static defaultProps = {
    attrs: {},
    nodes: [],
  }

  static options = {
    addGlobalClass: true,
  }

  render () {
    const { attrs, nodes } = this.props

    return (
      <Video className={attrs.className} style={attrs.style} src={attrs.src}></Video>
    )
  }
}