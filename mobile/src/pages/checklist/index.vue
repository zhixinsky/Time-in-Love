<template>
  <view class="safe-page checklist-page app-nav-page">
    <image class="page-bg" :src="cloudLoveBg" mode="widthFix" />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <view class="app-nav">
          <view class="app-nav__main">
            <view class="app-nav__back tap-scale" @tap="goHome">‹</view>
            <view class="app-nav__copy">
              <text class="app-nav__title">恋爱清单</text>
              <text class="app-nav__subtitle">一起完成那些想做的小事</text>
            </view>
          </view>
        </view>

        <view class="card progress-card">
          <view class="progress-top">
            <view>
              <text class="progress-num">{{ checklist.summary.rate }}%</text>
              <text class="progress-sub">已完成 {{ checklist.summary.completed }}/{{ checklist.summary.total }}</text>
            </view>
            <button class="add-btn tap-scale" @tap="openEditor">添加</button>
          </view>
          <view class="progress-track">
            <view class="progress-fill" :style="{ width: `${checklist.summary.rate}%` }"></view>
          </view>
        </view>

        <view v-if="checklist.loading" class="empty card">正在加载清单...</view>
        <view v-else class="list">
          <view v-for="item in checklist.list" :key="item.id" :class="['card item-card', { done: item.completed }]">
            <view class="check" @tap="checklist.toggle(item)">
              <text v-if="item.completed">✓</text>
            </view>
            <view class="item-main" @tap="checklist.toggle(item)">
              <view class="title-row">
                <text class="item-title">{{ item.title }}</text>
                <text v-if="item.official" class="official">官方</text>
              </view>
              <text class="item-sub">{{ item.category }}{{ item.completedAt ? ` · ${formatDone(item.completedAt)}` : '' }}</text>
            </view>
            <text v-if="!item.official" class="remove" @tap="removeItem(item)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="editorVisible" class="editor-mask" @tap="closeEditor">
      <view class="editor card" @tap.stop>
        <text class="editor-title">添加清单</text>
        <input v-model="form.title" class="input" placeholder="想一起完成什么？" />
        <picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
          <view class="input picker-row">{{ form.category }}</view>
        </picker>
        <view class="editor-actions">
          <button class="ghost-btn tap-scale" @tap="closeEditor">取消</button>
          <button class="save-btn tap-scale" @tap="saveItem">保存</button>
        </view>
      </view>
    </view>

    <LoveTabBar active="home" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useChecklistStore } from '../../stores/checklist'
import { CLOUD_LOVE_BG } from '../../config'
import { formatDate } from '../../utils/date'

const checklist = useChecklistStore()
const cloudLoveBg = CLOUD_LOVE_BG
const sheetVisible = ref(false)
const editorVisible = ref(false)
const categories = ['日常', '浪漫', '旅行', '约会', '记录', '甜蜜']
const categoryIndex = ref(0)
const form = reactive({
  title: '',
  category: categories[0]
})

onShow(() => {
  checklist.fetchList()
})

function openEditor() {
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
}

function onCategoryChange(e) {
  categoryIndex.value = Number(e.detail.value)
  form.category = categories[categoryIndex.value]
}

async function saveItem() {
  const title = form.title.trim()
  if (!title) {
    uni.showToast({ title: '请输入清单内容', icon: 'none' })
    return
  }
  await checklist.create({ title, category: form.category })
  form.title = ''
  closeEditor()
  uni.showToast({ title: '已添加', icon: 'success' })
}

function removeItem(item) {
  uni.showModal({
    title: '删除清单',
    content: `确定删除「${item.title}」吗？`,
    success: async (res) => {
      if (!res.confirm) return
      await checklist.remove(item.id)
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  })
}

function formatDone(value) {
  return `${formatDate(value)}完成`
}

function goHome() {
  uni.redirectTo({ url: '/pages/home/index' })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.checklist-page {
  background: #fff4fa;
}

.page-bg {
  position: absolute;
  top: -200rpx;
  left: 0;
  z-index: 0;
  width: 100%;
}

.progress-card {
  padding: 34rpx;
}

.progress-top {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.progress-num {
  display: block;
  color: $text-main;
  font-size: 56rpx;
  font-weight: 900;
}

.progress-sub,
.item-sub {
  display: block;
  color: $text-soft;
  font-size: 24rpx;
}

.add-btn,
.save-btn {
  min-width: 128rpx;
  height: 64rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 26rpx;
  font-weight: 800;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
  box-shadow: 0 14rpx 26rpx rgba(255, 143, 183, 0.22);
}

.progress-track {
  position: relative;
  z-index: 1;
  height: 18rpx;
  margin-top: 26rpx;
  border-radius: 999rpx;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.64);
}

.progress-fill {
  height: 100%;
  border-radius: 999rpx;
  background: linear-gradient(90deg, #ff8fb7, #c9a7ff);
  transition: width 0.28s ease;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.item-card {
  display: grid;
  grid-template-columns: 58rpx 1fr auto;
  gap: 18rpx;
  align-items: center;
  padding: 28rpx;
}

.check {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52rpx;
  height: 52rpx;
  border: 3rpx solid rgba(255, 143, 183, 0.55);
  border-radius: 50%;
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}

.item-card.done .check {
  border-color: transparent;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
}

.item-card.done .item-title {
  color: rgba(74, 61, 82, 0.46);
  text-decoration: line-through;
}

.item-main,
.remove {
  position: relative;
  z-index: 1;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.item-title,
.editor-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.official {
  padding: 6rpx 12rpx;
  border-radius: 999rpx;
  color: #fff;
  font-size: 20rpx;
  font-weight: 800;
  background: #ff8fb7;
}

.remove {
  color: #ef6f9d;
  font-size: 24rpx;
  font-weight: 700;
}

.empty {
  padding: 46rpx;
  color: $text-soft;
  text-align: center;
}

.editor-mask {
  position: fixed;
  z-index: 10000;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 24rpx;
  background: rgba(84, 60, 86, 0.22);
}

.editor {
  width: 100%;
  padding: 34rpx;
  margin-bottom: 28rpx;
}

.input {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 82rpx;
  padding: 0 24rpx;
  margin-top: 22rpx;
  border-radius: 24rpx;
  color: $text-main;
  font-size: 28rpx;
  background: rgba(255, 255, 255, 0.72);
}

.picker-row {
  display: flex;
  align-items: center;
}

.editor-actions {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 16rpx;
  margin-top: 28rpx;
}

.ghost-btn {
  flex: 1;
  height: 68rpx;
  border-radius: 999rpx;
  color: $text-soft;
  font-size: 26rpx;
  background: rgba(255, 255, 255, 0.58);
}

.save-btn {
  flex: 1;
}
</style>
