import Taro, { Component, Config } from '@tarojs/taro'
import { AtTabs } from 'taro-ui'
import Container from '../../components/container'
import Article from '../../components/article'
import Banner from '../../components/banner'
import appConfig from '../../config'
import Api from '../../api'
import './index.scss'

export default class ArticlesPage extends Component {
  config: Config = {
    navigationBarTitleText: '新闻中心'
  }

  articleList = []

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
    Api.articles({
      tags: JSON.stringify({
        categories: {
          tag: 'categories',
          args: {
            model: 'article',
            ignoreCategory: appConfig.ignoreCategory
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
        this.getTabArticles(0)
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: pageConfig.seoTitle,
          keywords: pageConfig.keywords,
          description: pageConfig.description,
          image: pageConfig.logo,
          success: function () {
            console.log('新闻中心关键词配置成功');
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
      this.getTabArticles(e)
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

  getTabArticles = (currentId) => {
    let currentCategory = this.state.categories[currentId]
    let currentList = this.articleList[currentId] || { list: [], page: 1 }
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
      categoryId: currentCategory.id
    }).then(res => {
      let articles = res.data || []
      currentList.page++
      currentList.loading = !1
      currentList.finished = !res.hasNext
      currentList.count = res.count
      currentList.list = currentList.list.concat(articles)
      this.articleList[currentId] = currentList
      this.setState({
        currentList: currentList
      })
    })
  }

  onReachBottom() {
    let { currentId } = this.state
    this.getTabArticles(currentId)
  }

  gotoArticle = (e) => {
    Taro.navigateTo({
      url: '/pages/article/index?id=' + e
    })
  }

  render() {
    const { currentId, currentList, categories, swiper, fixed } = this.state
    return (
      <Container showFooter>
        <Banner list={swiper}/>
        {categories.length && <AtTabs className={'tabs' + (fixed ? 'fixed-top' : '')} scroll current={currentId} tabList={categories} onClick={this.clickTab}>
        </AtTabs>}
        {currentList.list.length && <Article articles={currentList.list} loading={currentList.loading} />}
      </Container>
    )
  } a
}