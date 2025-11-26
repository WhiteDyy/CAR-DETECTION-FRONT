import { request } from '@/utils'

export default {
  getOlw: data => request.post('/olw/search', data),
}
