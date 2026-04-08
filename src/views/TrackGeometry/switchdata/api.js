import { request } from '@/utils'

export default {
  getBatchList: params => request.get('/switch_manual_batches', { params }),
  createBatch: data => request.post('/switch_manual_batches', data),
}
