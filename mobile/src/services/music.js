import request from './request'
import { cloudAsset, CLOUD_LOVE_BG } from '../config'

export const DEFAULT_LOVE_MUSIC = {
  id: 'default',
  title: '恋爱时光',
  singer: 'AI星芽',
  epname: '星芽恋记情侣空间',
  src: cloudAsset('music/love-bgm.mp3'),
  coverImgUrl: CLOUD_LOVE_BG
}

export const musicApi = {
  loopList: () => request('/love-space/background-music/loop')
}

export default musicApi
