import Nerv, { Component } from 'nervjs'
import Taro, { getApp } from '@tarojs/taro'
import { View, Text, Image } from '@tarojs/components'
import { AtDivider, AtLoadMore } from 'taro-ui'
import Container from '../../components/container'
import RichHtml from '../../components/richhtml'
import Product from '../../components/product'
import Article from '../../components/article'
import Utils from '../../utils'
import Api from '../../api'
import './index.scss'

const app = getApp()

export default class CategoryPage extends Component {

  id = 0
  page = 1

  state = {
    category: {},
    list: [],
    count: 0,
    fetched: !1,
    loading: !1,
    finished: !1,
  }

  componentWillMount() {
    this.id = this.$router.params.id
  }

  componentDidMount() {
    Api.category({
      id: this.id,
      child: true
    }).then(res => {
      let category = res.data.category
      category.formatDate = Utils.dateFormat(category.addTime)
      category.dateTime = Utils.dateTimeFormat(category.addTime)
      this.setState({
        fetched: !0,
        category: category
      })
      Taro.setNavigationBarTitle({
        title: category.title
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: category.seoTitle || category.title,
          keywords: category.keywords || '',
          description: category.description || '',
          articleTitle: category.title,
          release_date: category.dateTime,
          // 单张图时值可以是字符串
          image: category.logo,
          success: function () {
            console.log('分类基础信息设置完成');
          }
        })
      }
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: '获取分类信息失败'
      })
    })
    this.page = 1
    this.setState({
      list: [],
      loading: !1,
      finished: !1
    }, () => {
      this.getDatas()
    })
  }

  onPullDownRefresh() {
    this.page = 1
    this.setState({
      list: [],
      loading: !1,
      finished: !1
    }, () => {
      this.getDatas()
    })
  }

  onReachBottom() {
    this.getDatas()
  }

  getDatas() {
    let { list, finished, loading } = this.state
    if (finished || loading) {
      return
    }
    this.setState({
      loading: !0,
    })
    Api.list({
      page: this.page,
      row: 10,
      categoryId: this.id
    }).then(res => {
      Taro.stopPullDownRefresh()
      this.setState({
        list: list.concat(res.data || []),
        count: res.count,
        finished: !res.hasNext,
        loading: !1,
      })
      this.page++
    })
  }

  changeCategory = (e) => {
    app.navigate({
      url: '/pages/category/index?id=' + e
    })
  }

  render() {
    const { list, count, category, fetched, finished, loading } = this.state
    return (
      <Container showFooter>
        <View className='article'>
          {category.logo && <Image className='article-logo' src={category.logo} mode='widthFix' />}
          {fetched ?
            <View className='article-header'>
              <View className='article-title text-center'>{category.title}</View>
              <View className='article-meta'>
                {category.children && <View className='at-row at-row--wrap sub-categories'>
                  {category.children.map((item, index) => {
                    return <View className='at-col at-col-4' key={index}>
                      <View className='sub-category-item' onClick={this.changeCategory.bind(this, item.id)}>{item.title}</View>
                    </View>
                  })}
                </View>}
                <Text className='article-meta-item'>共{count}篇{category.model == 'product' ? '产品' : '文章'}</Text>
              </View>
            </View>
            :
            <AtLoadMore
              status='loading'
            />
          }
          {category.nodes && category.nodes.length && <View className='article-content'>
            <RichHtml fullscreen={false} bgColor='#ffffff' content={category.content} />
          </View>}
        </View>
        {category.model == 'product' && <Product products={list} loading={loading} />}
        {category.model != 'product' && <Article articles={list} loading={loading} />}
        {finished && <AtDivider className='divider' content='没有更多了' />}
        {loading && <AtDivider className='divider' content='加载中...' />}
        {(!loading && !finished) && <AtDivider className='divider' content='滚动加载更多' />}
      </Container>
    )
  }
}