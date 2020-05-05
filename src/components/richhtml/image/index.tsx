import Taro, { Component, Config } from '@tarojs/taro'
import { Image } from '@tarojs/components'
import './index.scss'

export default class RichImage extends Component {

  // static defaultProps = {
  //   attrs: {},
  //   nodes: [],
  // }

  state = {
    width: 0,
    height: 0,
  }

  static options = {
    addGlobalClass: true,
  }

  onLoad = (e) => {
    if(e.detail){
      let {width, height} = e.detail
    
      if(width >= 355){
        this.setState({
        //  width: "355px",
        //  height: 355*height/width
        })
      }else{
        this.setState({
          width: width + 'px',
        //  height: height + 'px',
        })
      }
    }
  }

  preview = (src, e) => {
    e.stopPropagation()
    //h5下，在pc端无法关闭的bug， 所以不支持预览图片
    if (Taro.ENV_TYPE.WEB !== Taro.getEnv()) {
      Taro.previewImage({
        urls: [src]
      })
    }
  }

  render () {
    const { attrs = {} } = this.props
    const {width, height} = this.state
    return (
      <Image mode='widthFix' onLoad={this.onLoad} onClick={this.preview.bind(this, attrs.src)} className={attrs.className} src={attrs.src} style={'max-width: 100%;width: ' + (width || '100%') + ';'} />
    )
  }
}