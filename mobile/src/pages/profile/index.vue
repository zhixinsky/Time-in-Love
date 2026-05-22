<template>
  <view class="safe-page profile-page app-nav-page">
    <view class="page-inner simple">
      <view class="app-nav">
        <view class="app-nav__main">
          <view class="app-nav__copy">
            <text class="app-nav__title">我的</text>
            <text class="app-nav__subtitle">管理你们的恋爱空间</text>
          </view>
        </view>
      </view>
      <view class="card profile-card">
        <image class="avatar-img" :src="displayPhoto" mode="aspectFill" />
        <view>
          <text class="soft-title">{{ love.space.name }}</text>
          <text class="soft-subtitle">当前空间 · 已在一起 {{ love.loveDays }} 天</text>
        </view>
      </view>
      <view class="card list">
        <text class="row" @tap="editSpaceName">空间名称 <text>{{ love.space.name }} ›</text></text>
        <picker mode="date" :value="love.loveStartDate" @change="changeStartDate">
          <text class="row">恋爱起始日 <text>{{ love.loveStartDate }} ›</text></text>
        </picker>
        <text class="row" @tap="uploadCouplePhoto">情侣合照 <text>上传 ›</text></text>
        <text class="row" @tap="invitePartner">邀请另一半 <text>生成邀请码 ›</text></text>
        <text class="row" @tap="joinPartnerSpace">加入对方空间 <text>输入邀请码 ›</text></text>
        <text class="row" @tap="resetSpace">新建我的空间 <text>重建 ›</text></text>
        <text class="row">消息提醒 <text>即将开放</text></text>
        <text class="row">隐私设置 <text>即将开放</text></text>
        <text class="row">关于我们 <text>星芽恋记</text></text>
      </view>
    </view>
    <LoveTabBar active="profile" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useLoveStore } from '../../stores/love'
import { CLOUD_LOGO } from '../../config'
import { resolveMediaUrl, uploadFile } from '../../services/request'

const love = useLoveStore()
const cloudLogo = CLOUD_LOGO
const sheetVisible = ref(false)
const displayPhoto = computed(() => resolveMediaUrl(love.space.couplePhoto) || cloudLogo)

love.loadDashboard()

function editSpaceName() {
  uni.showModal({
    title: '空间名称',
    editable: true,
    placeholderText: '输入你们的空间名称',
    success: async (res) => {
      const name = res.content?.trim()
      if (!res.confirm || !name) return
      await love.saveSpace({ name })
      uni.showToast({ title: '已保存', icon: 'success' })
    }
  })
}

async function changeStartDate(e) {
  await love.saveSpace({ loveStartDate: e.detail.value })
  uni.showToast({ title: '已更新', icon: 'success' })
}

function uploadCouplePhoto() {
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    success: async (res) => {
      try {
        uni.showLoading({ title: '上传中' })
        const data = await uploadFile('/upload/image', res.tempFilePaths[0])
        await love.saveSpace({ couplePhoto: data.url })
        uni.showToast({ title: '已更新', icon: 'success' })
      } catch {
        uni.showToast({ title: '上传失败', icon: 'none' })
      } finally {
        uni.hideLoading()
      }
    }
  })
}

async function invitePartner() {
  try {
    const data = await love.invitePartner()
    const code = data.inviteCode
    uni.setClipboardData({ data: code })
    uni.showModal({
      title: '邀请码已复制',
      content: `让另一半在「加入对方空间」输入：${code}`,
      showCancel: false
    })
  } catch (e) {
    uni.showToast({ title: e.message || '生成失败', icon: 'none' })
  }
}

function joinPartnerSpace() {
  uni.showModal({
    title: '加入对方空间',
    editable: true,
    placeholderText: '输入邀请码',
    success: async (res) => {
      const inviteCode = res.content?.trim()
      if (!res.confirm || !inviteCode) return
      try {
        await love.joinByInvite(inviteCode)
        uni.showToast({ title: '加入成功', icon: 'success' })
      } catch (e) {
        uni.showToast({ title: e.message || '加入失败', icon: 'none' })
      }
    }
  })
}

function resetSpace() {
  uni.showModal({
    title: '新建空间',
    content: '会切换到一个新的情侣空间，原空间数据不会删除。',
    success: async (res) => {
      if (!res.confirm) return
      await love.resetSpace()
      uni.showToast({ title: '已创建', icon: 'success' })
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.profile-card {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 34rpx;
}

.avatar-img {
  width: 96rpx;
  height: 96rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.6);
}

.list {
  padding: 14rpx 28rpx;
  margin-top: 24rpx;
}

.row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 86rpx;
  color: $text-main;
  font-size: 27rpx;
  border-bottom: 1rpx solid rgba(157, 123, 148, 0.12);
}
</style>
