<template>
  <view class="safe-page album-page app-nav-page">
    <PageLiquidBg />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <PageNavBar
          title="时光相册"
          subtitle="从心动日记里自动整理照片和视频"
        />

        <view class="card stats-card">
          <view>
            <text class="stats-num">{{ album.stats.images }}</text>
            <text class="stats-label">照片</text>
          </view>
          <view>
            <text class="stats-num">{{ album.stats.videos }}</text>
            <text class="stats-label">视频</text>
          </view>
          <view>
            <text class="stats-num">{{ album.total }}</text>
            <text class="stats-label">全部</text>
          </view>
        </view>

        <view v-if="album.loading" class="empty card">正在整理相册...</view>
        <view v-else-if="!album.list.length" class="empty card">
          <text class="empty-title">相册还是空的</text>
          <text class="empty-sub">去日记里上传照片或视频吧</text>
          <button class="add-btn tap-scale" @tap="goDiary">去记录</button>
        </view>
        <view v-else class="masonry">
          <view
            v-for="(item, index) in album.list"
            :key="item.id"
            :class="['media-card', item.type, { tall: index % 5 === 1 || index % 5 === 3 }]"
            @tap="preview(item, index)"
          >
            <image class="media-img" :src="resolveMediaUrl(item.coverUrl || item.url)" mode="aspectFill" lazy-load />
            <view class="media-mask">
              <text class="media-date">{{ item.date }}</text>
              <text v-if="item.type === 'video'" class="video-badge">▶</text>
            </view>
            <view class="media-info">
              <text class="media-title">{{ item.mood || '心动瞬间' }}</text>
              <text class="media-sub">{{ item.locationName || item.contentPreview }}</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
    <LoveTabBar active="home" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import PageLiquidBg from '../../components/PageLiquidBg.vue'
import PageNavBar from '../../components/PageNavBar.vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useAlbumStore } from '../../stores/album'
import { resolveMediaUrl } from '../../services/request'

const album = useAlbumStore()
const sheetVisible = ref(false)

const imageUrls = computed(() =>
  album.list.filter((item) => item.type === 'image').map((item) => resolveMediaUrl(item.url))
)

onShow(() => {
  album.fetchList()
})

function preview(item) {
  const url = resolveMediaUrl(item.url)
  if (item.type === 'video') {
    // #ifdef MP-WEIXIN
    uni.previewMedia({ sources: [{ url, type: 'video' }] })
    // #endif
    // #ifndef MP-WEIXIN
    uni.showToast({ title: '请在微信小程序中播放', icon: 'none' })
    // #endif
    return
  }
  uni.previewImage({
    current: url,
    urls: imageUrls.value
  })
}

function goDiary() {
  uni.redirectTo({ url: '/pages/diary/index' })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.stats-card {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16rpx;
  padding: 34rpx 30rpx;
}

.stats-num,
.stats-label {
  position: relative;
  z-index: 1;
  display: block;
  text-align: center;
}

.stats-num {
  color: $text-main;
  font-size: 42rpx;
  font-weight: 900;
}

.stats-label {
  margin-top: 8rpx;
  color: $text-soft;
  font-size: 24rpx;
}

.masonry {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 22rpx;
}

.media-card {
  position: relative;
  min-height: 260rpx;
  border-radius: 38rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.42);
  border: 1rpx solid rgba(255, 255, 255, 0.6);
  box-shadow: $shadow;
}

.media-card.tall {
  min-height: 360rpx;
}

.media-img {
  width: 100%;
  height: 100%;
  min-height: inherit;
}

.media-mask {
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  z-index: 2;
  display: flex;
  justify-content: space-between;
  padding: 18rpx;
  background: linear-gradient(180deg, rgba(74, 61, 82, 0.34), rgba(74, 61, 82, 0));
}

.media-date,
.video-badge {
  color: #fff;
  font-size: 22rpx;
  font-weight: 800;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.18);
}

.video-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 46rpx;
  height: 46rpx;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.3);
}

.media-info {
  position: absolute;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 2;
  padding: 54rpx 18rpx 18rpx;
  background: linear-gradient(180deg, rgba(74, 61, 82, 0), rgba(74, 61, 82, 0.46));
}

.media-title,
.media-sub {
  display: block;
  color: #fff;
  text-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.16);
}

.media-title {
  font-size: 26rpx;
  font-weight: 900;
}

.media-sub {
  margin-top: 6rpx;
  font-size: 22rpx;
  opacity: 0.86;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 54rpx;
  color: $text-soft;
  text-align: center;
}

.empty-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.empty-sub {
  margin-top: 10rpx;
  color: $text-soft;
  font-size: 24rpx;
}

.add-btn {
  min-width: 142rpx;
  height: 64rpx;
  margin-top: 26rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
  @include jelly-primary-button;
}
</style>
