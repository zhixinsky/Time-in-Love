<template>
  <view class="safe-page anniversary-page app-nav-page">
    <PageLiquidBg />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <PageNavBar
          title="纪念日"
          subtitle="把每个心动日期都好好收藏"
        />

        <view class="card add-card">
          <view>
            <text class="card-title">新的纪念日</text>
            <text class="card-sub">第一次见面、牵手、旅行，都可以记下来</text>
          </view>
          <button class="add-btn tap-scale" @tap="openCreate">添加</button>
        </view>

        <view v-if="anniversary.loading" class="empty card">
          <text>正在加载纪念日...</text>
        </view>

        <view v-else-if="!anniversary.upcoming.length" class="empty card">
          <text class="empty-title">还没有纪念日</text>
          <text class="empty-sub">先添加一个属于你们的日子吧</text>
        </view>

        <view v-else class="list">
          <view v-for="item in anniversary.upcoming" :key="item.id" class="card item-card">
            <view class="date-pill">
              <text class="month">{{ formatMonth(item.date) }}</text>
              <text class="day">{{ formatDay(item.date) }}</text>
            </view>
            <view class="item-main">
              <text class="item-title">{{ item.title }}</text>
              <text class="item-date">{{ formatFullDate(item.date) }} · {{ repeatLabel(item.repeatType) }}</text>
            </view>
            <view class="remain">
              <text class="remain-num">{{ item.remainDays }}</text>
              <text class="remain-label">天</text>
            </view>
            <view class="actions">
              <text class="action" @tap="openEdit(item)">编辑</text>
              <text class="action danger" @tap="removeItem(item)">删除</text>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="editorVisible" class="editor-mask" @tap="closeEditor">
      <view class="editor card" @tap.stop>
        <text class="editor-title">{{ editingId ? '编辑纪念日' : '添加纪念日' }}</text>
        <input v-model="form.title" class="input" placeholder="纪念日名称" />
        <picker mode="date" :value="form.date" @change="form.date = $event.detail.value">
          <view class="input picker-row">{{ form.date || '选择日期' }}</view>
        </picker>
        <view class="segmented">
          <view
            v-for="option in repeatOptions"
            :key="option.value"
            :class="['segment', { active: form.repeatType === option.value }]"
            @tap="form.repeatType = option.value"
          >
            {{ option.label }}
          </view>
        </view>
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
import { onLoad } from '@dcloudio/uni-app'
import PageLiquidBg from '../../components/PageLiquidBg.vue'
import PageNavBar from '../../components/PageNavBar.vue'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useAnniversaryStore } from '../../stores/anniversary'
import { useLoveStore } from '../../stores/love'
import { formatDate } from '../../utils/date'

const anniversary = useAnniversaryStore()
const love = useLoveStore()
const sheetVisible = ref(false)
const editorVisible = ref(false)
const editingId = ref('')
const repeatOptions = [
  { label: '每年', value: 'yearly' },
  { label: '一次', value: 'once' }
]

const form = reactive({
  title: '',
  date: '',
  repeatType: 'yearly'
})

onLoad(() => {
  anniversary.fetchList()
})

function today() {
  return new Date().toISOString().slice(0, 10)
}

function resetForm(item = null) {
  editingId.value = item?.id || ''
  form.title = item?.title || ''
  form.date = item?.date || today()
  form.repeatType = item?.repeatType || 'yearly'
}

function openCreate() {
  resetForm()
  editorVisible.value = true
}

function openEdit(item) {
  resetForm(item)
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
}

async function saveItem() {
  const title = form.title.trim()
  if (!title) {
    uni.showToast({ title: '请输入名称', icon: 'none' })
    return
  }
  const payload = { title, date: form.date, repeatType: form.repeatType }
  if (editingId.value) await anniversary.update(editingId.value, payload)
  else await anniversary.create(payload)
  await love.loadDashboard()
  closeEditor()
  uni.showToast({ title: '已保存', icon: 'success' })
}

function removeItem(item) {
  uni.showModal({
    title: '删除纪念日',
    content: `确定删除「${item.title}」吗？`,
    success: async (res) => {
      if (!res.confirm) return
      await anniversary.remove(item.id)
      await love.loadDashboard()
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  })
}

function formatMonth(date) {
  return formatDate(date).slice(5, 7)
}

function formatDay(date) {
  return formatDate(date).slice(8, 10)
}

function formatFullDate(date) {
  return formatDate(date)
}

function repeatLabel(type) {
  return type === 'once' ? '一次' : '每年'
}

</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.add-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
}

.card-title,
.item-title,
.editor-title {
  position: relative;
  z-index: 1;
  display: block;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
}

.card-sub,
.item-date,
.empty-sub {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 8rpx;
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

.list {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.item-card {
  display: grid;
  grid-template-columns: 96rpx 1fr auto;
  gap: 20rpx;
  align-items: center;
  padding: 28rpx;
}

.date-pill {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 96rpx;
  height: 116rpx;
  border-radius: 28rpx;
  background: linear-gradient(180deg, #fff6fb, #f3e8ff);
  box-shadow: inset 0 2rpx 0 rgba(255, 255, 255, 0.9);
}

.month {
  color: $text-soft;
  font-size: 22rpx;
}

.day {
  color: $text-main;
  font-size: 40rpx;
  font-weight: 900;
}

.item-main {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.remain {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: baseline;
  color: $pink-deep;
}

.remain-num {
  font-size: 44rpx;
  font-weight: 900;
}

.remain-label {
  font-size: 22rpx;
}

.actions {
  position: relative;
  z-index: 1;
  grid-column: 2 / 4;
  display: flex;
  gap: 24rpx;
}

.action {
  color: #9b77c9;
  font-size: 24rpx;
  font-weight: 700;
}

.danger {
  color: #ef6f9d;
}

.empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50rpx;
  color: $text-soft;
}

.empty-title {
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
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

.segmented {
  position: relative;
  z-index: 1;
  display: flex;
  gap: 12rpx;
  margin-top: 22rpx;
}

.segment {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 68rpx;
  border-radius: 999rpx;
  color: $text-soft;
  font-size: 26rpx;
  background: rgba(255, 255, 255, 0.55);
}

.segment.active {
  color: #fff;
  font-weight: 800;
  background: linear-gradient(135deg, #ff8fb7, #c9a7ff);
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
