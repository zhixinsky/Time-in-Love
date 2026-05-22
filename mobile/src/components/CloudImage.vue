<template>
  <image v-if="displaySrc" :class="imageClass" :src="displaySrc" :mode="mode" />
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { resolveCloudFileUrl } from '../utils/cloud-file'

const props = defineProps({
  fileId: { type: String, default: '' },
  mode: { type: String, default: 'aspectFit' },
  imageClass: { type: String, default: '' }
})

const displaySrc = ref('')

async function load() {
  if (!props.fileId) {
    displaySrc.value = ''
    return
  }
  try {
    displaySrc.value = await resolveCloudFileUrl(props.fileId)
  } catch (e) {
    console.warn('[CloudImage] resolve failed', props.fileId, e)
    displaySrc.value = ''
  }
}

onMounted(load)
watch(() => props.fileId, load)
</script>
