import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import RichView from './view'
import html2Json from './utils/html2Json'
import './index.scss'

export default class SeoRichHtml extends Component {
  static defaultProps = {
    fullscreen: false,
    bgColor: '',
    content: '',
  }

  static options = {
    addGlobalClass: true,
  }

  state = {
    nodes: [],
  }

  componentWillMount() {
    const { content } = this.props
    let nodes = html2Json(content)
    this.setState({
      nodes: nodes
    })
  }

  componentWillReceiveProps(prevProp, nextProp) {
    if (nextProp.content != prevProp.content) {
      let nodes = html2Json(nextProp.content)
      this.setState({
        nodes: nodes
      })
    }
  }

  render() {
    const { fullscreen, bgColor } = this.props
    const { nodes } = this.state
    console.log(nodes)

    let scontentStyle = bgColor ? ' background-color:' + bgColor + ';' : ''
    scontentStyle += !fullscreen ? 'padding:15px;' : ''
    return <View style={scontentStyle}><RichView nodes={nodes} /></View>
  }
}