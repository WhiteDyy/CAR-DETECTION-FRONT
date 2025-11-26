import { request } from '@/utils'

export default {
  getTaqData: data => request.post('/taq/search', data),
}
