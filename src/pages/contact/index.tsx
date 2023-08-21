import React, { Component } from 'react'
import Taro from '@tarojs/taro'
import { View, Image, Text } from '@tarojs/components'
import { AtLoadMore } from 'taro-ui'
import Container from '../../components/container'
import RichHtml from '../../components/richhtml'
import Banner from '../../components/banner'
import Cell from '../../components/cell'
import appConfig from '../../config'
import Utils from '../../utils'
import Api from '../../api'
import './index.scss'

export default class AboutPage extends Component {

  state = {
    swiper: [],
    setting: {
      mobile: appConfig.mobile,
      company: appConfig.company,
      address: appConfig.address,
      wechat: appConfig.wechat,
    },
    fetched: !1,
    page: {}
  }

  componentDidMount () {
    let { setting } = this.state
    Api.page({
      page: 'contact',
      pageId: appConfig.contactId,
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
      if(Taro.ENV_TYPE.SWAN === Taro.getEnv()){
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

    Api.setting().then(res => {
      this.setState({
        setting: Object.assign(setting, res.data.setting)
      })
    }).catch(err => {
      Taro.showToast({
        icon: 'none',
        title: err.msg || err.message
      })
    })
  }

  phoneCall = () => {
    Taro.makePhoneCall({
      phoneNumber: this.state.setting.mobile
    })
  }

  copyWechat = () => {
    Taro.setClipboardData({
      data: this.state.setting.wechat
    }).then(res => {
      Taro.showToast({
        icon: 'none',
        title: '微信已复制'
      })
    })
  }

  render () {
    const { page, fetched, setting, swiper } = this.state
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
        <View className='panel'>
          <View className='panel-title'><Text className='title-text'>联系我们</Text></View>
          <View className='panel-content no-padding'>
            {setting.company && <Cell title='公司' value={setting.company} />}
            {setting.address && <Cell title='地址' value={setting.address} />}
            {setting.mobile && <Cell title='电话' value={setting.mobile} onClick={this.phoneCall}/>}
          </View>
        </View>
      </Container>
    )
  }
}
