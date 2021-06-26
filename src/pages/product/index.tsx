import Nerv, { Component } from 'nervjs'
import Taro, { getApp } from '@tarojs/taro'
import { View, Image, Block, Text } from '@tarojs/components'
import { AtTag, AtLoadMore } from 'taro-ui'
import Container from '../../components/container'
import RichHtml from '../../components/richhtml'
import Product from '../../components/product'
import Utils from '../../utils'
import Api from '../../api'
import './index.scss'
const app = getApp()
export default class ProductPage extends Component {

  state = {
    fetched: !1,
    product: {},
    related: [],
  }

  id = 0

  componentWillMount() {
    this.id = this.$router.params.id
  }

  componentDidMount() {
    Api.product({
      id: this.id,
      tags: JSON.stringify({
        related: {
          tag: 'products',
          args: {
            row: 6,
            id: this.id,
            orderby: 'near',
          }
        }
      })
    }).then((res) => {
      let product = res.data.product
      product.formatDate = Utils.dateFormat(product.addTime)
      product.dateTime = Utils.dateTimeFormat(product.addTime)
      this.setState({
        fetched: !0,
        product: product,
        related: res.data.related.data
      })
      Taro.setNavigationBarTitle({
        title: product.title
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: product.seoTitle || product.title,
          keywords: product.keywords || '',
          description: product.description || '',
          articleTitle: product.title,
          release_date: product.dateTime,
          // 单张图时值可以是字符串
          image: product.logo,
          success: function () {
            console.log('产品基础信息设置完成');
          }
        })
      }
    }).catch(res => {
      console.log(res)
      Taro.showToast({
        icon: 'none',
        title: '页面内容加载失败'
      })
    })
  }

  gotoCategory = (e) => {
    app.navigate({
      url: '/pages/category/index?id=' + e
    })
  }

  gotoProduct = (e) => {
    app.navigate({
      url: '/pages/product/index?id=' + e
    })
  }

  render() {
    const { product, fetched, related } = this.state
    return (
      <Container showFooter>
        <View className='article'>
          {product.logo && <Image className='article-logo' src={product.logo} mode='widthFix' />}
          <View className='article-header'>
            <View className='article-title'>{product.title}</View>
            <View className='article-meta'>
              {product.category && <Text
                className='article-meta-item link'
                onClick={this.gotoCategory.bind(this, product.categoryId)}
              >{product.category.title}</Text>}
              {product.author && <Text
                className='article-meta-item'
              >{product.author}</Text>}
              <Text
                className='article-meta-item'
              >{product.formatDate}</Text>
            </View>
          </View>
          <View className='panel'>
          <View className='panel-title'><Text className='title-text'>产品详情</Text></View>
          </View>
          <View className='article-content'>
            {fetched ?
              <RichHtml fullscreen={false} bgColor='#ffffff' content={product.content} />
              :
              <AtLoadMore
                status='loading'
              />
            }
          </View>
          <View className='article-footer'>
            {product.prev && <View className='footer-item' onClick={this.gotoProduct.bind(this, product.prev.id)}>上一产品：<Text className='link'>{product.prev.title}</Text></View>}
            {product.next && <View className='footer-item' onClick={this.gotoProduct.bind(this, product.next.id)}>下一产品：<Text className='link'>{product.next.title}</Text></View>}
          </View>
          <View className='panel'>
            <View className='panel-title'><Text className='title-text'>相关产品</Text></View>
            <View className='panel-content no-padding'>
              {related.length && <Product products={related} />}
            </View>
          </View>
        </View>
      </Container>
    )
  }
}