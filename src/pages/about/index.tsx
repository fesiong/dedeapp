import { Component }from 'nervjs'
import Taro from '@tarojs/taro'
import { View, Text, Image, Block } from '@tarojs/components'
import { AtLoadMore } from 'taro-ui'
import Container from '../../components/container'
import RichHtml from '../../components/richhtml'
import Banner from '../../components/banner'
import appConfig from '../../config'
import Utils from '../../utils'
import Api from '../../api'
import './index.scss'

export default class AboutPage extends Component {

  state = {
    swiper: [],
    fetched: !1,
    page: {}
  }

  componentDidMount() {
    Api.page({
      page: 'about',
      pageId: appConfig.aboutId,
      tags: JSON.stringify({
        swiper: {
          tag: 'posts',
          args: {
            row: 3,
            flag: 'f'
          }
        },
      })
    }).then(res => {
      let page = res.data.page
      page.formatDate = Utils.dateFormat(page.addTime)
      page.dateTime = Utils.dateTimeFormat(page.addTime)
      this.setState({
        swiper: res.data.swiper.data || [],
        fetched: !0,
        page: page
      })
      Taro.setNavigationBarTitle({
        title: page.title
      })
      if (Taro.ENV_TYPE.SWAN === Taro.getEnv()) {
        swan.setPageInfo({
          title: page.seoTitle || page.title,
          keywords: page.keywords || '',
          description: page.description || '',
          articleTitle: page.title,
          release_date: page.dateTime,
          // 单张图时值可以是字符串
          image: page.logo,
          success: function () {
            console.log('页面基础信息设置完成');
          }
        })
      }
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: '获取页面信息失败'
      })
    })
  }

  render() {
    const { page, fetched, swiper } = this.state
    return (
      <Container showFooter>
        <View className='article'>
          {page.logo && <Image className='article-logo' src={page.logo} mode='widthFix' />}
          {!page.logo && <Banner list={swiper}/>}
          <View className='article-content'>
              {fetched ?
                <RichHtml fullscreen={false} bgColor='#ffffff' content={page.content} />
                :
                <AtLoadMore
                  status='loading'
                />
              }
          </View>
        </View>
      </Container>
    )
  }
}

