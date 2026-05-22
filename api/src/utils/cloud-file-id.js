/** 微信云托管对象存储 CloudID：cloud://环境ID.存储桶ID/文件路径 */
export function toCloudFileId(envId, bucket, key) {
  const env = String(envId || '').trim()
  const store = String(bucket || '').trim()
  const path = String(key || '').replace(/^\//, '')
  if (!env || !store || !path) return ''
  return `cloud://${env}.${store}/${path}`
}
