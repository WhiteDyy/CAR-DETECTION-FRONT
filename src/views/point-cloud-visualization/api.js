import { request } from '@/utils'

export default {
  // 加载数据文件夹
  loadDataFolder: (folderPath) => request.get('/point-cloud/folder/load', { params: { folderPath } }),
  // 获取帧数据
  getFrameData: (folderPath, frameNumber) => request.get('/point-cloud/frame', {
    params: { folderPath, frameNumber }
  })
}

