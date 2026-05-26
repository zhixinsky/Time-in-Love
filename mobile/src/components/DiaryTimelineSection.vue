<template>
  <view :class="['timeline-section', `timeline-section--${layout}`]">
    <view class="timeline-head">
      <text class="panel-title">{{ title }}</text>
      <view v-if="showAll" class="timeline-filter tap-scale" @tap="$emit('all')">
        <text>{{ allText }}</text>
        <text class="filter-chevron">›</text>
      </view>
    </view>

    <view class="timeline-body">
      <scroll-view
        v-if="layout === 'panel'"
        class="timeline-scroll"
        scroll-y
        enhanced
        :show-scrollbar="false"
      >
        <view v-if="loading" class="timeline-empty">
          <text>加载中…</text>
        </view>
        <view v-else-if="!items.length" class="timeline-empty">
          <text>{{ emptyText }}</text>
        </view>
        <view v-else class="timeline-list">
          <view
            v-for="item in items"
            :key="item.id"
            class="timeline-item"
          >
            <view class="timeline-rail">
              <view class="timeline-date">
                <text class="date-main">{{ item.date }}</text>
                <text class="date-week">{{ item.week }}</text>
              </view>
              <view class="timeline-line" />
            </view>

            <view
              :class="['memory-card', `memory-card--${item.type}`]"
              @tap="$emit('item-tap', item)"
            >
              <view class="memory-top">
                <view class="memory-title-wrap">
                  <text class="memory-title">{{ item.title }}</text>
                  <text class="memory-tag">{{ item.tag }}</text>
                </view>
                <view
                  v-if="canShowCardActions(item)"
                  class="memory-more-btn tap-scale"
                  @tap.stop="$emit('card-action', item)"
                >
                  <text class="memory-more">•••</text>
                </view>
              </view>

              <text class="memory-copy">{{ item.copy }}</text>

              <view v-if="item.media.length" class="memory-media">
                <view
                  :class="['memory-media-host', { 'memory-media-host--scroll': item.media.length > 3 }]"
                >
                  <scroll-view
                    v-if="item.media.length > 3"
                    class="memory-images-scroll"
                    scroll-x
                    enhanced
                    :show-scrollbar="false"
                  >
                    <view class="memory-images-inner">
                      <view
                        v-for="(media, mediaIndex) in item.media"
                        :key="`${item.id}-m-${mediaIndex}`"
                        class="memory-image memory-image--scroll tap-scale"
                        @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                      >
                        <video
                          v-if="media.type === 'video'"
                          class="memory-video-cover"
                          :src="media.url"
                          :poster="mediaDisplaySrc(media)"
                          :controls="true"
                          :show-play-btn="false"
                          :show-center-play-btn="false"
                          :show-progress="false"
                          :show-bottom-progress="false"
                          :show-fullscreen-btn="false"
                          :enable-progress-gesture="false"
                          :enable-play-gesture="false"
                          :muted="true"
                          object-fit="cover"
                          @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                        />
                        <image
                          v-else-if="mediaDisplaySrc(media)"
                          class="memory-image-photo"
                          :src="mediaDisplaySrc(media)"
                          mode="aspectFill"
                        />
                        <view v-else class="memory-video-ph" />
                        <view v-if="media.type === 'video'" class="video-badge">
                          <text>▶</text>
                        </view>
                        <text
                          v-if="media.type === 'video' && media.duration"
                          class="video-time"
                        >
                          {{ formatVideoDuration(media.duration) }}
                        </text>
                      </view>
                    </view>
                  </scroll-view>

                  <view v-else class="memory-images">
                    <view
                      v-for="(media, mediaIndex) in item.media"
                      :key="`${item.id}-m-${mediaIndex}`"
                      class="memory-image tap-scale"
                      @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                    >
                      <video
                        v-if="media.type === 'video'"
                        class="memory-video-cover"
                        :src="media.url"
                        :poster="mediaDisplaySrc(media)"
                        :controls="true"
                        :show-play-btn="false"
                        :show-center-play-btn="false"
                        :show-progress="false"
                        :show-bottom-progress="false"
                        :show-fullscreen-btn="false"
                        :enable-progress-gesture="false"
                        :enable-play-gesture="false"
                        :muted="true"
                        object-fit="cover"
                        @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                      />
                      <image
                        v-else-if="mediaDisplaySrc(media)"
                        class="memory-image-photo"
                        :src="mediaDisplaySrc(media)"
                        mode="aspectFill"
                      />
                      <view v-else class="memory-video-ph" />
                      <view v-if="media.type === 'video'" class="video-badge">
                        <text>▶</text>
                      </view>
                      <text
                        v-if="media.type === 'video' && media.duration"
                        class="video-time"
                      >
                        {{ formatVideoDuration(media.duration) }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>

              <view v-if="item.mood" class="memory-footer">
                <view class="memory-mood">
                  <text>{{ item.moodIcon }}</text>
                  <text>{{ item.mood }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </scroll-view>

      <view v-else class="timeline-scroll timeline-scroll--plain">
        <view v-if="loading" class="timeline-empty">
          <text>加载中…</text>
        </view>
        <view v-else-if="!items.length" class="timeline-empty">
          <text>{{ emptyText }}</text>
        </view>
        <view v-else class="timeline-list">
          <view
            v-for="item in items"
            :key="item.id"
            class="timeline-item"
          >
            <view class="timeline-rail">
              <view class="timeline-date">
                <text class="date-main">{{ item.date }}</text>
                <text class="date-week">{{ item.week }}</text>
              </view>
              <view class="timeline-line" />
            </view>

            <view
              :class="['memory-card', `memory-card--${item.type}`]"
              @tap="$emit('item-tap', item)"
            >
              <view class="memory-top">
                <view class="memory-title-wrap">
                  <text class="memory-title">{{ item.title }}</text>
                  <text class="memory-tag">{{ item.tag }}</text>
                </view>
                <view
                  v-if="canShowCardActions(item)"
                  class="memory-more-btn tap-scale"
                  @tap.stop="$emit('card-action', item)"
                >
                  <text class="memory-more">•••</text>
                </view>
              </view>

              <text class="memory-copy">{{ item.copy }}</text>

              <view v-if="item.media.length" class="memory-media">
                <view
                  :class="['memory-media-host', { 'memory-media-host--scroll': item.media.length > 3 }]"
                >
                  <scroll-view
                    v-if="item.media.length > 3"
                    class="memory-images-scroll"
                    scroll-x
                    enhanced
                    :show-scrollbar="false"
                  >
                    <view class="memory-images-inner">
                      <view
                        v-for="(media, mediaIndex) in item.media"
                        :key="`${item.id}-m-${mediaIndex}`"
                        class="memory-image memory-image--scroll tap-scale"
                        @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                      >
                        <video
                          v-if="media.type === 'video'"
                          class="memory-video-cover"
                          :src="media.url"
                          :poster="mediaDisplaySrc(media)"
                          :controls="true"
                          :show-play-btn="false"
                          :show-center-play-btn="false"
                          :show-progress="false"
                          :show-bottom-progress="false"
                          :show-fullscreen-btn="false"
                          :enable-progress-gesture="false"
                          :enable-play-gesture="false"
                          :muted="true"
                          object-fit="cover"
                          @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                        />
                        <image
                          v-else-if="mediaDisplaySrc(media)"
                          class="memory-image-photo"
                          :src="mediaDisplaySrc(media)"
                          mode="aspectFill"
                        />
                        <view v-else class="memory-video-ph" />
                        <view v-if="media.type === 'video'" class="video-badge">
                          <text>▶</text>
                        </view>
                        <text
                          v-if="media.type === 'video' && media.duration"
                          class="video-time"
                        >
                          {{ formatVideoDuration(media.duration) }}
                        </text>
                      </view>
                    </view>
                  </scroll-view>

                  <view v-else class="memory-images">
                    <view
                      v-for="(media, mediaIndex) in item.media"
                      :key="`${item.id}-m-${mediaIndex}`"
                      class="memory-image tap-scale"
                      @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                    >
                      <video
                        v-if="media.type === 'video'"
                        class="memory-video-cover"
                        :src="media.url"
                        :poster="mediaDisplaySrc(media)"
                        :controls="true"
                        :show-play-btn="false"
                        :show-center-play-btn="false"
                        :show-progress="false"
                        :show-bottom-progress="false"
                        :show-fullscreen-btn="false"
                        :enable-progress-gesture="false"
                        :enable-play-gesture="false"
                        :muted="true"
                        object-fit="cover"
                        @tap.stop="$emit('media-tap', { item, index: mediaIndex })"
                      />
                      <image
                        v-else-if="mediaDisplaySrc(media)"
                        class="memory-image-photo"
                        :src="mediaDisplaySrc(media)"
                        mode="aspectFill"
                      />
                      <view v-else class="memory-video-ph" />
                      <view v-if="media.type === 'video'" class="video-badge">
                        <text>▶</text>
                      </view>
                      <text
                        v-if="media.type === 'video' && media.duration"
                        class="video-time"
                      >
                        {{ formatVideoDuration(media.duration) }}
                      </text>
                    </view>
                  </view>
                </view>
              </view>

              <view v-if="item.mood" class="memory-footer">
                <view class="memory-mood">
                  <text>{{ item.moodIcon }}</text>
                  <text>{{ item.mood }}</text>
                </view>
              </view>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { formatVideoDuration } from '../utils/diary-date'

const props = defineProps({
  title: { type: String, default: '恋爱时间线' },
  items: { type: Array, default: () => [] },
  loading: { type: Boolean, default: false },
  emptyText: { type: String, default: '还没有记录，去写下第一个心动瞬间吧～' },
  showAll: { type: Boolean, default: false },
  allText: { type: String, default: '全部' },
  /** panel：首页左侧时间线面板；full：日记页全宽展示 */
  layout: { type: String, default: 'panel' },
  showCardActions: { type: Boolean, default: false }
})

defineEmits(['all', 'item-tap', 'media-tap', 'card-action'])

function canShowCardActions(item) {
  return props.showCardActions && !!item?.id && item.type !== 'date'
}

function mediaDisplaySrc(media) {
  if (!media) return ''
  if (media.type === 'video') return media.poster || ''
  return media.poster || media.url || ''
}
</script>

<style lang="scss" scoped>
@use '../styles/theme.scss' as *;

.timeline-section {
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.timeline-section--panel {
  flex: 1;
  min-height: 0;
  height: 100%;
}

.timeline-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.timeline-section--panel .timeline-head {
  flex-shrink: 0;
  padding: 28rpx 18rpx 0;
  box-sizing: border-box;
}

.timeline-section--full .timeline-head {
  margin-bottom: 18rpx;
  padding: 0 6rpx;
}

.panel-title {
  line-height: 1.25;
}

.timeline-section--panel .panel-title {
  font-size: 29rpx;
  font-weight: 620;
  color: rgba(31, 20, 39, 0.86);
}

.timeline-section--full .panel-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #4a3d52;
}

.timeline-filter {
  display: flex;
  align-items: center;
  gap: 4rpx;
  padding: 8rpx 12rpx;
  font-size: 22rpx;
  color: rgba(95, 77, 105, 0.72);
}

.filter-chevron {
  font-size: 24rpx;
  line-height: 1;
}

.timeline-body {
  width: 100%;
  min-width: 0;
}

.timeline-section--panel .timeline-body {
  flex: 1;
  min-height: 0;
  height: 0;
  display: flex;
  flex-direction: column;
}

.timeline-scroll {
  width: 100%;
  box-sizing: border-box;
}

.timeline-section--panel .timeline-scroll {
  flex: 1;
  height: 0;
  min-height: 0;
  padding: 0 18rpx 24rpx;
}

.timeline-section--full .timeline-scroll {
  padding: 0;
}

.timeline-section--full .timeline-scroll--plain {
  padding: 0 4rpx;
}

.timeline-list {
  width: 100%;
}

.timeline-section--panel .timeline-list {
  margin-top: 28rpx;
}

.timeline-item {
  display: flex;
  flex-direction: row;
  align-items: stretch;
}

.timeline-section--panel .timeline-item {
  gap: 10rpx;
  margin-bottom: 12rpx;
}

.timeline-section--full .timeline-item {
  gap: 14rpx;
  margin-bottom: 22rpx;
}

.timeline-rail {
  position: relative;
  flex-shrink: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.timeline-section--panel .timeline-rail {
  width: 58rpx;
  --timeline-line-top: 66rpx;
}

.timeline-section--full .timeline-rail {
  width: 64rpx;
  --timeline-line-top: 72rpx;
}

.timeline-date {
  z-index: 3;
  margin-bottom: 10rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(63, 48, 72, 0.74);
  padding-bottom: 4rpx;
}

.date-main {
  font-weight: 620;
}

.date-week {
  margin-top: 5rpx;
  font-weight: 480;
}

.timeline-section--panel .date-main {
  font-size: 21rpx;
}

.timeline-section--panel .date-week {
  font-size: 17rpx;
}

.timeline-section--full .date-main {
  font-size: 23rpx;
}

.timeline-section--full .date-week {
  font-size: 18rpx;
}

.timeline-line {
  position: absolute;
  left: 50%;
  top: var(--timeline-line-top);
  bottom: 0;
  transform: translateX(-50%);
  width: 2rpx;
  background: linear-gradient(
    180deg,
    rgba(255, 128, 186, 0.42) 0%,
    rgba(177, 132, 255, 0.28) 100%
  );
  border-radius: 2rpx;
}

.memory-card {
  flex: 1;
  min-width: 0;
  @include moona-memory-card;
  margin-bottom: 0;
  /* 时间线列表滚动中避免多张卡片同时做 backdrop-filter 采样 */
  background:
    linear-gradient(145deg, rgba(255, 255, 255, 0.88), rgba(255, 247, 252, 0.78)),
    rgba(255, 255, 255, 0.72);
  box-shadow: 0 8rpx 24rpx rgba(130, 88, 145, 0.05), inset 0 1rpx 0 rgba(255, 255, 255, 0.68);
  backdrop-filter: none;
  -webkit-backdrop-filter: none;
}

.timeline-section--panel .memory-card {
  padding: 22rpx 20rpx;
}

.timeline-section--full .memory-card {
  padding: 26rpx 24rpx;
  border-radius: 30rpx;
}

.memory-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12rpx;
}

.memory-title-wrap {
  display: flex;
  align-items: center;
  gap: 10rpx;
  min-width: 0;
}

.memory-title {
  line-height: 1.25;
  font-weight: 620;
  color: rgba(34, 23, 42, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.timeline-section--panel .memory-title {
  max-width: 220rpx;
  font-size: 26rpx;
}

.timeline-section--full .memory-title {
  max-width: 470rpx;
  font-size: 28rpx;
}

.memory-tag {
  flex-shrink: 0;
  border-radius: 999rpx;
  font-weight: 580;
  color: #f05b99;
  background: rgba(255, 213, 231, 0.72);
  white-space: nowrap;
}

.timeline-section--panel .memory-tag {
  padding: 5rpx 14rpx;
  font-size: 20rpx;
}

.timeline-section--full .memory-tag {
  padding: 6rpx 16rpx;
  font-size: 21rpx;
}

.memory-more {
  color: #9d8aa4;
  font-size: 24rpx;
  letter-spacing: 4rpx;
}

.memory-more-btn {
  flex-shrink: 0;
  min-width: 44rpx;
  min-height: 44rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.memory-copy {
  margin-top: 16rpx;
  line-height: 1.55;
  font-weight: 430;
  color: rgba(67, 51, 75, 0.66);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.timeline-section--panel .memory-copy {
  font-size: 23rpx;
  -webkit-line-clamp: 4;
}

.timeline-section--full .memory-copy {
  font-size: 24rpx;
  line-height: 1.62;
  -webkit-line-clamp: 5;
}

.memory-media {
  margin-top: 14rpx;
}

.memory-images-inner {
  display: inline-flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  gap: 8rpx;
  padding-right: 8rpx;
  box-sizing: border-box;
}

.memory-images {
  display: flex;
  flex-direction: row;
  gap: 8rpx;
}

.memory-video-ph {
  width: 100%;
  height: 100%;
  background: linear-gradient(145deg, #f5dce8, #e8dcf5);
}

.memory-image {
  position: relative;
  flex: 1;
  min-width: 0;
  border-radius: 16rpx;
  overflow: hidden;
}

.memory-image-photo {
  width: 100%;
  height: 100%;
}

.memory-video-cover {
  width: 100%;
  height: 100%;
}

.timeline-section--panel .memory-media-host--scroll {
  width: 100%;
  height: 92rpx;
  overflow: hidden;
}

.timeline-section--panel .memory-images-scroll {
  width: 100%;
  height: 92rpx;
  white-space: nowrap;
}

.timeline-section--panel .memory-images-inner {
  height: 92rpx;
}

.timeline-section--panel .memory-image {
  height: 92rpx;
}

.timeline-section--panel .memory-image--scroll {
  flex: 0 0 132rpx;
  width: 132rpx;
  min-width: 132rpx;
  height: 92rpx;
}

.timeline-section--full .memory-media-host--scroll {
  width: 100%;
  height: 104rpx;
  overflow: hidden;
}

.timeline-section--full .memory-images-scroll {
  width: 100%;
  height: 104rpx;
  white-space: nowrap;
}

.timeline-section--full .memory-images-inner {
  height: 104rpx;
  gap: 10rpx;
  padding-right: 10rpx;
}

.timeline-section--full .memory-images {
  gap: 10rpx;
}

.timeline-section--full .memory-image {
  height: 104rpx;
  border-radius: 18rpx;
}

.timeline-section--full .memory-image--scroll {
  flex: 0 0 146rpx;
  width: 146rpx;
  min-width: 146rpx;
  height: 104rpx;
}

.video-badge {
  position: absolute;
  top: 50%;
  left: 50%;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36rpx;
  height: 36rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 18rpx;
  background: rgba(0, 0, 0, 0.35);
  border: 2rpx solid rgba(255, 255, 255, 0.8);
  transform: translate(-50%, -50%);
}

.video-time {
  position: absolute;
  right: 8rpx;
  bottom: 8rpx;
  z-index: 2;
  padding: 2rpx 8rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 18rpx;
  background: rgba(0, 0, 0, 0.42);
}

.memory-footer {
  margin-top: 14rpx;
}

.memory-mood {
  display: flex;
  align-items: center;
  gap: 8rpx;
  font-weight: 650;
  color: rgba(92, 73, 99, 0.68);
}

.timeline-section--panel .memory-mood {
  font-size: 21rpx;
}

.timeline-section--full .memory-mood {
  font-size: 22rpx;
}

.timeline-empty {
  padding: 32rpx 12rpx 8rpx;
  text-align: center;
  font-size: 24rpx;
  color: rgba(71, 54, 78, 0.55);
  line-height: 1.5;
}

.tap-scale:active {
  transform: scale(0.98);
  opacity: 0.92;
}
</style>
