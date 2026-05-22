<template>
  <image
    v-if="displaySrc"
    :class="imageClass"
    :src="displaySrc"
    :mode="mode"
    @error="onImageError"
  />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { resolveCloudFileUrl } from '../services/request'

const props = defineProps({
  fileId: { type: String, default: '' },
  mode: { type: String, default: 'aspectFit' },
  imageClass: { type: String, default: '' }
})

const displaySrc = ref('')
let loadToken = 0

async function load() {
  const token = ++loadToken
  if (!props.fileId) {
    displaySrc.value = ''
    return
  }
  if (!props.fileId.startsWith('cloud://')) {
    displaySrc.value = props.fileId
    return
  }
  try {
    const url = await resolveCloudFileUrl(props.fileId, { audio: false })
    if (token !== loadToken) return
    displaySrc.value = url || ''
  } catch (e) {
    if (token !== loadToken) return
    console.warn('[CloudImage] resolve failed', props.fileId, e)
    displaySrc.value = ''
  }
}

function onImageError() {
  if (!props.fileId?.startsWith('cloud://')) return
  displaySrc.value = ''
  load()
}

onMounted(load)
watch(() => props.fileId, load)
</script>
