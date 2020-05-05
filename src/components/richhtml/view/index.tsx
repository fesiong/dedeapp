import Taro, { Component } from '@tarojs/taro'
import { View, Text, RichText } from '@tarojs/components'
import RichImage from '../image'
import SeoVideo from '../video'
import './index.scss'

export default class RichView extends Component {
  static defaultProps = {
    name: '',
    attrs: {},
    nodes: []
  }

  config = {
    usingComponents: {
      'rich-view': './index'
    }
  }

  static options = {
    addGlobalClass: true,
  }

  jumpLink = (attrs) => {
    let { href, dataType = '', dataId = 0 } = attrs
    if (href) {
      //这是一个连接
      if(href.indexOf('http') !== -1){
        return Taro.navigateTo({
          url: '/pages/browser/index?url=' + href
        })
      }else if(href.indexOf('/pages') !== -1) {
        Taro.navigateTo({
          url: href
        }).catch(err => {
          Taro.switchTab({
            url: href
          })
        })
      }
    } else if (dataType && dataId) {
      return Taro.navigateTo({
        url: '/pages/' + dataType + '/index?id=' + dataId
      })
    } else {
      return Taro.switchTab({
        url: '/pages/index/index'
      })
    }
  }

  renderText(text) {
    return <Text space='nbsp' decode selectable>{text}</Text>
  }

  renderVideo(attrs) {
    return <SeoVideo className={attrs.className} customStyle={attrs.style} componentData={{ src: attrs.src, autoplay: false, loop: false }}></SeoVideo>
  }

  renderLink(attrs, name, nodes = []) {
    return <View onClick={this.jumpLink.bind(this, attrs)} className={attrs.class} style={attrs.style} selectable>
      {nodes && nodes.length > 0 && <RichView attrs={attrs} name={name} nodes={nodes} />}
    </View>
  }

  render() {
    const { attrs = {}, nodes = [], name } = this.props

    return <View className={attrs.class + ' ' + (nodes && nodes.length > 1 && name ? '' : 'rich-' + name)} style={attrs.style}>
      {nodes && nodes.length > 0 && nodes.map((item, index) => {
        return item &&
          item.type ? this.renderText(item.text)
          : item.tagName == 'img' ? <RichImage attrs={item.attrs} nodes={item.children} />
            : item.tagName == 'video' ? this.renderVideo(item.attrs)
              : item.tagName == 'a' ? this.renderLink(item.attrs, item.name, item.children || [])
                : item.name == 'table' ? <RichText nodes={item.children} />
                  : (item.tagName == 'text' || item.tagName == 'view' || item.tagName == 'pre') ? <RichView attrs={item.attrs} name={item.name} nodes={item.children} />
                    : item.children && item.children.length ? <RichText nodes={item.children} />
                      : ''
      })}
    </View>
  }
}
