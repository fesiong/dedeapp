import Taro, { Component, Config } from '@tarojs/taro'
import { AtTabs } from 'taro-ui'
import Container from '../../components/container'
import Product from '../../components/product'
import Banner from '../../components/banner'
import appConfig from '../../config'
import Api from '../../api'
import './index.scss'

export default class ProductsPage extends Component {
  config: Config = {
    navigationBarTitleText: '产品中心'
  }

  productList = []

  state = {
    swiper: [],
    categories: [],
    currentId: 0,
    currentList: {
      page: 1,
      loading: !1,
      finished: !1,
      list: [],
    },
    pageConfig: {},
    fixed: !1,
  }

  componentWillMount() { }

  componentDidMount() {
    Api.products({
      tags: JSON.stringify({
        categories: {
          tag: 'categories',
          args: {
            ignoreCategory: appConfig.ignoreCategory,
            categoryId: appConfig.productCategory,
            model: 'product'
          }
        },
        swiper: {
          tag: 'articles',
          args: {
            row: 3,
            flag: 'a'
          }
        },
      })
    }).then(res => {
      let pageConfig = res.data.pageConfig || {};
      this.setState({
        swiper: res.data.swiper.data || [],
        categories: res.data.categories || [],
        pageConfig: pageConfig
      }, () => {
        this.getTabProducts(0)
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: pageConfig.seoTitle,
          keywords: pageConfig.keywords,
          description: pageConfig.description,
          image: pageConfig.logo,
          success: function () {
            console.log('产品中心关键词配置成功');
          }
        })
      }
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: err.msg || err.message
      })
    })
  }

  clickTab = (e) => {
    if (e == this.state.currentId) {
      return
    }
    this.setState({
      currentId: e
    }, () => {
      this.getTabProducts(e)
    });
  }

  onPageScroll(e) {
    let top = e.scrollTop
    if (top > 150) {
      this.setState({
        fixed: !0
      })
    } else {
      this.setState({
        fixed: !1,
      })
    }
  }

  getTabProducts = (currentId) => {
    let currentCategory = this.state.categories[currentId]
    let currentList = this.productList[currentId] || { list: [], page: 1 }
    if (currentList.loading || currentList.finished) {
      this.setState({
        currentList: currentList,
      })
      return
    }
    currentList.loading = !0
    this.setState({
      currentList: currentList,
    })
    Api.list({
      page: currentList.page,
      row: 10,
      categoryId: currentCategory.id,
      // order: "desc",
      // sudDay: 7,
      // keyword: "指定关键词",
      // flag: "c,f",
      // ids: "1,2,3",
      // orderby: "hot"//hot|click|sort|id|near|last|rand
    }).then(res => {
      let products = res.data || []
      currentList.page++
      currentList.loading = !1
      currentList.finished = !res.hasNext
      currentList.count = res.count
      currentList.list = currentList.list.concat(products)
      this.productList[currentId] = currentList
      this.setState({
        currentList: currentList
      })
    })
  }

  onReachBottom() {
    let { currentId } = this.state
    this.getTabProducts(currentId)
  }
  
  gotoProduct = (e) => {
    Taro.navigateTo({
      url: '/pages/product/index?id=' + e
    })
  }

  render() {
    const { currentId, currentList, categories, swiper, fixed } = this.state
    return (
      <Container showFooter>
        <Banner list={swiper}/>
        {categories.length && <AtTabs className={'tabs' + (fixed ? 'fixed-top' : '')} scroll current={currentId} tabList={categories} onClick={this.clickTab}>
        </AtTabs>}
        {currentList.list.length && <Product products={currentList.list} loading={currentList.loading} />}
      </Container>
    )
  }
}