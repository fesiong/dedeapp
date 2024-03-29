import { Component } from 'react'
import { Block, View, Image } from '@tarojs/components'
import { AtLoadMore } from 'taro-ui'
import Empty from '../empty'
import './index.scss'
import utils from '@/utils'

export default class Article extends Component {
  static defaultProps = {
    articles: [],
    loading: !1,
  }

  static options = {
    addGlobalClass: true,
  }

  gotoArticle = (e) => {
    utils.navigate({
      url: '/pages/article/index?id=' + e
    })
  }

  render() {
    const { articles, loading } = this.props

    return (
      <Block>
        {articles.length > 0 && <View className='article-list'>
            {articles.map((item, index) => {
              return <View className='article-item' key={index} onClick={this.gotoArticle.bind(this, item.id)}>
                <View className='item-content'>
                  <View className='item-content-title'>{item.title}</View>
                  {item.description && <View className='item-content-desc'>{item.description}</View>}
                </View>
                {item.logo && <View className='item-thumb'>
                  <Image mode='aspectFill' className='item-thumb-info' src={item.logo}/>
                </View>}
              </View>
            })}
          </View>}
          {loading && <AtLoadMore status='loading' />}
          {(!articles.length && !loading) && <Empty title='该分类下没有文章' />}
      </Block>
    )
  }
}
