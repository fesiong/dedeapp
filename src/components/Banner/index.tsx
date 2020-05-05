import Taro, { Component } from '@tarojs/taro'
import { View, Image, Swiper, SwiperItem } from '@tarojs/components'
import './index.scss'

export default class Banner extends Component {
  static defaultProps = {
    list: [],
  }

  static options = {
    addGlobalClass: true,
  }
  
  gotoPosts = (e, m) => {
    if(!e){
      return
    }
    if(m == 'product'){
      this.gotoProduct(e)
    }else{
      this.gotoArticle(e)
    }
  }

  gotoProduct = (e) => {
    Taro.navigateTo({
      url: '/pages/product/index?id=' + e
    })
  }

  gotoArticle = (e) => {
    Taro.navigateTo({
      url: '/pages/article/index?id=' + e
    })
  }

  render() {
    const { list } = this.props
    return (
      <View>
        {list.length && <Swiper
          className='swiper'
          circular
          indicatorDots
          autoplay>
          {list.map((item, index) => {
            return <SwiperItem key={index}>
              <View className='swiper-item' onClick={this.gotoPosts.bind(this, item.id, item.model)}>
                <Image className='swiper-image' mode='aspectFill' src={item.logo} />
                {item.title && <View className='swiper-text'>{item.title}</View>}
              </View>
            </SwiperItem>
          })}
        </Swiper>}
      </View>
    )
  }
}