import { Component }from 'nervjs'
import Taro, { getApp } from '@tarojs/taro'
import { View, Image, Block, Text } from '@tarojs/components'
import { AtTag, AtLoadMore } from 'taro-ui'
import Container from '../../components/container'
import RichHtml from '../../components/richhtml'
import Article from '../../components/article'
import Utils from '../../utils'
import Api from '../../api'
import './index.scss'
const app = getApp()
export default class ArticlePage extends Component {

  state = {
    fetched: !1,
    article: {},
    related: [],
  }

  id = 0

  componentWillMount() {
    this.id = this.$router.params.id
  }

  componentDidMount() {
    Api.article({
      id: this.id,
      tags: JSON.stringify({
        related: {
          tag: 'articles',
          args: {
            row: 6,
            id: this.id,
            orderby: 'near',
          }
        }
      })
    }).then((res) => {
      let article = res.data.article
      article.formatDate = Utils.dateFormat(article.addTime)
      article.dateTime = Utils.dateTimeFormat(article.addTime)
      this.setState({
        fetched: !0,
        article: article,
        related: res.data.related.data
      })
      Taro.setNavigationBarTitle({
        title: article.title
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: article.seoTitle || article.title,
          keywords: article.keywords || '',
          description: article.description || '',
          articleTitle: article.title,
          release_date: article.dateTime,
          // 单张图时值可以是字符串
          image: article.logo,
          success: function () {
            console.log('文章基础信息设置完成');
          }
        })
      }
    }).catch(res => {
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

  gotoArticle = (e) => {
    app.navigate({
      url: '/pages/article/index?id=' + e
    })
  }

  render() {
    const { article, fetched, related } = this.state
    return (
      <Container showFooter>
        <View className='article'>
          <View className='article-header'>
            <View className='article-title'>{article.title}</View>
            <View className='article-meta'>
              {article.category && <Text
                className='article-meta-item link'
                onClick={this.gotoCategory.bind(this, article.categoryId)}
              >{article.category.title}</Text>}
              {article.author && <Text
                className='article-meta-item'
              >{article.author}</Text>}
              <Text
                className='article-meta-item'
              >{article.formatDate}</Text>
            </View>
          </View>
          <View className='article-content'>
            {fetched ?
              <RichHtml fullscreen={false} bgColor='#ffffff' content={article.content} />
              :
              <AtLoadMore
                status='loading'
              />
            }
          </View>
          <View className='article-footer'>
            {article.prev && <View className='footer-item' onClick={this.gotoArticle.bind(this, article.prev.id)}>上一篇：<Text className='link'>{article.prev.title}</Text></View>}
            {article.next && <View className='footer-item' onClick={this.gotoArticle.bind(this, article.next.id)}>下一篇：<Text className='link'>{article.next.title}</Text></View>}
          </View>
          <View className='panel'>
            <View className='panel-title'><Text className='title-text'>相关文章</Text></View>
            <View className='panel-content no-padding'>
              {related.length && <Article articles={related} />}
            </View>
          </View>
        </View>
      </Container>
    )
  }
}

