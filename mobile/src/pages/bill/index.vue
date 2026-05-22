<template>
  <view class="safe-page bill-page app-nav-page">
    <image class="page-bg" :src="cloudLoveBg" mode="widthFix" />
    <scroll-view class="content-scroll" scroll-y enable-flex>
      <view class="page-inner">
        <view class="app-nav">
          <view class="app-nav__main">
            <view class="app-nav__copy">
              <text class="app-nav__title">恋爱小记账</text>
            </view>
          </view>
          <picker mode="date" fields="month" :value="bill.month" @change="changeMonth">
            <view class="month-picker app-nav__action">{{ bill.month }} ▾</view>
          </picker>
        </view>

        <view class="card summary-card">
          <view>
            <text class="summary-label">本月支出</text>
            <text class="summary-num expense">￥{{ money(bill.summary.expense) }}</text>
          </view>
          <view class="summary-split"></view>
          <view>
            <text class="summary-label">本月收入</text>
            <text class="summary-num income">￥{{ money(bill.summary.income) }}</text>
          </view>
        </view>

        <view class="card add-card">
          <view>
            <text class="card-title">记一笔</text>
            <text class="card-sub">礼物、旅行、电影、餐饮都可以记录</text>
          </view>
          <button class="add-btn tap-scale" @tap="openEditor">添加</button>
        </view>

        <view class="section-title">分类统计</view>
        <view class="category-row">
          <view v-for="item in topCategories" :key="`${item.type}-${item.category}`" class="category-card">
            <text class="category-name">{{ item.category }}</text>
            <text :class="['category-money', item.type]">￥{{ money(item.total) }}</text>
          </view>
        </view>

        <view class="section-title">账单明细</view>
        <view v-if="bill.loading" class="empty card">正在加载账单...</view>
        <view v-else-if="!bill.list.length" class="empty card">这个月还没有记录</view>
        <view v-else class="list">
          <view v-for="item in bill.list" :key="item.id" class="card bill-item">
            <view :class="['type-dot', item.type]">{{ item.type === 'income' ? '+' : '-' }}</view>
            <view class="item-main">
              <text class="item-title">{{ item.category }}</text>
              <text class="item-sub">{{ item.billDate }}{{ item.note ? ` · ${item.note}` : '' }}</text>
            </view>
            <text :class="['item-amount', item.type]">{{ item.type === 'income' ? '+' : '-' }}￥{{ money(item.amount) }}</text>
            <text class="remove" @tap="removeItem(item)">删除</text>
          </view>
        </view>
      </view>
    </scroll-view>

    <view v-if="editorVisible" class="editor-mask" @tap="closeEditor">
      <view class="editor card" @tap.stop>
        <text class="editor-title">新增账单</text>
        <view class="segmented">
          <view :class="['segment', { active: form.type === 'expense' }]" @tap="form.type = 'expense'">支出</view>
          <view :class="['segment', { active: form.type === 'income' }]" @tap="form.type = 'income'">收入</view>
        </view>
        <input v-model="form.amount" class="input" type="digit" placeholder="金额" />
        <picker :range="categories" :value="categoryIndex" @change="onCategoryChange">
          <view class="input picker-row">{{ form.category }}</view>
        </picker>
        <picker mode="date" :value="form.billDate" @change="form.billDate = $event.detail.value">
          <view class="input picker-row">{{ form.billDate }}</view>
        </picker>
        <input v-model="form.note" class="input" placeholder="备注，可不填" />
        <view class="editor-actions">
          <button class="ghost-btn tap-scale" @tap="closeEditor">取消</button>
          <button class="save-btn tap-scale" @tap="saveBill">保存</button>
        </view>
      </view>
    </view>

    <LoveTabBar active="bill" @create="sheetVisible = true" />
    <QuickSheet :visible="sheetVisible" @close="sheetVisible = false" />
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import LoveTabBar from '../../components/LoveTabBar.vue'
import QuickSheet from '../../components/QuickSheet.vue'
import { useBillStore } from '../../stores/bill'
import { useLoveStore } from '../../stores/love'
import { CLOUD_LOVE_BG } from '../../config'

const bill = useBillStore()
const love = useLoveStore()
const sheetVisible = ref(false)
const editorVisible = ref(false)
const cloudLoveBg = CLOUD_LOVE_BG
const categories = ['餐饮', '礼物', '旅行', '电影', '住宿', '交通', '生活', '其他']
const categoryIndex = ref(0)
const form = reactive({
  type: 'expense',
  amount: '',
  category: categories[0],
  billDate: new Date().toISOString().slice(0, 10),
  note: ''
})

const topCategories = computed(() => (bill.summary.categories || []).slice(0, 6))

onLoad(() => {
  bill.fetchList()
})

function money(value) {
  return Number(value || 0).toFixed(2)
}

function changeMonth(e) {
  bill.fetchList(e.detail.value)
}

function onCategoryChange(e) {
  categoryIndex.value = Number(e.detail.value)
  form.category = categories[categoryIndex.value]
}

function openEditor() {
  editorVisible.value = true
}

function closeEditor() {
  editorVisible.value = false
}

async function saveBill() {
  if (!Number(form.amount)) {
    uni.showToast({ title: '请输入金额', icon: 'none' })
    return
  }
  await bill.create({
    type: form.type,
    amount: Number(form.amount),
    category: form.category,
    billDate: form.billDate,
    note: form.note.trim()
  })
  await love.loadDashboard()
  form.amount = ''
  form.note = ''
  closeEditor()
  uni.showToast({ title: '已记录', icon: 'success' })
}

function removeItem(item) {
  uni.showModal({
    title: '删除账单',
    content: `确定删除「${item.category}」这笔记录吗？`,
    success: async (res) => {
      if (!res.confirm) return
      await bill.remove(item.id)
      await love.loadDashboard()
      uni.showToast({ title: '已删除', icon: 'success' })
    }
  })
}
</script>

<style lang="scss" scoped>
@use '../../styles/theme.scss' as *;

.bill-page {
  background: #fff4fa;
}

.page-bg {
  position: absolute;
  top: -200rpx;
  left: 0;
  z-index: 0;
  width: 100%;
}

.month-picker {
  padding: 16rpx 24rpx;
  border-radius: 999rpx;
  color: $text-main;
  font-size: 24rpx;
  font-weight: 700;
  background: rgba(255, 255, 255, 0.68);
  box-shadow: $shadow;
}

.summary-card {
  display: grid;
  grid-template-columns: 1fr 1rpx 1fr;
  gap: 28rpx;
  padding: 34rpx;
}

.summary-label,
.card-sub,
.item-sub {
  position: relative;
  z-index: 1;
  display: block;
  color: $text-soft;
  font-size: 24rpx;
}

.summary-num {
  position: relative;
  z-index: 1;
  display: block;
  margin-top: 12rpx;
  font-size: 42rpx;
  font-weight: 900;
}

.expense {
  color: #ef6f9d;
}

.income {
  color: #55b98f;
}

.summary-split {
  width: 1rpx;
  background: rgba(157, 123, 148, 0.14);
}

.add-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 30rpx;
}

.card-title,
.editor-title,
.item-title {
  position: relative;
  z-index: 1;
  display: block;
  color: $text-main;
  font-size: 30rpx;
  font-weight: 800;
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

.section-title {
  margin: 16rpx 4rpx;
  color: $text-main;
  font-size: 28rpx;
  font-weight: 800;
}

.category-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 14rpx;
  margin-bottom: 24rpx;
}

.category-card {
  min-height: 118rpx;
  padding: 22rpx;
  border-radius: 28rpx;
  background: rgba(255, 255, 255, 0.62);
  box-shadow: $shadow;
}

.category-name {
  display: block;
  color: $text-soft;
  font-size: 22rpx;
}

.category-money {
  display: block;
  margin-top: 14rpx;
  font-size: 26rpx;
  font-weight: 900;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.bill-item {
  display: grid;
  grid-template-columns: 64rpx 1fr auto;
  gap: 18rpx;
  align-items: center;
  padding: 26rpx;
}

.type-dot {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 58rpx;
  height: 58rpx;
  border-radius: 50%;
  color: #fff;
  font-size: 28rpx;
  font-weight: 900;
}

.type-dot.expense {
  background: #ff8fb7;
}

.type-dot.income {
  background: #72d5a8;
}

.item-main {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.item-amount {
  position: relative;
  z-index: 1;
  font-size: 28rpx;
  font-weight: 900;
}

.remove {
  position: relative;
  z-index: 1;
  grid-column: 2 / 4;
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
