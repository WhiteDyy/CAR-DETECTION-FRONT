import { request } from '@/utils'

export default {
  getWearTable: data => request.post('/wear/search', data),
}
