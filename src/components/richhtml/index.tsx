import { Component } from 'react'
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

  componentWillReceiveProps(nextProps) {
    if (nextProps.content != this.props.content) {
      let nodes = html2Json(nextProps.content)
      this.setState({
        nodes: nodes
      })
    }
  }

  render() {
    const { fullscreen, bgColor } = this.props
    const { nodes } = this.state

    let scontentStyle = bgColor ? ' background-color:' + bgColor + ';' : ''
    scontentStyle += !fullscreen ? 'padding:5px;' : ''
    return <View style={scontentStyle}><RichView nodes={nodes} /></View>
  }
}
