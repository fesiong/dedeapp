import Taro, { Component } from '@tarojs/taro'
import { Block, View, Image } from '@tarojs/components'
import { AtLoadMore } from 'taro-ui'
import Empty from '../../components/empty'
import './index.scss'
const app = getApp()
export default class Product extends Component {
  static defaultProps = {
    products: [],
    loading: !1,
    column: 2,
  }

  static options = {
    addGlobalClass: true,
  }

  gotoProduct = (e) => {
    app.navigate({
      url: '/pages/product/index?id=' + e
    })
  }

  render() {
    const { products, loading, column } = this.props

    return (
      <Block>
        {products.length && <View className='product-list'>
          {products.map((item, index) => {
            return <View className={'product-item column-' + column} key={index} onClick={this.gotoProduct.bind(this, item.id)}>
              <View className='inner'>
                <View className='product-image'>
                  <Image className='image-item' mode='aspectFill' src={item.logo || '/assets/default.png'} />
                </View>
                <View className='product-meta'>
                  <View className='product-title'>{item.title}</View>
                </View>
              </View>
            </View>
          })}
        </View>}
        {loading && <AtLoadMore status='loading' />}
        {!products.length && !loading && <Empty title='该分类下没有产品' />}
      </Block>
    )
  }
}