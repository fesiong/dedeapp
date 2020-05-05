import Taro, { Component, Config } from '@tarojs/taro'
import { View, Image, Block, Text } from '@tarojs/components'
import { AtTabs } from 'taro-ui'
import Container from '../../components/container'
import Product from '../../components/product'
import Article from '../../components/article'
import Banner from '../../components/banner'
import appConfig from '../../config'
import Api from '../../api'
import './index.scss'

export default class IndexPage extends Component {
  config: Config = {
    navigationBarTitleText: appConfig.title
  }

  state = {
    nav: appConfig.indexNav || [],
    swiper: appConfig.indexBanner || [],
    pageConfig: {},
    categories: [],
    recommendArticles: [],
    recommendProducts: [],
    showProduct: appConfig.showProduct
  }

  componentDidMount() {
    if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
      swan.setPageInfo({
        title: appConfig.seoTitle,
        keywords: appConfig.keywords,
        description: appConfig.description,
        image: appConfig.logo,
        success: function () {
          console.log('首页关键词首次配置成功');
        }
      })
    }

    let tags = {
      swiper: {
        tag: 'posts',
        args: {
          row: 3,
          flag: 'f'
        }
      },
      recommendArticles: {
        tag: 'articles',
        args: {
          row: 4,
          flag: 'c'
        }
      },
    }
    if(this.state.showProduct){
      tags['recommendProducts'] = {
        tag: 'products',
        args: {
          row: 4,
          flag: 'c'
        }
      }
    }
    
    Api.index({
      tags: JSON.stringify(tags)
    }).then(res => {
      let pageConfig = res.data.pageConfig || {}
      let recommendProducts = res.data.recommendProducts && res.data.recommendProducts.data || []
      let recommendArticles = res.data.recommendArticles.data || []
      let swiper = res.data.swiper && res.data.swiper.data || []
      if(swiper.length){
        this.setState({
          swiper: swiper
        })
      }
      Taro.setNavigationBarTitle({
        title: pageConfig.seoTitle
      })
      this.setState({
        recommendProducts: recommendProducts,
        recommendArticles: recommendArticles,
        pageConfig: pageConfig
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: pageConfig.seoTitle,
          keywords: pageConfig.keywords,
          description: pageConfig.description,
          image: pageConfig.logo,
          success: function () {
            console.log('首页关键词配置成功');
          }
        })
      }
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: err.msg || err.message
      })
    })

    this.loadIndexCategories()
  }

  loadIndexCategories() {
    Api.default({
      tags: JSON.stringify({
        categories: {
          tag: 'categories',
          args: {
            row: 10,
            categoryId: appConfig.indexCategory
          },
          children: {
            posts: {
              tag: 'posts',
              args: {
                row: 10,
                categoryId: 'parent:id'
              },
            }
          }
        }
      })
    }).then(res => {
      //console.log(res);
      let categories = res.data.categories || []
      this.setState({
        categories: categories,
      })
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: err.msg || err.message
      })
    })
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

  handleNavClick = (e) => {
    Taro.switchTab({
      url: e
    }).catch(res => {
      Taro.navigateTo({
        url: e
      })
    });
  }

  render() {
    const { swiper, nav, showProduct, recommendProducts, recommendArticles, categories } = this.state
    return (
      <Container showFooter>
        <Banner list={swiper}/>
        <View className='at-row at-row--wrap index-grid'>
          {nav.map((item, index) => {
            return <View className='at-col grid-item' key={index}>
            <View className='' onClick={this.handleNavClick.bind(this, item.url)}>
            <Image mode='aspectFill' className='grid-image' src={item.logo}/>
              <View className='grid-text'>{item.title}</View>
            </View>
          </View>
          })
          }
        </View>
        {showProduct && recommendProducts.length && <View className='panel'>
          <View className='panel-title'><Text className='title-text'>推荐产品</Text></View>
          <View className='panel-content no-padding'>
            <Product products={recommendProducts} />
          </View>
        </View>}
        {recommendArticles.length && <View className='panel'>
          <View className='panel-title'><Text className='title-text'>热门文章</Text></View>
          <View className='panel-content no-padding'>
            <Article articles={recommendArticles} />
          </View>
        </View>}
        {categories.length && <Block>
          {categories.map((category, index) => {
            return <View className='panel' key={category.id}>
            <View className='panel-title'><Text className='title-text'>{category.title}</Text></View>
            <View className='panel-content no-padding'>
              {category.model == 'product' && <Product products={category.posts ? category.posts.data : []} />}
              {category.model == 'article' && <Article articles={category.posts ? category.posts.data : []} />}
            </View>
          </View>
          })}
        </Block>}
      </Container>
    )
  }
}